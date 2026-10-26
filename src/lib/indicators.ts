import { Candle, BollingerBandPoint, MAPoint } from '../types/trading';

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(candles: Candle[], period: number): MAPoint[] {
  const result: MAPoint[] = [];
  if (candles.length < period) return result;

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  result.push({
    time: candles[period - 1].time,
    value: Number((sum / period).toFixed(2)),
  });

  for (let i = period; i < candles.length; i++) {
    sum += candles[i].close - candles[i - period].close;
    result.push({
      time: candles[i].time,
      value: Number((sum / period).toFixed(2)),
    });
  }

  return result;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(candles: Candle[], period: number): MAPoint[] {
  const result: MAPoint[] = [];
  if (candles.length < period) return result;

  const k = 2 / (period + 1);

  // Initial SMA as first EMA
  let initialSum = 0;
  for (let i = 0; i < period; i++) {
    initialSum += candles[i].close;
  }
  let currentEma = initialSum / period;

  result.push({
    time: candles[period - 1].time,
    value: Number(currentEma.toFixed(2)),
  });

  for (let i = period; i < candles.length; i++) {
    currentEma = candles[i].close * k + currentEma * (1 - k);
    result.push({
      time: candles[i].time,
      value: Number(currentEma.toFixed(2)),
    });
  }

  return result;
}

/**
 * Calculate Bollinger Bands
 * Typically 20 period SMA with 2 Standard Deviations
 */
export function calculateBollingerBands(
  candles: Candle[],
  period: number = 20,
  multiplier: number = 2
): BollingerBandPoint[] {
  const result: BollingerBandPoint[] = [];
  if (candles.length < period) return result;

  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1);
    const sum = slice.reduce((acc, c) => acc + c.close, 0);
    const mean = sum / period;

    const squaredDifferences = slice.map((c) => Math.pow(c.close - mean, 2));
    const variance =
      squaredDifferences.reduce((acc, val) => acc + val, 0) / period;
    const stdDev = Math.sqrt(variance);

    const upper = mean + multiplier * stdDev;
    const lower = mean - multiplier * stdDev;
    const bandwidth = mean !== 0 ? ((upper - lower) / mean) * 100 : 0;
    const currentClose = candles[i].close;
    const percentB =
      upper - lower !== 0 ? (currentClose - lower) / (upper - lower) : 0.5;

    result.push({
      time: candles[i].time,
      upper: Number(upper.toFixed(2)),
      middle: Number(mean.toFixed(2)),
      lower: Number(lower.toFixed(2)),
      bandwidth: Number(bandwidth.toFixed(3)),
      percentB: Number(percentB.toFixed(3)),
    });
  }

  return result;
}

/**
 * Calculate Relative Strength Index (RSI - 14)
 */
export function calculateRSI(
  candles: Candle[],
  period: number = 14
): { time: number; value: number }[] {
  const result: { time: number; value: number }[] = [];
  if (candles.length <= period) return result;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) {
      gains += diff;
    } else {
      losses -= diff;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = 100 - 100 / (1 + rs);

  result.push({
    time: candles[period].time,
    value: Number(rsi.toFixed(2)),
  });

  for (let i = period + 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = 100 - 100 / (1 + rs);

    result.push({
      time: candles[i].time,
      value: Number(rsi.toFixed(2)),
    });
  }

  return result;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * Standard: Fast 12, Slow 26, Signal 9
 */
export function calculateMACD(
  candles: Candle[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { time: number; macd: number; signal: number; histogram: number }[] {
  const result: { time: number; macd: number; signal: number; histogram: number }[] = [];
  if (candles.length < slowPeriod + signalPeriod) return result;

  const fastEMA = calculateEMA(candles, fastPeriod);
  const slowEMA = calculateEMA(candles, slowPeriod);

  // Match timestamps between slow and fast
  const macdLinePoints: { time: number; value: number }[] = [];
  const slowMap = new Map<number, number>();
  slowEMA.forEach((p) => slowMap.set(p.time, p.value));

  for (const fastPoint of fastEMA) {
    const slowVal = slowMap.get(fastPoint.time);
    if (slowVal !== undefined) {
      macdLinePoints.push({
        time: fastPoint.time,
        value: fastPoint.value - slowVal,
      });
    }
  }

  if (macdLinePoints.length < signalPeriod) return result;

  // Calculate Signal line (EMA of MACD line)
  const k = 2 / (signalPeriod + 1);
  let initialSum = 0;
  for (let i = 0; i < signalPeriod; i++) {
    initialSum += macdLinePoints[i].value;
  }
  let signalEMA = initialSum / signalPeriod;

  for (let i = signalPeriod - 1; i < macdLinePoints.length; i++) {
    if (i >= signalPeriod) {
      signalEMA = macdLinePoints[i].value * k + signalEMA * (1 - k);
    }
    const macdVal = macdLinePoints[i].value;
    const hist = macdVal - signalEMA;

    result.push({
      time: macdLinePoints[i].time,
      macd: Number(macdVal.toFixed(2)),
      signal: Number(signalEMA.toFixed(2)),
      histogram: Number(hist.toFixed(2)),
    });
  }

  return result;
}

/**
 * Calculate Average True Range (ATR - 14)
 */
export function calculateATR(candles: Candle[], period: number = 14): number {
  if (candles.length < 2) return 10.0; // fallback standard gold range

  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trs.push(tr);
  }

  if (trs.length < period) {
    const sum = trs.reduce((a, b) => a + b, 0);
    return Number((sum / trs.length).toFixed(2));
  }

  let atr = trs.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < trs.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period;
  }

  return Number(atr.toFixed(2));
}

/**
 * Calculate Standard Pivot Points
 */
export function calculatePivotPoints(candles: Candle[]): {
  pivot: number;
  r1: number;
  r2: number;
  r3: number;
  s1: number;
  s2: number;
  s3: number;
} {
  if (candles.length === 0) {
    return { pivot: 0, r1: 0, r2: 0, r3: 0, s1: 0, s2: 0, s3: 0 };
  }

  // Use the last completed candle (or previous day candle)
  const last = candles[candles.length - 1];
  const h = last.high;
  const l = last.low;
  const c = last.close;

  const pivot = (h + l + c) / 3;
  const r1 = 2 * pivot - l;
  const s1 = 2 * pivot - h;
  const r2 = pivot + (h - l);
  const s2 = pivot - (h - l);
  const r3 = h + 2 * (pivot - l);
  const s3 = l - 2 * (h - pivot);

  return {
    pivot: Number(pivot.toFixed(2)),
    r1: Number(r1.toFixed(2)),
    r2: Number(r2.toFixed(2)),
    r3: Number(r3.toFixed(2)),
    s1: Number(s1.toFixed(2)),
    s2: Number(s2.toFixed(2)),
    s3: Number(s3.toFixed(2)),
  };
}
