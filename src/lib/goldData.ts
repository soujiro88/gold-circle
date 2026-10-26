import { Candle, TimeFrame } from '../types/trading';

const TIMEFRAME_SECONDS: Record<TimeFrame, number> = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '30m': 1800,
  '1h': 3600,
  '4h': 14400,
  '1d': 86400,
};

// Benchmark current Spot Gold price (USD per troy ounce)
export const BASE_GOLD_PRICE = 4136.0;

export interface RealMarketResponse {
  success: boolean;
  source: 'REAL_MARKET' | 'FALLBACK';
  provider?: string;
  currentPrice: number;
  dailyHigh: number;
  dailyLow: number;
  dailyChangePercent: number;
  candles: Candle[];
  timestamp: number;
}

/**
 * Fetch real live SPOT candlestick data and spot prices from the API route
 */
export async function fetchLiveGoldMarketData(
  timeframe: TimeFrame = '1h'
): Promise<RealMarketResponse> {
  try {
    const res = await fetch(`/api/gold?timeframe=${timeframe}`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.candles) && data.candles.length >= 20) {
        return data as RealMarketResponse;
      }
    }
  } catch {
    // network or offline fallback
  }

  // Graceful fallback to calibrated synthetic spot data
  const fallbackCandles = generateGoldCandles(timeframe, 150);
  const lastPrice = fallbackCandles[fallbackCandles.length - 1]?.close ?? BASE_GOLD_PRICE;

  return {
    success: true,
    source: 'FALLBACK',
    provider: 'Simulasi Terkalibrasi Pasar Spot',
    currentPrice: lastPrice,
    dailyHigh: Number((lastPrice + 20.5).toFixed(2)),
    dailyLow: Number((lastPrice - 22.8).toFixed(2)),
    dailyChangePercent: +0.48,
    candles: fallbackCandles,
    timestamp: Date.now(),
  };
}

/**
 * Generate synthetic realistic candlestick historical data for XAU/USD Spot
 */
export function generateGoldCandles(
  timeframe: TimeFrame = '1h',
  count: number = 200
): Candle[] {
  const step = TIMEFRAME_SECONDS[timeframe];
  const now = Math.floor(Date.now() / 1000);
  const alignedNow = Math.floor(now / step) * step;
  const startTime = alignedNow - count * step;

  const candles: Candle[] = [];
  let currentPrice = BASE_GOLD_PRICE - 25;

  const volatilityMap: Record<TimeFrame, number> = {
    '1m': 1.0,
    '5m': 2.0,
    '15m': 3.8,
    '30m': 6.0,
    '1h': 10.5,
    '4h': 22.0,
    '1d': 40.0,
  };
  const vol = volatilityMap[timeframe];

  for (let i = 0; i < count; i++) {
    const candleTime = startTime + i * step;

    const cycle1 = Math.sin((i / count) * 4 * Math.PI) * (vol * 1.5);
    const cycle2 = Math.cos((i / count) * 8 * Math.PI) * (vol * 0.8);
    const microShock = (Math.random() - 0.485) * vol * 1.3;

    const open = currentPrice;
    const delta = cycle1 * 0.2 + cycle2 * 0.15 + microShock;
    const close = Math.max(3800, open + delta);

    const maxOC = Math.max(open, close);
    const minOC = Math.min(open, close);

    const upperWick = Math.random() * vol * 0.65;
    const lowerWick = Math.random() * vol * 0.65;

    const high = maxOC + upperWick;
    const low = Math.max(minOC - lowerWick, 3750);

    const volume = Math.floor(
      1500 + Math.random() * 4500 + Math.abs(close - open) * 400
    );

    candles.push({
      time: candleTime,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });

    currentPrice = close;
  }

  return candles;
}

/**
 * Simulate the next incoming spot tick for live streaming
 */
export function simulateNextTick(
  lastCandle: Candle,
  timeframe: TimeFrame
): { updatedCandle: Candle; isNewCandle: boolean } {
  const step = TIMEFRAME_SECONDS[timeframe];
  const now = Math.floor(Date.now() / 1000);

  const currentInterval = Math.floor(now / step) * step;
  const isNewCandle = currentInterval > lastCandle.time;

  const volatilityMap: Record<TimeFrame, number> = {
    '1m': 0.35,
    '5m': 0.65,
    '15m': 1.1,
    '30m': 1.8,
    '1h': 2.8,
    '4h': 5.2,
    '1d': 8.5,
  };
  const microVol = volatilityMap[timeframe];

  const tickChange = (Math.random() - 0.495) * microVol;

  if (isNewCandle) {
    const newOpen = lastCandle.close;
    const newClose = Number((newOpen + tickChange).toFixed(2));
    const newHigh = Number((Math.max(newOpen, newClose) + Math.random() * 0.25).toFixed(2));
    const newLow = Number((Math.min(newOpen, newClose) - Math.random() * 0.25).toFixed(2));

    return {
      updatedCandle: {
        time: currentInterval,
        open: newOpen,
        high: newHigh,
        low: newLow,
        close: newClose,
        volume: Math.floor(50 + Math.random() * 100),
      },
      isNewCandle: true,
    };
  } else {
    const updatedClose = Number((lastCandle.close + tickChange).toFixed(2));
    const updatedHigh = Math.max(lastCandle.high, updatedClose);
    const updatedLow = Math.min(lastCandle.low, updatedClose);
    const updatedVolume = lastCandle.volume + Math.floor(10 + Math.random() * 30);

    return {
      updatedCandle: {
        ...lastCandle,
        high: Number(updatedHigh.toFixed(2)),
        low: Number(updatedLow.toFixed(2)),
        close: updatedClose,
        volume: updatedVolume,
      },
      isNewCandle: false,
    };
  }
}

/**
 * Spot Gold Market Macro Context (DXY, 10Y Treasury, Bull/Bear sentiment)
 */
export function getGoldMarketContext(currentGoldPrice: number) {
  const dxyValue = 104.15 - (currentGoldPrice - 4130) * 0.015;
  const us10Y = 4.2 - (currentGoldPrice - 4130) * 0.002;

  return {
    dxy: Number(Math.max(98, Math.min(108, dxyValue)).toFixed(2)),
    dxyChange: -0.28,
    us10YYield: Number(Math.max(3.5, Math.min(5.0, us10Y)).toFixed(2)),
    us10YChange: -0.03,
    goldSpread: 0.2, // $0.20 typical spot gold spread
    dailyHigh: Number((currentGoldPrice + 18.5).toFixed(2)),
    dailyLow: Number((currentGoldPrice - 21.2).toFixed(2)),
    dailyChangePercent: +0.48,
    bullishSentimentPercent: 70,
    bearishSentimentPercent: 30,
    session: 'London & Zurich Fixings • OTC Spot Market',
  };
}
