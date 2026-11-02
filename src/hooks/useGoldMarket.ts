'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TimeFrame, Candle, PredictionAnalysis, MultiTimeframeSummary } from '@/types/trading';
import { fetchLiveGoldMarketData, simulateNextTick, BASE_GOLD_PRICE } from '@/lib/goldData';
import { analyzeGoldSignal, generateMultiTimeframeMatrix } from '@/lib/prediction';
import { playSignalSound } from '@/lib/sound';

export function useGoldMarket() {
  const [timeframe, setTimeframe] = useState<TimeFrame>('1h');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [prediction, setPrediction] = useState<PredictionAnalysis | null>(null);
  const [mtfMatrix, setMtfMatrix] = useState<MultiTimeframeSummary[]>([]);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [lastTickDirection, setLastTickDirection] = useState<'UP' | 'DOWN' | null>(null);

  // Real Market Data Feed States
  const [dataSource, setDataSource] = useState<'REAL_MARKET' | 'FALLBACK'>('REAL_MARKET');
  const [dataProvider, setDataProvider] = useState<string>('Pasar Spot Emas Dunia (XAU/USD Spot • London LBMA)');
  const [isLoadingMarket, setIsLoadingMarket] = useState<boolean>(true);
  const [realStats, setRealStats] = useState<{
    dailyHigh: number;
    dailyLow: number;
    dailyChangePercent: number;
  }>({
    dailyHigh: BASE_GOLD_PRICE + 25.0,
    dailyLow: BASE_GOLD_PRICE - 30.0,
    dailyChangePercent: 0.54,
  });

  const prevSignalRef = useRef<string | null>(null);

  // Fetch real market dataset
  const loadMarketData = useCallback(async (tf: TimeFrame) => {
    setIsLoadingMarket(true);
    try {
      const result = await fetchLiveGoldMarketData(tf);
      if (result.candles && result.candles.length > 0) {
        setCandles(result.candles);
        setDataSource(result.source);
        if (result.provider) setDataProvider(result.provider);

        setRealStats({
          dailyHigh: result.dailyHigh,
          dailyLow: result.dailyLow,
          dailyChangePercent: result.dailyChangePercent,
        });

        const pred = analyzeGoldSignal(result.candles, tf);
        setPrediction(pred);
        const mtf = generateMultiTimeframeMatrix(result.candles);
        setMtfMatrix(mtf);
        prevSignalRef.current = pred.signal;
      }
    } catch (err) {
      console.error('Failed to load market data:', err);
    } finally {
      setIsLoadingMarket(false);
    }
  }, []);

  // Fetch when timeframe changes
  useEffect(() => {
    loadMarketData(timeframe);
  }, [timeframe, loadMarketData]);

  // Periodic real-market sync (every 10s)
  useEffect(() => {
    if (!isLive) return;

    const syncInterval = setInterval(() => {
      fetchLiveGoldMarketData(timeframe)
        .then((result) => {
          if (result.success && result.candles.length > 0) {
            setCandles(result.candles);
            setDataSource(result.source);
            setRealStats({
              dailyHigh: result.dailyHigh,
              dailyLow: result.dailyLow,
              dailyChangePercent: result.dailyChangePercent,
            });

            try {
              const updatedPred = analyzeGoldSignal(result.candles, timeframe);
              setPrediction(updatedPred);

              if (
                soundEnabled &&
                prevSignalRef.current &&
                prevSignalRef.current !== updatedPred.signal
              ) {
                const isBuy = updatedPred.signal.includes('BUY');
                const isSell = updatedPred.signal.includes('SELL');
                playSignalSound(isBuy ? 'BUY' : isSell ? 'SELL' : 'NEUTRAL');
              }
              prevSignalRef.current = updatedPred.signal;
            } catch {
              // Ignore
            }
          }
        })
        .catch(() => {});
    }, 10000);

    return () => clearInterval(syncInterval);
  }, [isLive, timeframe, soundEnabled]);

  // Micro-tick animation
  useEffect(() => {
    if (!isLive) return;

    const microInterval = setInterval(() => {
      setCandles((prevCandles) => {
        if (prevCandles.length === 0) return prevCandles;
        const last = prevCandles[prevCandles.length - 1];
        const { updatedCandle, isNewCandle } = simulateNextTick(last, timeframe);

        if (updatedCandle.close > last.close) {
          setLastTickDirection('UP');
        } else if (updatedCandle.close < last.close) {
          setLastTickDirection('DOWN');
        }

        if (isNewCandle) {
          return [...prevCandles.slice(1), updatedCandle];
        } else {
          return [...prevCandles.slice(0, -1), updatedCandle];
        }
      });
    }, 1800);

    return () => clearInterval(microInterval);
  }, [isLive, timeframe]);

  const toggleLive = useCallback(() => {
    setIsLive((prev) => !prev);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  const refresh = useCallback(() => {
    loadMarketData(timeframe);
  }, [loadMarketData, timeframe]);

  const currentPrice = candles[candles.length - 1]?.close ?? BASE_GOLD_PRICE;

  return {
    timeframe,
    setTimeframe,
    candles,
    prediction,
    mtfMatrix,
    isLive,
    toggleLive,
    soundEnabled,
    toggleSound,
    lastTickDirection,
    dataSource,
    dataProvider,
    isLoadingMarket,
    realStats,
    refresh,
    currentPrice,
  };
}
