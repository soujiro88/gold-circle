import { TimeFrame } from '@/types/trading';

// Current benchmark Spot Gold price (USD per troy ounce)
export const BASE_GOLD_PRICE = 4136.0;

export const GOLD_CONTRACT_SIZE = 100; // 1 Standard Lot = 100 Troy Ounces

// Ticker symbol for continuous 24/7 Physical Spot Gold (1:1 LBMA Gold)
export const SPOT_GOLD_SYMBOL = 'PAXG-USD';

export const TIMEFRAME_SECONDS: Record<TimeFrame, number> = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '30m': 1800,
  '1h': 3600,
  '4h': 14400,
  '1d': 86400,
};

export const TIMEFRAME_OPTIONS: { key: TimeFrame; label: string; fullLabel: string }[] = [
  { key: '1m', label: '1M', fullLabel: 'Scalping (1M)' },
  { key: '5m', label: '5M', fullLabel: 'Scalping (5M)' },
  { key: '15m', label: '15M', fullLabel: 'Intraday (15M)' },
  { key: '30m', label: '30M', fullLabel: 'Intraday (30M)' },
  { key: '1h', label: '1H', fullLabel: 'Swing (1H)' },
  { key: '4h', label: '4H', fullLabel: 'Trend (4H)' },
  { key: '1d', label: '1D', fullLabel: 'Daily Macro (1D)' },
];

export const SPOT_TIMEFRAME_MAP: Record<TimeFrame, { interval: string; range: string }> = {
  '1m': { interval: '1m', range: '1d' },
  '5m': { interval: '5m', range: '2d' },
  '15m': { interval: '15m', range: '5d' },
  '30m': { interval: '30m', range: '5d' },
  '1h': { interval: '60m', range: '1mo' },
  '4h': { interval: '60m', range: '3mo' },
  '1d': { interval: '1d', range: '1y' },
};
