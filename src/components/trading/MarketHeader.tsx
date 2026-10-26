'use client';

import React from 'react';
import { ArrowDownRight, ArrowUpRight, BookOpen, Radio, RefreshCw } from 'lucide-react';

interface MarketHeaderProps {
  currentPrice: number;
  lastTickDirection: 'UP' | 'DOWN' | null;
  dataSource: 'REAL_MARKET' | 'FALLBACK';
  dataProvider: string;
  isLoadingMarket: boolean;
  realStats: {
    dailyHigh: number;
    dailyLow: number;
    dailyChangePercent: number;
  };
  goldSpread: number;
  onRefresh: () => void;
  onOpenGuide: () => void;
}

export default function MarketHeader({
  currentPrice,
  lastTickDirection,
  dataSource,
  dataProvider,
  isLoadingMarket,
  realStats,
  goldSpread,
  onRefresh,
  onOpenGuide,
}: MarketHeaderProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0a0f1d]/90 p-4 sm:p-5 backdrop-blur-xl shadow-2xl flex flex-wrap items-center justify-between gap-4">
      {/* Pair Title & Real Market Badge */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 text-lg">
          Au
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              XAU / USD
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Gold Spot
            </span>

            {dataSource === 'REAL_MARKET' ? (
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/50 shadow-sm shadow-emerald-500/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                PASAR SPOT XAU/USD LIVE (LONDON LBMA)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-amber-300 bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                <Radio size={12} className="animate-pulse" /> SIMULASI SPOT TERKALIBRASI
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
            <span>
              Sumber Kuotasi: <b className="text-slate-300">{dataProvider}</b>
            </span>
            {isLoadingMarket && (
              <span className="text-amber-400 text-[10px] animate-pulse">
                • Sinkronisasi harga spot...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Ticker Metrics */}
      <div className="flex flex-wrap items-center gap-5 sm:gap-7">
        {/* Live Price with Flash Animation */}
        <div>
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
            Harga Emas Pasar Spot (XAU/USD)
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-black font-mono transition-colors duration-300 ${
                lastTickDirection === 'UP'
                  ? 'text-emerald-400'
                  : lastTickDirection === 'DOWN'
                  ? 'text-rose-400'
                  : 'text-white'
              }`}
            >
              ${currentPrice.toFixed(2)}
            </span>
            <span
              className={`text-xs font-bold font-mono flex items-center ${
                realStats.dailyChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {realStats.dailyChangePercent >= 0 ? (
                <ArrowUpRight size={14} />
              ) : (
                <ArrowDownRight size={14} />
              )}
              {realStats.dailyChangePercent >= 0 ? '+' : ''}
              {realStats.dailyChangePercent}%
            </span>
          </div>
        </div>

        {/* 24h High & Low */}
        <div className="hidden sm:block border-l border-slate-800 pl-5 text-xs">
          <div className="text-slate-400">24 Jam Tertinggi / Terendah</div>
          <div className="font-mono mt-0.5">
            <span className="text-emerald-400 font-bold">${realStats.dailyHigh.toFixed(2)}</span>
            <span className="text-slate-500 mx-1.5">/</span>
            <span className="text-rose-400 font-bold">${realStats.dailyLow.toFixed(2)}</span>
          </div>
        </div>

        {/* Spread */}
        <div className="hidden md:block border-l border-slate-800 pl-5 text-xs">
          <div className="text-slate-400">Spread Broker</div>
          <div className="font-mono text-slate-200 font-semibold mt-0.5">
            {goldSpread} pips (${goldSpread.toFixed(2)})
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className={`p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-sm ${
              isLoadingMarket ? 'animate-spin text-amber-400' : ''
            }`}
            title="Tarik Data Harga Real-Time Terbaru"
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all"
            title="Panduan Strategi Forex"
          >
            <BookOpen size={14} />
            <span className="hidden sm:inline">Panduan Sinyal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
