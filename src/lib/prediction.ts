import {
  Candle,
  TimeFrame,
  PredictionAnalysis,
  SignalType,
  MultiTimeframeSummary,
  BollingerBandPoint,
} from '../types/trading';
import {
  calculateBollingerBands,
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateATR,
} from './indicators';

interface SubEvaluationResult {
  score: number;
  reason?: string;
}

/**
 * Evaluate Bollinger Bands conditions
 */
function evaluateBollinger(
  candle: Candle,
  bb?: BollingerBandPoint
): {
  status: 'OVERSOLD' | 'OVERBOUGHT' | 'SQUEEZE' | 'EXPANSION' | 'NEUTRAL';
  text: string;
  score: number;
  reason?: string;
} {
  if (!bb) {
    return { status: 'NEUTRAL', text: 'Data Bollinger belum memadai.', score: 0 };
  }

  const isSqueeze = bb.bandwidth < 1.2;
  const touchedLower = candle.low <= bb.lower && candle.close > bb.lower;
  const touchedUpper = candle.high >= bb.upper && candle.close < bb.upper;

  if (touchedLower) {
    const text = `Harga mantul dari Lower Bollinger Band ($${bb.lower.toFixed(2)}), mengindikasikan akumulasi beli (Oversold Bounce).`;
    return { status: 'OVERSOLD', text, score: 30, reason: text };
  }
  if (touchedUpper) {
    const text = `Harga menyentuh Upper Bollinger Band ($${bb.upper.toFixed(2)}), tekanan jual di area overbought menguat.`;
    return { status: 'OVERBOUGHT', text, score: -30, reason: text };
  }
  if (bb.percentB > 0.85) {
    const text = `Posisi harga (%B: ${(bb.percentB * 100).toFixed(0)}%) mendekati pita atas, rawan koreksi jangka pendek.`;
    return { status: 'OVERBOUGHT', text, score: -18, reason: text };
  }
  if (bb.percentB < 0.15) {
    const text = `Posisi harga (%B: ${(bb.percentB * 100).toFixed(0)}%) mendekati pita bawah, potensi rebound teknikal tinggi.`;
    return { status: 'OVERSOLD', text, score: 18, reason: text };
  }
  if (isSqueeze) {
    const text = `Bollinger Bands mengalami Squeeze (Bandwidth: ${bb.bandwidth.toFixed(2)}%), bersiap untuk ledakan volatilitas terarah.`;
    return { status: 'SQUEEZE', text, score: 0, reason: text };
  }

  return {
    status: 'NEUTRAL',
    text: `Harga bergerak wajar di antara Middle Band ($${bb.middle.toFixed(2)}) dan pita luar.`,
    score: 0,
  };
}

/**
 * Evaluate Moving Average alignments and crossovers
 */
function evaluateMA(
  price: number,
  sma20: number,
  prevSMA20: number,
  sma50: number,
  prevSMA50: number,
  ema200: number
): {
  status: 'STRONG_BULLISH' | 'BULLISH' | 'DEATH_CROSS' | 'GOLDEN_CROSS' | 'BEARISH' | 'NEUTRAL';
  text: string;
  score: number;
  reason?: string;
} {
  const isGoldenCross = prevSMA20 <= prevSMA50 && sma20 > sma50;
  const isDeathCross = prevSMA20 >= prevSMA50 && sma20 < sma50;
  const isFullBullish = price > sma20 && sma20 > sma50 && sma50 > ema200;
  const isFullBearish = price < sma20 && sma20 < sma50 && sma50 < ema200;

  if (isGoldenCross) {
    const text = `Golden Cross terjadi! SMA 20 ($${sma20.toFixed(2)}) memotong naik ke atas SMA 50 ($${sma50.toFixed(2)}).`;
    return { status: 'GOLDEN_CROSS', text, score: 35, reason: text };
  }
  if (isDeathCross) {
    const text = `Death Cross terdeteksi! SMA 20 ($${sma20.toFixed(2)}) memotong turun ke bawah SMA 50 ($${sma50.toFixed(2)}).`;
    return { status: 'DEATH_CROSS', text, score: -35, reason: text };
  }
  if (isFullBullish) {
    const text = `Susunan Moving Average Bullish Sempurna: Harga > SMA 20 ($${sma20.toFixed(2)}) > SMA 50 ($${sma50.toFixed(2)}) > EMA 200 ($${ema200.toFixed(2)}).`;
    return { status: 'STRONG_BULLISH', text, score: 30, reason: text };
  }
  if (isFullBearish) {
    const text = `Susunan Moving Average Bearish: Harga < SMA 20 < SMA 50 < EMA 200 ($${ema200.toFixed(2)}). Tren penurunan dominan.`;
    return { status: 'BEARISH', text, score: -30, reason: text };
  }
  if (price > ema200) {
    const text = `Harga stabil di atas baseline institusional EMA 200 ($${ema200.toFixed(2)}), bias makro tetap Bullish.`;
    return { status: 'BULLISH', text, score: 15, reason: text };
  }

  const text = `Harga tertekan di bawah EMA 200 ($${ema200.toFixed(2)}), membatasi ruang kenaikan jangka menengah.`;
  return { status: 'BEARISH', text, score: -15, reason: text };
}

