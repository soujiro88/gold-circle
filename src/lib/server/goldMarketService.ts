import { Candle, TimeFrame } from '@/types/trading';
import { BASE_GOLD_PRICE } from '@/constants/trading';

export interface FetchedMarketData {
  candles: Candle[];
  currentPrice: number;
  dailyHigh: number;
  dailyLow: number;
  dailyChangePercent: number;
  provider: string;
}

interface MetaTraderPrice {
  bid?: number;
  ask?: number;
  time?: string;
}

interface MetaTraderCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  tickVolume?: number;
  volume?: number;
}

function getMetaApiConfig() {
  const token = process.env.METAAPI_TOKEN;
  const accountId = process.env.METAAPI_ACCOUNT_ID;
  if (!token || !accountId) {
    throw new Error('Feed MetaTrader belum dikonfigurasi. Isi METAAPI_TOKEN dan METAAPI_ACCOUNT_ID.');
  }
  return {
    token,
    accountId,
    symbol: process.env.MT5_GOLD_SYMBOL || 'XAUUSD',
    clientBaseUrl: (process.env.METAAPI_BASE_URL || 'https://mt-client-api-v1.new-york.agiliumtrade.ai').replace(/\/$/, ''),
    marketDataBaseUrl: (process.env.METAAPI_MARKET_DATA_BASE_URL || 'https://mt-market-data-client-api-v1.new-york.agiliumtrade.ai').replace(/\/$/, ''),
  };
}

async function fetchMetaTraderPrice(): Promise<{ price: number; time: string }> {
  const config = getMetaApiConfig();
  const url = `${config.clientBaseUrl}/users/current/accounts/${encodeURIComponent(config.accountId)}/symbols/${encodeURIComponent(config.symbol)}/current-price?keepSubscription=true`;
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'auth-token': config.token },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`MetaTrader API mengembalikan HTTP ${response.status}. Periksa akun dan simbol ${config.symbol}.`);

  const quote: MetaTraderPrice = await response.json();
  if (typeof quote.bid !== 'number' || typeof quote.ask !== 'number' || quote.bid <= 0 || quote.ask <= 0) {
    throw new Error(`Kuotasi MetaTrader untuk ${config.symbol} tidak valid.`);
  }
  return { price: Number(((quote.bid + quote.ask) / 2).toFixed(2)), time: quote.time || new Date().toISOString() };
}

/**
 * Fetch raw candle array from Physical Spot Gold market (XAU/USD Spot • 1:1 LBMA Gold)
 */
export async function fetchSpotGoldData(timeframe: TimeFrame): Promise<{
  candles: Candle[];
}> {
  const config = getMetaApiConfig();
  const url = `${config.marketDataBaseUrl}/users/current/accounts/${encodeURIComponent(config.accountId)}/historical-market-data/symbols/${encodeURIComponent(config.symbol)}/timeframes/${timeframe}/candles?limit=250`;
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'auth-token': config.token },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Data candle MetaTrader mengembalikan HTTP ${response.status}. Periksa simbol ${config.symbol}.`);
  const data: MetaTraderCandle[] = await response.json();
  const candles = data.map((candle) => ({
    time: Math.floor(new Date(candle.time).getTime() / 1000),
    open: Number(candle.open.toFixed(2)),
    high: Number(candle.high.toFixed(2)),
    low: Number(candle.low.toFixed(2)),
    close: Number(candle.close.toFixed(2)),
    volume: candle.tickVolume ?? candle.volume ?? 0,
  })).filter((candle) => Number.isFinite(candle.time));
  if (!candles.length) throw new Error(`MetaTrader belum memberikan candle untuk ${config.symbol}.`);
  return { candles };
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
 * High-level service function to obtain real-time SPOT Gold market dataset
 */
export async function getLiveGoldMarketData(timeframe: TimeFrame): Promise<FetchedMarketData> {
  const [{ candles: rawCandles }, quote] = await Promise.all([
    fetchSpotGoldData(timeframe),
    fetchMetaTraderPrice(),
  ]);

  let finalCandles = timeframe === '4h' ? aggregateCandlesTo4H(rawCandles) : rawCandles;
  if (finalCandles.length > 250) {
    finalCandles = finalCandles.slice(finalCandles.length - 250);
  }

  const spotPrice = quote.price;

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

  const prevClose = finalCandles.length > 1 ? finalCandles[finalCandles.length - 2].close : spotPrice;
  const dailyChangePercent = Number((((spotPrice - prevClose) / prevClose) * 100).toFixed(2));

  return {
    candles: finalCandles,
    currentPrice: spotPrice,
    dailyHigh: finalCandles.length ? Math.max(...finalCandles.map((candle) => candle.high), spotPrice) : spotPrice,
    dailyLow: finalCandles.length ? Math.min(...finalCandles.map((candle) => candle.low), spotPrice) : spotPrice,
    dailyChangePercent,
    provider: `MetaTrader 5 (${process.env.MT5_GOLD_SYMBOL || 'XAUUSD'}) · ${quote.time}`,
  };
}
