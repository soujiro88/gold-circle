'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  ColorType,
  CrosshairMode,
  ISeriesApi,
  IChartApi,
  createSeriesMarkers,
  Time,
  SeriesMarker,
} from 'lightweight-charts';
import { Candle, TimeFrame, PredictionAnalysis } from '@/types/trading';
import { calculateBollingerBands, calculateSMA, calculateEMA } from '@/lib/indicators';
import { TIMEFRAME_OPTIONS } from '@/constants/trading';
import { Maximize2, Volume2, VolumeX } from 'lucide-react';

interface GoldChartProps {
  candles: Candle[];
  timeframe: TimeFrame;
  onTimeframeChange: (tf: TimeFrame) => void;
  prediction: PredictionAnalysis;
  isLive: boolean;
  onToggleLive: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

/**
 * Filter and sort candles to guarantee strict ascending order and no NaNs
 */
function sanitizeCandles(raw: Candle[]): Candle[] {
  if (!raw || raw.length === 0) return [];

  const valid = raw.filter(
    (c) =>
      c != null &&
      typeof c.time === 'number' &&
      !isNaN(c.time) &&
      !isNaN(c.open) &&
      !isNaN(c.high) &&
      !isNaN(c.low) &&
      !isNaN(c.close)
  );

  // Sort ascending by timestamp
  valid.sort((a, b) => a.time - b.time);

  // Deduplicate timestamps (keep the last occurrence)
  const deduped: Candle[] = [];
  for (let i = 0; i < valid.length; i++) {
    const cur = valid[i];
    if (deduped.length === 0 || cur.time > deduped[deduped.length - 1].time) {
      deduped.push({
        ...cur,
        high: Math.max(cur.high, cur.open, cur.close),
        low: Math.min(cur.low, cur.open, cur.close),
      });
    } else {
      // Overwrite previous if same timestamp
      deduped[deduped.length - 1] = {
        ...cur,
        high: Math.max(cur.high, cur.open, cur.close),
        low: Math.min(cur.low, cur.open, cur.close),
      };
    }
  }

  return deduped;
}

export default function GoldChart({
  candles,
  timeframe,
  onTimeframeChange,
  prediction,
  isLive,
  onToggleLive,
  soundEnabled,
  onToggleSound,
}: GoldChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // Series refs
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const bbUpperSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbMiddleSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbLowerSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const sma20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const sma50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema200SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // Markers controller ref
  const markersPrimitiveRef = useRef<{ setMarkers: (m: SeriesMarker<Time>[]) => void } | null>(null);

  // Indicator visibility toggles
  const [showBB, setShowBB] = useState(true);
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showEMA200, setShowEMA200] = useState(true);

  // Legend / Hover state
  const [hoverData, setHoverData] = useState<{
    time?: string;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    change?: number;
  } | null>(null);

  const cleanCandles = useMemo(() => sanitizeCandles(candles), [candles]);

  // 1. Initialize Chart instance ONCE on mount
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
    const initialWidth = container.clientWidth || 800;

    // Create chart
    const chart = createChart(container, {
      width: initialWidth,
      height: 480,
      layout: {
        background: { type: ColorType.Solid, color: '#090d16' },
        textColor: '#94a3b8',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: 'rgba(51, 65, 85, 0.25)', style: 1 },
        horzLines: { color: 'rgba(51, 65, 85, 0.25)', style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#64748b',
          width: 1,
          style: 3,
          labelBackgroundColor: '#1e293b',
        },
        horzLine: {
          color: '#64748b',
          width: 1,
          style: 3,
          labelBackgroundColor: '#1e293b',
        },
      },
      rightPriceScale: {
        borderColor: '#334155',
        scaleMargins: { top: 0.1, bottom: 0.15 },
        autoScale: true,
      },
      timeScale: {
        borderColor: '#334155',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });
    candleSeriesRef.current = candleSeries;

    // Add Bollinger Lines
    bbUpperSeriesRef.current = chart.addSeries(LineSeries, {
      color: '#38bdf8',
      lineWidth: 1,
      lineStyle: 0,
      title: 'BB Upper',
      visible: true,
    });