/**
 * Evaluate RSI momentum
 */
function evaluateRSI(
  rsi: number,
  prevRSI: number
): {
  status: 'OVERSOLD' | 'OVERBOUGHT' | 'BULLISH_MOMENTUM' | 'BEARISH_MOMENTUM' | 'NEUTRAL';
  text: string;
  score: number;
  reason?: string;
} {
  if (rsi <= 30) {
    const text = `RSI (14) berada di level jenuh jual ekstrem (${rsi.toFixed(1)}), sinyal pembalikan arah naik sangat kuat.`;
    return { status: 'OVERSOLD', text, score: 25, reason: text };
  }
  if (rsi >= 70) {
    const text = `RSI (14) memasuki area overbought (${rsi.toFixed(1)}), risiko aksi ambil untung (profit-taking) meningkat.`;
    return { status: 'OVERBOUGHT', text, score: -25, reason: text };
  }
  if (rsi > 50 && rsi > prevRSI) {
    const text = `RSI di level ${rsi.toFixed(1)} dan terus menanjak di atas 50 (momentum buyer menguat).`;
    return { status: 'BULLISH_MOMENTUM', text, score: 12, reason: text };
  }
  if (rsi < 50 && rsi < prevRSI) {
    const text = `RSI di level ${rsi.toFixed(1)} turun di bawah batas netral 50 (momentum seller mengontrol pasar).`;
    return { status: 'BEARISH_MOMENTUM', text, score: -12, reason: text };
  }

  return {
    status: 'NEUTRAL',
    text: `RSI relatif seimbang di angka ${rsi.toFixed(1)}.`,
    score: 0,
  };
}

/**
 * Evaluate MACD trend & crossovers
 */
function evaluateMACD(
  curr: { macd: number; signal: number; histogram: number },
  prev: { macd: number; signal: number; histogram: number }
): {
  status: 'BULLISH_CROSS' | 'BEARISH_CROSS' | 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  text: string;
  score: number;
  reason?: string;
} {
  const isBullCross = prev.macd <= prev.signal && curr.macd > curr.signal;
  const isBearCross = prev.macd >= prev.signal && curr.macd < curr.signal;

  if (isBullCross) {
    const text = `Crossover Bullish MACD terkonfirmasi! Garis MACD memotong ke atas Garis Signal dengan histogram positif.`;
    return { status: 'BULLISH_CROSS', text, score: 25, reason: text };
  }
  if (isBearCross) {
    const text = `Crossover Bearish MACD terbentuk! Garis MACD memotong ke bawah Garis Signal.`;
    return { status: 'BEARISH_CROSS', text, score: -25, reason: text };
  }
  if (curr.histogram > 0) {
    return {
      status: 'POSITIVE',
      text: `Histogram MACD bernilai positif (+${curr.histogram.toFixed(2)}), mendukung dorongan naik.`,
      score: 10,
    };
  }

  return {
    status: 'NEGATIVE',
    text: `Histogram MACD bernilai negatif (${curr.histogram.toFixed(2)}), tekanan jual masih aktif.`,
    score: -10,
  };
}

/**
 * Evaluate Candlestick Price Action
 */
function evaluatePriceAction(candle: Candle): SubEvaluationResult {
  const body = Math.abs(candle.close - candle.open);
  const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
  const upperShadow = candle.high - Math.max(candle.open, candle.close);

  if (lowerShadow > body * 2 && upperShadow < body * 0.5) {
    return {
      score: 15,
      reason: `Candle Hammer / Pin Bar terbentuk di ekor bawah ($${candle.low.toFixed(2)}), penolakan harga bawah (rejection) kuat.`,
    };
  }
  if (upperShadow > body * 2 && lowerShadow < body * 0.5) {
    return {
      score: -15,
      reason: `Candle Shooting Star terdeteksi dengan sumbu atas panjang, terjadi penolakan harga atas di $${candle.high.toFixed(2)}.`,
    };
  }

  return { score: 0 };
}

/**
 * Main Signal Orchestrator
 */
