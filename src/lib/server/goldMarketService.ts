import { Candle, TimeFrame } from '@/types/trading';
import { SPOT_TIMEFRAME_MAP, SPOT_GOLD_SYMBOL, BASE_GOLD_PRICE } from '@/constants/trading';

interface YahooChartPayload {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        regularMarketDayHigh?: number;
        regularMarketDayLow?: number;
        previousClose?: number;
      };
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: (number | null)[];
          high?: (number | null)[];
          low?: (number | null)[];
          close?: (number | null)[];
          volume?: (number | null)[];
        }>;
      };
    }>;
  };
}

export interface FetchedMarketData {
  candles: Candle[];
  currentPrice: number;
  dailyHigh: number;
  dailyLow: number;
  dailyChangePercent: number;
  provider: string;
}

/**
 * Fetch raw candle array from Physical Spot Gold market (XAU/USD Spot • 1:1 LBMA Gold)
 */
export async function fetchSpotGoldData(timeframe: TimeFrame): Promise<{
  candles: Candle[];
  meta?: {
    regularMarketDayHigh?: number;
    regularMarketDayLow?: number;
    previousClose?: number;
    regularMarketPrice?: number;
  };
}> {
  const cfg = SPOT_TIMEFRAME_MAP[timeframe] || SPOT_TIMEFRAME_MAP['1h'];
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${SPOT_GOLD_SYMBOL}?interval=${cfg.interval}&range=${cfg.range}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
    next: { revalidate: 10 },
  });

  if (!res.ok) {
    throw new Error(`Spot Gold HTTP status: ${res.status}`);
  }

  const payload: YahooChartPayload = await res.json();
  const result = payload.chart?.result?.[0];

  if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
    throw new Error('Format data Pasar Spot Emas tidak valid.');
  }

  const timestamps = result.timestamp;
  const quote = result.indicators.quote[0];
  const candles: Candle[] = [];

  for (let i = 0; i < timestamps.length; i++) {
    const o = quote.open?.[i];
    const h = quote.high?.[i];
    const l = quote.low?.[i];
    const c = quote.close?.[i];
    const v = quote.volume?.[i] ?? 100;

    if (o != null && h != null && l != null && c != null) {
      candles.push({
        time: timestamps[i],
        open: Number(o.toFixed(2)),
        high: Number(h.toFixed(2)),
        low: Number(l.toFixed(2)),
        close: Number(c.toFixed(2)),
        volume: v,
      });
    }
  }

  return { candles, meta: result.meta };
}

/**
 * Aggregate 60m candles into 4-hour candles for spot market
 */
export function aggregateCandlesTo4H(rawCandles: Candle[]): Candle[] {
  if (rawCandles.length === 0) return [];
  const FOUR_HOURS = 14400;
  const aggregated: Candle[] = [];

  let currentGroup: Candle[] = [];
  let currentPeriodStart = Math.floor(rawCandles[0].time / FOUR_HOURS) * FOUR_HOURS;

  for (const candle of rawCandles) {
    const period = Math.floor(candle.time / FOUR_HOURS) * FOUR_HOURS;
    if (period === currentPeriodStart) {
      currentGroup.push(candle);
    } else {
      if (currentGroup.length > 0) {
        aggregated.push({
          time: currentPeriodStart,
          open: currentGroup[0].open,
          high: Math.max(...currentGroup.map((c) => c.high)),
          low: Math.min(...currentGroup.map((c) => c.low)),
          close: currentGroup[currentGroup.length - 1].close,
          volume: currentGroup.reduce((acc, c) => acc + c.volume, 0),
        });
      }
      currentPeriodStart = period;
      currentGroup = [candle];
    }
  }

  if (currentGroup.length > 0) {
    aggregated.push({
      time: currentPeriodStart,
      open: currentGroup[0].open,
      high: Math.max(...currentGroup.map((c) => c.high)),
      low: Math.min(...currentGroup.map((c) => c.low)),
      close: currentGroup[currentGroup.length - 1].close,
      volume: currentGroup.reduce((acc, c) => acc + c.volume, 0),
    });
  }

  return aggregated;
}

/**
 * Fetch spot price from Gold-API (XAU/USD Spot)
 */
export async function fetchSpotPrice(): Promise<number | null> {
  try {
    const res = await fetch('https://api.gold-api.com/price/XAU', {
      headers: { Accept: 'application/json' },
      next: { revalidate: 5 },
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.price === 'number') {
        return Number(data.price.toFixed(2));
      }
    }
  } catch {
    // fallback
  }
  return null;
}

/**
 * High-level service function to obtain real-time SPOT Gold market dataset
 */
export async function getLiveGoldMarketData(timeframe: TimeFrame): Promise<FetchedMarketData> {
  const { candles: rawCandles, meta } = await fetchSpotGoldData(timeframe);

  let finalCandles = timeframe === '4h' ? aggregateCandlesTo4H(rawCandles) : rawCandles;
  if (finalCandles.length > 250) {
    finalCandles = finalCandles.slice(finalCandles.length - 250);
  }

  // Pure spot price from Gold-API XAU or Spot Candle close
  const latestCandleClose = finalCandles[finalCandles.length - 1]?.close ?? BASE_GOLD_PRICE;
  const spotPrice = (await fetchSpotPrice()) ?? meta?.regularMarketPrice ?? latestCandleClose;

  // Align latest spot candle close with active spot fixing
  if (finalCandles.length > 0) {
    const lastIdx = finalCandles.length - 1;
    finalCandles[lastIdx] = {
      ...finalCandles[lastIdx],
      close: spotPrice,
      high: Math.max(finalCandles[lastIdx].high, spotPrice),
      low: Math.min(finalCandles[lastIdx].low, spotPrice),
    };
  }

  const prevClose = meta?.previousClose ?? finalCandles[0]?.open ?? spotPrice;
  const dailyChangePercent = Number((((spotPrice - prevClose) / prevClose) * 100).toFixed(2));

  return {
    candles: finalCandles,
    currentPrice: spotPrice,
    dailyHigh: meta?.regularMarketDayHigh ?? Number((spotPrice * 1.006).toFixed(2)),
    dailyLow: meta?.regularMarketDayLow ?? Number((spotPrice * 0.994).toFixed(2)),
    dailyChangePercent,
    provider: 'Pasar Spot Emas Dunia (XAU/USD Spot • London LBMA)',
  };
}
