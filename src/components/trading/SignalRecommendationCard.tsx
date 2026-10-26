'use client';

import React, { useState } from 'react';
import { PredictionAnalysis, SignalType } from '@/types/trading';
import {
  ArrowUpRight,
  CheckCircle2,
  Copy,
  Info,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface SignalRecommendationCardProps {
  prediction: PredictionAnalysis;
}

export default function SignalRecommendationCard({
  prediction,
}: SignalRecommendationCardProps) {
  const [copied, setCopied] = useState(false);

  const isBuy =
    prediction.signal === 'STRONG_BUY' || prediction.signal === 'BUY';
  const isSell =
    prediction.signal === 'STRONG_SELL' || prediction.signal === 'SELL';

  const getSignalConfig = (signal: SignalType) => {
    switch (signal) {
      case 'STRONG_BUY':
        return {
          title: 'STRONG BUY',
          sub: 'Sinyal Beli Sangat Kuat',
          bg: 'from-emerald-950/80 via-emerald-900/40 to-slate-950',
          border: 'border-emerald-500/60 shadow-emerald-500/20',
          badgeBg: 'bg-emerald-500 text-slate-950',
          textColor: 'text-emerald-400',
          glow: 'shadow-[0_0_35px_rgba(16,185,129,0.3)]',
          icon: TrendingUp,
        };
      case 'BUY':
        return {
          title: 'BUY (LONG)',
          sub: 'Rekomendasi Beli Forex',
          bg: 'from-emerald-950/50 via-slate-900/60 to-slate-950',
          border: 'border-emerald-500/40 shadow-emerald-500/10',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50',
          textColor: 'text-emerald-400',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
          icon: TrendingUp,
        };
      case 'STRONG_SELL':
        return {
          title: 'STRONG SELL',
          sub: 'Sinyal Jual Sangat Kuat',
          bg: 'from-rose-950/80 via-rose-900/40 to-slate-950',
          border: 'border-rose-500/60 shadow-rose-500/20',
          badgeBg: 'bg-rose-500 text-white',
          textColor: 'text-rose-400',
          glow: 'shadow-[0_0_35px_rgba(244,63,94,0.3)]',
          icon: TrendingDown,
        };
      case 'SELL':
        return {
          title: 'SELL (SHORT)',
          sub: 'Rekomendasi Jual Forex',
          bg: 'from-rose-950/50 via-slate-900/60 to-slate-950',
          border: 'border-rose-500/40 shadow-rose-500/10',
          badgeBg: 'bg-rose-500/20 text-rose-300 border border-rose-500/50',
          textColor: 'text-rose-400',
          glow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]',
          icon: TrendingDown,
        };
      default:
        return {
          title: 'NEUTRAL / WAIT',
          sub: 'Tunggu Konfirmasi Breakout',
          bg: 'from-amber-950/40 via-slate-900/60 to-slate-950',
          border: 'border-amber-500/30',
          badgeBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
          textColor: 'text-amber-400',
          glow: 'shadow-none',
          icon: Info,
        };
    }
  };

  const config = getSignalConfig(prediction.signal);
  const SignalIcon = config.icon;

  const handleCopy = () => {
    const text = `[SINYAL FOREX XAU/USD]
Aksi: ${prediction.signal}
Timeframe: ${prediction.timeframe.toUpperCase()}
Harga Saat Ini: $${prediction.currentPrice}
Area Entry: $${prediction.entryZone.min} - $${prediction.entryZone.max}
Stop Loss (SL): $${prediction.stopLoss}
Take Profit 1 (TP1): $${prediction.takeProfit1}
Take Profit 2 (TP2): $${prediction.takeProfit2}
Keyakinan: ${prediction.confidence}%
Risk/Reward: ${prediction.riskRewardRatio}
Dihasilkan oleh XAU/USD AI Predictor`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-b ${config.bg} ${config.border} ${config.glow} p-5 backdrop-blur-xl transition-all duration-300`}
    >
      {/* Top Header Badge & Meta */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              <Sparkles size={12} /> AI Technical Recommendation
            </span>
            <span className="text-xs text-slate-400 font-mono">
              TF: {prediction.timeframe.toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            XAU / USD (Gold Forex)
          </h2>
        </div>

        {/* Copy Signal Button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-sm"
          title="Salin Rencana Sinyal Forex"
        >
          {copied ? (
            <>
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span className="text-emerald-400">Tersalin!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Salin Sinyal</span>
            </>
          )}
        </button>
      </div>

      {/* Main Recommendation Banner */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 mb-5">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.badgeBg} shadow-lg`}
          >
            <SignalIcon size={30} />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-medium">
              Rekomendasi Algoritma
            </div>
            <div className={`text-2xl font-black tracking-wide ${config.textColor}`}>
              {config.title}
            </div>
            <div className="text-xs text-slate-300">{config.sub}</div>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
          <div className="text-xs text-slate-400">Tingkat Keyakinan (Confidence)</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-white">
              {prediction.confidence}%
            </span>
            <span className="text-xs font-medium text-amber-400">Akurasi Indikator</span>
          </div>
          <div className="w-36 h-2 bg-slate-800 rounded-full overflow-hidden mt-1 hidden md:block">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isBuy ? 'bg-emerald-500' : isSell ? 'bg-rose-500' : 'bg-amber-500'
              }`}
              style={{ width: `${prediction.confidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* Trade Execution Plan (Levels) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        {/* Entry Zone */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium mb-1 flex items-center gap-1">
            <Target size={12} className="text-sky-400" /> Area Entry
          </div>
          <div className="text-sm font-bold text-white">
            ${prediction.entryZone.min.toFixed(2)} - ${prediction.entryZone.max.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400">Harga Sekarang: ${prediction.currentPrice.toFixed(2)}</div>
        </div>

        {/* Stop Loss */}
        <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40">
          <div className="text-[11px] text-rose-400 font-medium mb-1 flex items-center gap-1">
            <ShieldAlert size={12} /> Stop Loss (SL)
          </div>
          <div className="text-sm font-bold text-rose-400">
            ${prediction.stopLoss.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400">
            Resiko: ~{Math.abs(Math.round((prediction.currentPrice - prediction.stopLoss) * 10))} pips
          </div>
        </div>

        {/* Take Profit 1 */}
        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
          <div className="text-[11px] text-emerald-400 font-medium mb-1 flex items-center gap-1">
            <Zap size={12} /> Target TP 1
          </div>
          <div className="text-sm font-bold text-emerald-400">
            ${prediction.takeProfit1.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-500/80">
            Potensi: +{Math.abs(Math.round((prediction.takeProfit1 - prediction.currentPrice) * 10))} pips
          </div>
        </div>

        {/* Take Profit 2 */}
        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
          <div className="text-[11px] text-emerald-300 font-medium mb-1 flex items-center gap-1">
            <ArrowUpRight size={12} /> Target TP 2 (Max)
          </div>
          <div className="text-sm font-bold text-emerald-300">
            ${prediction.takeProfit2.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-400">
            RRR: <b className="text-white">{prediction.riskRewardRatio}</b>
          </div>
        </div>
      </div>

      {/* Target Price Projections */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 mb-5">
        <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
          <span>Proyeksi Target Harga Berjangka (XAU/USD)</span>
          <span className="text-[11px] text-amber-400 font-mono">
            Tren: {prediction.predictedTrend === 'UP' ? 'BULLISH ▲' : prediction.predictedTrend === 'DOWN' ? 'BEARISH ▼' : 'SIDEWAYS ◄►'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400">Next 1 Jam</div>
            <div className="text-sm font-bold text-white font-mono">
              ${prediction.targetPrice1H.toFixed(2)}
            </div>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400">Next 4 Jam</div>
            <div className="text-sm font-bold text-sky-400 font-mono">
              ${prediction.targetPrice4H.toFixed(2)}
            </div>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
            <div className="text-[10px] text-slate-400">Next 24 Jam</div>
            <div className="text-sm font-bold text-amber-400 font-mono">
              ${prediction.targetPrice24H.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Technical Evidence / Alasan Sinyal */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-1.5">
          <Info size={14} className="text-amber-400" /> Analisis Alasan Teknis (Indikator Konfirmasi)
        </h4>

        <p className="text-xs text-slate-300 mb-3 leading-relaxed">
          {prediction.summaryReason}
        </p>

        <ul className="space-y-2">
          {prediction.reasons.map((reason, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-xs text-slate-300 leading-normal"
            >
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