    bbMiddleSeriesRef.current = chart.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 1,
      lineStyle: 2,
      title: 'BB Middle (SMA 20)',
      visible: false,
    });

    bbLowerSeriesRef.current = chart.addSeries(LineSeries, {
      color: '#38bdf8',
      lineWidth: 1,
      lineStyle: 0,
      title: 'BB Lower',
      visible: true,
    });

    // Add Moving Average Lines
    sma20SeriesRef.current = chart.addSeries(LineSeries, {
      color: '#eab308',
      lineWidth: 2,
      title: 'SMA 20',
      visible: true,
    });

    sma50SeriesRef.current = chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      title: 'SMA 50',
      visible: true,
    });

    ema200SeriesRef.current = chart.addSeries(LineSeries, {
      color: '#c084fc',
      lineWidth: 2,
      title: 'EMA 200',
      visible: true,
    });

    // Crosshair hover listener
    chart.subscribeCrosshairMove((param) => {
      try {
        if (!param || !param.time || !param.point || param.point.x < 0 || param.point.y < 0) {
          setHoverData(null);
          return;
        }

        const candleData = param.seriesData.get(candleSeries) as {
          open: number;
          high: number;
          low: number;
          close: number;
        } | undefined;

        if (candleData && typeof candleData.close === 'number') {
          const timeNum = typeof param.time === 'number' ? param.time : 0;
          setHoverData({
            time: timeNum
              ? new Date(timeNum * 1000).toLocaleString('id-ID', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '',
            open: candleData.open,
            high: candleData.high,
            low: candleData.low,
            close: candleData.close,
            change: candleData.close - candleData.open,
          });
        }
      } catch {
        // ignore crosshair errors
      }
    });

    // Resize observer
    const handleResize = () => {
      if (container && chartRef.current) {
        chartRef.current.applyOptions({ width: container.clientWidth });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch {
          // ignore cleanup errors
        }
        chartRef.current = null;
        candleSeriesRef.current = null;
        markersPrimitiveRef.current = null;
      }
    };
  }, []); // Run ONCE on mount!

  // 2. Update Series Data smoothly when candles update (NO chart destruction!)
  useEffect(() => {
    if (!candleSeriesRef.current || cleanCandles.length === 0) return;

    try {
      const candleSeries = candleSeriesRef.current;

      // Feed candlesticks
      const chartData = cleanCandles.map((c) => ({
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
      candleSeries.setData(chartData);

      // Compute and feed Bollinger Bands
      const bbData = calculateBollingerBands(cleanCandles, 20, 2);
      bbUpperSeriesRef.current?.setData(
        bbData.map((d) => ({ time: d.time as Time, value: d.upper }))
      );
      bbMiddleSeriesRef.current?.setData(
        bbData.map((d) => ({ time: d.time as Time, value: d.middle }))
      );
      bbLowerSeriesRef.current?.setData(
        bbData.map((d) => ({ time: d.time as Time, value: d.lower }))
      );

      // Compute and feed Moving Averages
      const sma20Data = calculateSMA(cleanCandles, 20);
      sma20SeriesRef.current?.setData(
        sma20Data.map((d) => ({ time: d.time as Time, value: d.value }))
      );

      const sma50Data = calculateSMA(cleanCandles, 50);
      sma50SeriesRef.current?.setData(
        sma50Data.map((d) => ({ time: d.time as Time, value: d.value }))
      );

      const ema200Data = calculateEMA(
        cleanCandles,
        Math.min(200, Math.floor(cleanCandles.length * 0.85))
      );
      ema200SeriesRef.current?.setData(
        ema200Data.map((d) => ({ time: d.time as Time, value: d.value }))
      );

      // Build strictly sorted, unique markers
      const rawMarkers: SeriesMarker<Time>[] = [];

      for (let i = 25; i < cleanCandles.length - 1; i += 18) {
        const c = cleanCandles[i];
        const bbPoint = bbData.find((b) => b.time === c.time);
        const sma20P = sma20Data.find((s) => s.time === c.time);
        const sma50P = sma50Data.find((s) => s.time === c.time);

        if (bbPoint && c.low <= bbPoint.lower && c.close > bbPoint.lower) {
          rawMarkers.push({
            time: c.time as Time,
            position: 'belowBar',
            color: '#10b981',
            shape: 'arrowUp',
            text: 'BUY',
          });
        } else if (bbPoint && c.high >= bbPoint.upper && c.close < bbPoint.upper) {
          rawMarkers.push({
            time: c.time as Time,
            position: 'aboveBar',
            color: '#ef4444',
            shape: 'arrowDown',
            text: 'SELL',
          });
        } else if (sma20P && sma50P && sma20P.value > sma50P.value && i % 30 === 0) {
          rawMarkers.push({
            time: c.time as Time,
            position: 'belowBar',
            color: '#38bdf8',
            shape: 'circle',
            text: 'MA CROSS',
          });
        }
      }

      // Add latest signal marker at the very last candle
      const lastCandle = cleanCandles[cleanCandles.length - 1];
      if (lastCandle) {
        if (prediction.signal === 'STRONG_BUY' || prediction.signal === 'BUY') {
          rawMarkers.push({
            time: lastCandle.time as Time,
            position: 'belowBar',
            color: '#10b981',
            shape: 'arrowUp',
            text: `★ ${prediction.signal.replace('_', ' ')}`,
          });
        } else if (prediction.signal === 'STRONG_SELL' || prediction.signal === 'SELL') {
          rawMarkers.push({
            time: lastCandle.time as Time,
            position: 'aboveBar',
            color: '#ef4444',
            shape: 'arrowDown',
            text: `★ ${prediction.signal.replace('_', ' ')}`,
          });
        }
      }

      // Deduplicate and strictly sort markers by time
      const markerMap = new Map<number, SeriesMarker<Time>>();
      rawMarkers.forEach((m) => markerMap.set(m.time as number, m));
      const sortedMarkers = Array.from(markerMap.values()).sort(
        (a, b) => (a.time as number) - (b.time as number)
      );

      // Apply markers safely
      if (!markersPrimitiveRef.current) {
        markersPrimitiveRef.current = createSeriesMarkers(candleSeries, sortedMarkers);
      } else {
        markersPrimitiveRef.current.setMarkers(sortedMarkers);
      }
    } catch (err) {
      console.warn('Chart data update caught:', err);
    }
  }, [cleanCandles, prediction.signal]);

  // 3. Toggle Visibility Effects
  useEffect(() => {
    bbUpperSeriesRef.current?.applyOptions({ visible: showBB });
    bbMiddleSeriesRef.current?.applyOptions({ visible: showBB && !showSMA20 });
    bbLowerSeriesRef.current?.applyOptions({ visible: showBB });
  }, [showBB, showSMA20]);

  useEffect(() => {
    sma20SeriesRef.current?.applyOptions({ visible: showSMA20 });
  }, [showSMA20]);

  useEffect(() => {
    sma50SeriesRef.current?.applyOptions({ visible: showSMA50 });
  }, [showSMA50]);

  useEffect(() => {
    ema200SeriesRef.current?.applyOptions({ visible: showEMA200 });
  }, [showEMA200]);

  const fitContent = () => {
    chartRef.current?.timeScale().fitContent();
  };

  const lastCandle = cleanCandles[cleanCandles.length - 1];
  const activeHover =
    hoverData ||
    (lastCandle
      ? {
          time: new Date(lastCandle.time * 1000).toLocaleString('id-ID'),
          open: lastCandle.open,
          high: lastCandle.high,
          low: lastCandle.low,
          close: lastCandle.close,
          change: lastCandle.close - lastCandle.open,
        }
      : null);

  return (
    <div className="relative rounded-2xl bg-[#090d16] border border-slate-800/80 shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Top Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#0d1321] border-b border-slate-800">
        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {TIMEFRAME_OPTIONS.map((tf) => (
            <button
              key={tf.key}
              onClick={() => onTimeframeChange(tf.key)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeframe === tf.key
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Indicators Visibility Toggles */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setShowBB(!showBB)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
              showBB
                ? 'bg-sky-500/10 border-sky-500/50 text-sky-400'
                : 'bg-slate-900/60 border-slate-800 text-slate-500'
            }`}
            title="Bollinger Bands (20, 2)"
          >
            ● Bollinger
          </button>

          <button
            onClick={() => setShowSMA20(!showSMA20)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
              showSMA20
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                : 'bg-slate-900/60 border-slate-800 text-slate-500'
            }`}
            title="SMA 20 (Moving Average 20)"
          >
            ● SMA 20
          </button>

          <button
            onClick={() => setShowSMA50(!showSMA50)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
              showSMA50
                ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                : 'bg-slate-900/60 border-slate-800 text-slate-500'
            }`}
            title="SMA 50 (Moving Average 50)"
          >
            ● SMA 50
          </button>

          <button
            onClick={() => setShowEMA200(!showEMA200)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
              showEMA200
                ? 'bg-purple-500/10 border-purple-500/50 text-purple-400'
                : 'bg-slate-900/60 border-slate-800 text-slate-500'
            }`}
            title="EMA 200 (Baseline Tren Institusional)"
          >
            ● EMA 200
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Live Simulator Toggle */}
          <button
            onClick={onToggleLive}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
              isLive
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Toggle Live Price Simulation"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
              }`}
            />
            {isLive ? 'LIVE TICK' : 'PAUSED'}
          </button>

          {/* Sound Notification */}
          <button
            onClick={onToggleSound}
            className={`p-1.5 rounded-lg border transition-all ${
              soundEnabled
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={soundEnabled ? 'Suara Sinyal Aktif' : 'Suara Sinyal Nonaktif'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Fit Content */}
          <button
            onClick={fitContent}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            title="Reset Tampilan Grafik"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* Floating HUD / Legend Bar */}
      {activeHover && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 bg-[#090d16]/90 border-b border-slate-800/60 text-xs font-mono">
          <span className="text-slate-400">{activeHover.time}</span>
          <span className="text-slate-400">
            O: <b className="text-slate-200">${activeHover.open?.toFixed(2)}</b>
          </span>
          <span className="text-slate-400">
            H: <b className="text-emerald-400">${activeHover.high?.toFixed(2)}</b>
          </span>
          <span className="text-slate-400">
            L: <b className="text-red-400">${activeHover.low?.toFixed(2)}</b>
          </span>
          <span className="text-slate-400">
            C: <b className="text-white">${activeHover.close?.toFixed(2)}</b>
          </span>
          {activeHover.change !== undefined && (
            <span
              className={`font-semibold ${
                activeHover.change >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {activeHover.change >= 0 ? '+' : ''}
              {activeHover.change.toFixed(2)} (
              {((activeHover.change / (activeHover.open || 1)) * 100).toFixed(2)}%)
            </span>
          )}

          {/* Indicator Quick Badges */}
          <div className="ml-auto hidden md:flex items-center gap-3 text-[11px]">
            <span className="text-sky-400 font-sans">
              BB: {showBB ? 'ON (20,2)' : 'OFF'}
            </span>
            <span className="text-yellow-400 font-sans">
              MA20: {showSMA20 ? 'ON' : 'OFF'}
            </span>
            <span className="text-blue-400 font-sans">
              MA50: {showSMA50 ? 'ON' : 'OFF'}
            </span>
            <span className="text-purple-400 font-sans">
              EMA200: {showEMA200 ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      )}

      {/* Candlestick Canvas Container */}
      <div ref={chartContainerRef} className="w-full relative min-h-[480px]" />

      {/* Chart Footer Indicator Guide */}
      <div className="px-4 py-2 bg-[#070b12] border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Candlestick Naik (Bull)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500" /> Candlestick Turun (Bear)
          </span>
          <span className="flex items-center gap-1.5 text-sky-400">
            <span className="w-3 h-0.5 bg-sky-400" /> Bollinger Bands
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-3 h-0.5 bg-amber-400" /> SMA 20
          </span>
          <span className="flex items-center gap-1.5 text-blue-400">
            <span className="w-3 h-0.5 bg-blue-400" /> SMA 50
          </span>
          <span className="flex items-center gap-1.5 text-purple-400">
            <span className="w-3 h-0.5 bg-purple-400" /> EMA 200
          </span>
        </div>
        <div className="text-slate-500">
          Scroll untuk Zoom • Drag untuk Geser Waktu
        </div>
      </div>
    </div>
  );
}