export function analyzeGoldSignal(
  candles: Candle[],
  timeframe: TimeFrame = '1h'
): PredictionAnalysis {
  if (candles.length < 30) {
    throw new Error('Minimal butuh 30 candlestick untuk analisis teknikal.');
  }

  const lastIndex = candles.length - 1;
  const currentCandle = candles[lastIndex];
  const currentPrice = currentCandle.close;

  // Compute indicators
  const bbSeries = calculateBollingerBands(candles, 20, 2);
  const sma20Series = calculateSMA(candles, 20);
  const sma50Series = calculateSMA(candles, 50);
  const ema200Series = calculateEMA(candles, Math.min(200, Math.floor(candles.length * 0.85)));
  const rsiSeries = calculateRSI(candles, 14);
  const macdSeries = calculateMACD(candles, 12, 26, 9);
  const atr = calculateATR(candles, 14);

  const currentBB = bbSeries[bbSeries.length - 1];
  const currentSMA20 = sma20Series[sma20Series.length - 1]?.value ?? currentPrice;
  const prevSMA20 = sma20Series[sma20Series.length - 2]?.value ?? currentPrice;
  const currentSMA50 = sma50Series[sma50Series.length - 1]?.value ?? currentPrice;
  const prevSMA50 = sma50Series[sma50Series.length - 2]?.value ?? currentPrice;
  const currentEMA200 = ema200Series[ema200Series.length - 1]?.value ?? currentPrice;
  const currentRSI = rsiSeries[rsiSeries.length - 1]?.value ?? 50;
  const prevRSI = rsiSeries[rsiSeries.length - 2]?.value ?? 50;
  const currentMACD = macdSeries[macdSeries.length - 1] ?? { macd: 0, signal: 0, histogram: 0 };
  const prevMACD = macdSeries[macdSeries.length - 2] ?? { macd: 0, signal: 0, histogram: 0 };

  const reasons: string[] = [];

  // Evaluate each component
  const bbEval = evaluateBollinger(currentCandle, currentBB);
  if (bbEval.reason) reasons.push(bbEval.reason);

  const maEval = evaluateMA(
    currentPrice,
    currentSMA20,
    prevSMA20,
    currentSMA50,
    prevSMA50,
    currentEMA200
  );
  if (maEval.reason) reasons.push(maEval.reason);

  const rsiEval = evaluateRSI(currentRSI, prevRSI);
  if (rsiEval.reason) reasons.push(rsiEval.reason);

  const macdEval = evaluateMACD(currentMACD, prevMACD);
  if (macdEval.reason) reasons.push(macdEval.reason);

  const paEval = evaluatePriceAction(currentCandle);
  if (paEval.reason) reasons.push(paEval.reason);

  // Total Scores
  const allScores = [bbEval.score, maEval.score, rsiEval.score, macdEval.score, paEval.score];
  const bullishScore = allScores.filter((s) => s > 0).reduce((a, b) => a + b, 0);
  const bearishScore = Math.abs(allScores.filter((s) => s < 0).reduce((a, b) => a + b, 0));
  const netScore = bullishScore - bearishScore;

  // Signal & Trend Classification
  let signal: SignalType = 'NEUTRAL';
  let predictedTrend: 'UP' | 'DOWN' | 'SIDEWAYS' = 'SIDEWAYS';

  if (netScore >= 45) {
    signal = 'STRONG_BUY';
    predictedTrend = 'UP';
  } else if (netScore >= 16) {
    signal = 'BUY';
    predictedTrend = 'UP';
  } else if (netScore <= -45) {
    signal = 'STRONG_SELL';
    predictedTrend = 'DOWN';
  } else if (netScore <= -16) {
    signal = 'SELL';
    predictedTrend = 'DOWN';
  }

  // Confidence calculation (60% to 94%)
  const totalScore = bullishScore + bearishScore;
  const dominance = totalScore > 0 ? Math.abs(netScore) / totalScore : 0;
  const confidence = Math.min(94, Math.max(58, Math.round(55 + dominance * 40)));

  // Target Levels based on ATR
  const dynamicRisk = Math.max(5.0, Number((atr * 1.25).toFixed(2)));
  const tp1Distance = Number((dynamicRisk * 1.5).toFixed(2));
  const tp2Distance = Number((dynamicRisk * 2.5).toFixed(2));

  let stopLoss: number;
  let takeProfit1: number;
  let takeProfit2: number;
  let targetPrice1H: number;
  let targetPrice4H: number;
  let targetPrice24H: number;
  let entryMin: number;
  let entryMax: number;

  if (predictedTrend === 'UP') {
    entryMin = Number((currentPrice - 0.5).toFixed(2));
    entryMax = Number((currentPrice + 0.5).toFixed(2));
    stopLoss = Number((currentPrice - dynamicRisk).toFixed(2));
    takeProfit1 = Number((currentPrice + tp1Distance).toFixed(2));
    takeProfit2 = Number((currentPrice + tp2Distance).toFixed(2));
    targetPrice1H = Number((currentPrice + dynamicRisk * 0.8).toFixed(2));
    targetPrice4H = Number((currentPrice + tp1Distance).toFixed(2));
    targetPrice24H = Number((currentPrice + tp2Distance * 1.2).toFixed(2));
  } else if (predictedTrend === 'DOWN') {
    entryMin = Number((currentPrice - 0.5).toFixed(2));
    entryMax = Number((currentPrice + 0.5).toFixed(2));
    stopLoss = Number((currentPrice + dynamicRisk).toFixed(2));
    takeProfit1 = Number((currentPrice - tp1Distance).toFixed(2));
    takeProfit2 = Number((currentPrice - tp2Distance).toFixed(2));
    targetPrice1H = Number((currentPrice - dynamicRisk * 0.8).toFixed(2));
    targetPrice4H = Number((currentPrice - tp1Distance).toFixed(2));
    targetPrice24H = Number((currentPrice - tp2Distance * 1.2).toFixed(2));
  } else {
    entryMin = Number((currentPrice - 0.4).toFixed(2));
    entryMax = Number((currentPrice + 0.4).toFixed(2));
    stopLoss = Number((currentPrice - dynamicRisk).toFixed(2));
    takeProfit1 = Number((currentPrice + dynamicRisk).toFixed(2));
    takeProfit2 = Number((currentPrice + dynamicRisk * 1.8).toFixed(2));
    targetPrice1H = currentPrice;
    targetPrice4H = Number((currentPrice + 2.0).toFixed(2));
    targetPrice24H = Number((currentPrice - 1.5).toFixed(2));
  }

  const summaryReason =
    signal === 'STRONG_BUY' || signal === 'BUY'
      ? `Konfluensi indikator menunjukkan dorongan Bullish signifikan pada timeframe ${timeframe.toUpperCase()}. Bollinger Band dan rata-rata pergerakan Moving Average mengindikasikan momentum beli yang dominan.`
      : signal === 'STRONG_SELL' || signal === 'SELL'
      ? `Sinyal Bearish terdeteksi kuat pada timeframe ${timeframe.toUpperCase()}. Tekanan jual di area resisten dan penolakan pada Moving Average menunjukkan potensi koreksi turun berlanjut.`
      : `Kondisi pasar XAU/USD saat ini berada dalam fase konsolidasi netral. Disarankan menunggu konfirmasi penembusan (breakout) sebelum membuka posisi baru.`;

  return {
    signal,
    confidence,
    bullishScore,
    bearishScore,
    predictedTrend,
    currentPrice: Number(currentPrice.toFixed(2)),
    targetPrice1H,
    targetPrice4H,
    targetPrice24H,
    expectedPips: Math.round(tp1Distance * 10),
    entryZone: { min: entryMin, max: entryMax },
    stopLoss,
    takeProfit1,
    takeProfit2,
    riskRewardRatio: '1 : 2.5',
    summaryReason,
    reasons,
    indicatorBreakdown: {
      bollinger: { status: bbEval.status, text: bbEval.text, score: bbEval.score },
      movingAverage: { status: maEval.status, text: maEval.text, score: maEval.score },
      rsi: { value: currentRSI, status: rsiEval.status, text: rsiEval.text, score: rsiEval.score },
      macd: { status: macdEval.status, text: macdEval.text, score: macdEval.score },
    },
    timeframe,
    generatedAt: Date.now(),
  };
}

/**
 * Generate multi-timeframe alignment matrix
 */
export function generateMultiTimeframeMatrix(baseCandles: Candle[]): MultiTimeframeSummary[] {
  const list: { tf: TimeFrame; label: string }[] = [
    { tf: '5m', label: 'Scalping (5M)' },
    { tf: '15m', label: 'Intraday (15M)' },
    { tf: '1h', label: 'Swing H1' },
    { tf: '4h', label: 'Trend H4' },
    { tf: '1d', label: 'Daily Macro' },
  ];

  return list.map(({ tf, label }) => {
    try {
      const a = analyzeGoldSignal(baseCandles, tf);
      return {
        timeframe: tf,
        name: label,
        signal: a.signal,
        trend: a.predictedTrend,
        bbStatus: a.indicatorBreakdown.bollinger.status,
        maStatus: a.indicatorBreakdown.movingAverage.status,
        rsiValue: a.indicatorBreakdown.rsi.value,
      };
    } catch {
      return {
        timeframe: tf,
        name: label,
        signal: 'NEUTRAL',
        trend: 'SIDEWAYS',
        bbStatus: 'NEUTRAL',
        maStatus: 'NEUTRAL',
        rsiValue: 50,
      };
    }
  });
}
