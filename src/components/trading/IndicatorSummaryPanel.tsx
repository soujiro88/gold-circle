'use client';

import React from 'react';
import { PredictionAnalysis } from '@/types/trading';
import { Activity, Compass, Gauge, Layers, Zap } from 'lucide-react';

interface IndicatorSummaryPanelProps {
  prediction: PredictionAnalysis;
}

export default function IndicatorSummaryPanel({
  prediction,
}: IndicatorSummaryPanelProps) {
  const { indicatorBreakdown } = prediction;
  const { bollinger, movingAverage, rsi, macd } = indicatorBreakdown;

  const getRSIColor = (val: number) => {
    if (val <= 30) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (val >= 70) return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d1321] p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity size={16} className="text-amber-400" />
          Status Detail Indikator Teknikal
        </h3>
        <span className="text-xs text-slate-400">Real-time Metrics</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. BOLLINGER BANDS */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers size={14} className="text-sky-400" /> Bollinger Bands (20,2)
              </span>
              <span className="text-[10px] text-sky-400 font-mono">
                {bollinger.status}
              </span>
            </div>
            <div className="text-sm font-semibold text-white mb-2">
              {bollinger.status === 'OVERSOLD'
                ? 'Sentuh Pita Bawah (Rebound)'
                : bollinger.status === 'OVERBOUGHT'
                ? 'Sentuh Pita Atas (Koreksi)'
                : bollinger.status === 'SQUEEZE'
                ? 'Squeeze (Kompresi Volatilitas)'
                : 'Pita Normal Terbuka'}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {bollinger.text}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Bobot Sinyal</span>
            <span
              className={`font-semibold ${
                bollinger.score > 0
                  ? 'text-emerald-400'
                  : bollinger.score < 0
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {bollinger.score > 0 ? `+${bollinger.score} (Buy)` : bollinger.score < 0 ? `${bollinger.score} (Sell)` : 'Netral'}
            </span>
          </div>
        </div>

        {/* 2. MOVING AVERAGES */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Compass size={14} className="text-amber-400" /> Moving Average (MA)
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                {movingAverage.status}
              </span>
            </div>
            <div className="text-sm font-semibold text-white mb-2">
              {movingAverage.status === 'GOLDEN_CROSS'
                ? 'Golden Cross SMA 20/50'
                : movingAverage.status === 'DEATH_CROSS'
                ? 'Death Cross SMA 20/50'
                : movingAverage.status === 'STRONG_BULLISH'
                ? 'Susunan Bullish Penuh'
                : movingAverage.status === 'BULLISH'
                ? 'Di Atas EMA 200'
                : 'Bearish di Bawah EMA 200'}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {movingAverage.text}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Bobot Sinyal</span>
            <span
              className={`font-semibold ${
                movingAverage.score > 0
                  ? 'text-emerald-400'
                  : movingAverage.score < 0
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {movingAverage.score > 0 ? `+${movingAverage.score} (Buy)` : movingAverage.score < 0 ? `${movingAverage.score} (Sell)` : 'Netral'}
            </span>
          </div>
        </div>

        {/* 3. RSI OSCILLATOR */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Gauge size={14} className="text-emerald-400" /> RSI (14 Periods)
              </span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${getRSIColor(
                  rsi.value
                )}`}
              >
                {rsi.value.toFixed(1)}
              </span>
            </div>
            <div className="text-sm font-semibold text-white mb-2">
              {rsi.value <= 30
                ? 'Jenuh Jual (Oversold)'
                : rsi.value >= 70
                ? 'Jenuh Beli (Overbought)'
                : rsi.value > 50
                ? 'Bullish Momentum'
                : 'Bearish Momentum'}
            </div>
            {/* Visual RSI bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-2">
              <div
                className={`h-full ${
                  rsi.value <= 30
                    ? 'bg-emerald-500'
                    : rsi.value >= 70
                    ? 'bg-rose-500'
                    : 'bg-sky-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, rsi.value))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {rsi.text}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Bobot Sinyal</span>
            <span
              className={`font-semibold ${
                rsi.score > 0
                  ? 'text-emerald-400'
                  : rsi.score < 0
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {rsi.score > 0 ? `+${rsi.score} (Buy)` : rsi.score < 0 ? `${rsi.score} (Sell)` : 'Netral'}
            </span>
          </div>
        </div>

        {/* 4. MACD & MOMENTUM */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Zap size={14} className="text-purple-400" /> MACD (12, 26, 9)
              </span>
              <span className="text-[10px] text-purple-400 font-mono">
                {macd.status}
              </span>
            </div>
            <div className="text-sm font-semibold text-white mb-2">
              {macd.status === 'BULLISH_CROSS'
                ? 'Crossover Bullish Segar'
                : macd.status === 'BEARISH_CROSS'
                ? 'Crossover Bearish Segar'
                : macd.status === 'POSITIVE'
                ? 'Histogram Positif'
                : 'Histogram Negatif'}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {macd.text}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Bobot Sinyal</span>
            <span
              className={`font-semibold ${
                macd.score > 0
                  ? 'text-emerald-400'
                  : macd.score < 0
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {macd.score > 0 ? `+${macd.score} (Buy)` : macd.score < 0 ? `${macd.score} (Sell)` : 'Netral'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
