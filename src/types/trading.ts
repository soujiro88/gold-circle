export type TimeFrame = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d';

export interface Candle {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BollingerBandPoint {
  time: number;
  upper: number;
  middle: number;
  lower: number;
  bandwidth: number;
  percentB: number;
}

export interface MAPoint {
  time: number;
  value: number;
}

export interface TechnicalIndicators {
  bollinger: BollingerBandPoint[];
  sma20: MAPoint[];
  sma50: MAPoint[];
  ema200: MAPoint[];
  rsi: { time: number; value: number }[];
  macd: {
    time: number;
    macd: number;
    signal: number;
    histogram: number;
  }[];
  atr: number;
  pivots: {
    pivot: number;
    r1: number;
    r2: number;
    r3: number;
    s1: number;
    s2: number;
    s3: number;
  };
}

export type SignalType = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';

export interface PredictionAnalysis {
  signal: SignalType;
  confidence: number; // 0 to 100
  bullishScore: number;
  bearishScore: number;
  predictedTrend: 'UP' | 'DOWN' | 'SIDEWAYS';
  currentPrice: number;
  targetPrice1H: number;
  targetPrice4H: number;
  targetPrice24H: number;
  expectedPips: number;
  entryZone: {
    min: number;
    max: number;
  };
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  riskRewardRatio: string;
  summaryReason: string;
  reasons: string[];
  indicatorBreakdown: {
    bollinger: {
      status: 'OVERSOLD' | 'OVERBOUGHT' | 'SQUEEZE' | 'EXPANSION' | 'NEUTRAL';
      text: string;
      score: number;
    };
    movingAverage: {
      status: 'STRONG_BULLISH' | 'BULLISH' | 'DEATH_CROSS' | 'GOLDEN_CROSS' | 'BEARISH' | 'NEUTRAL';
      text: string;
      score: number;
    };
    rsi: {
      value: number;
      status: 'OVERSOLD' | 'OVERBOUGHT' | 'BULLISH_MOMENTUM' | 'BEARISH_MOMENTUM' | 'NEUTRAL';
      text: string;
      score: number;
    };
    macd: {
      status: 'BULLISH_CROSS' | 'BEARISH_CROSS' | 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
      text: string;
      score: number;
    };
  };
  timeframe: TimeFrame;
  generatedAt: number;
}

export interface MultiTimeframeSummary {
  timeframe: TimeFrame;
  name: string;
  signal: SignalType;
  trend: 'UP' | 'DOWN' | 'SIDEWAYS';
  bbStatus: string;
  maStatus: string;
  rsiValue: number;
}

export interface TradeHistoryItem {
  id: string;
  time: string;
  pair: string;
  timeframe: TimeFrame;
  signal: SignalType;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  exitPrice?: number;
  pips: number;
  status: 'HIT_TP' | 'HIT_SL' | 'IN_PROGRESS';
}
