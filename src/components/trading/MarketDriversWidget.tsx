'use client';

import React from 'react';
import { Candle } from '@/types/trading';
import { calculatePivotPoints } from '@/lib/indicators';
import { getGoldMarketContext } from '@/lib/goldData';
import { Globe, Scale, TrendingDown, TrendingUp } from 'lucide-react';

interface MarketDriversWidgetProps {
  candles: Candle[];
  currentPrice: number;
}

export default function MarketDriversWidget({
  candles,
  currentPrice,
}: MarketDriversWidgetProps) {
  const pivots = calculatePivotPoints(candles);
  const context = getGoldMarketContext(currentPrice);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Macro Economic Factors */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1321] p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe size={16} className="text-amber-400" />
            Korelasi Makro & Sentimen Pasar Emas
          </h3>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {context.session}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* DXY Index */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
              <span>US Dollar Index (DXY)</span>
              <span className="text-[10px] text-emerald-400 font-mono">Korelasi Negatif</span>
            </div>
            <div className="text-lg font-bold text-white font-mono flex items-baseline gap-2">
              {context.dxy}
              <span className="text-xs text-rose-400 font-normal">
                {context.dxyChange}%
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              DXY melemah memberi ruang apresiasi bagi XAU/USD.
            </div>
          </div>

          {/* US 10Y Yield */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
              <span>US 10Y Treasury Yield</span>
              <span className="text-[10px] text-amber-400 font-mono">Yield Acuan</span>
            </div>
            <div className="text-lg font-bold text-white font-mono flex items-baseline gap-2">
              {context.us10YYield}%
              <span className="text-xs text-rose-400 font-normal">
                {context.us10YChange}%
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Imbal hasil obligasi turun menopang daya tarik emas tanpa bunga.
            </div>
          </div>
        </div>

        {/* Sentiment Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp size={13} /> {context.bullishSentimentPercent}% Buyer (Beli)
            </span>
            <span className="text-rose-400 font-semibold flex items-center gap-1">
              {context.bearishSentimentPercent}% Seller (Jual) <TrendingDown size={13} />
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all"
              style={{ width: `${context.bullishSentimentPercent}%` }}
            />
            <div
              className="bg-rose-500 h-full transition-all"
              style={{ width: `${context.bearishSentimentPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 text-center mt-1">
            Sentimen ritel mayoritas mengantisipasi penguatan emas.
          </div>
        </div>
      </div>

      {/* 2. Key Pivot Points */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1321] p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Scale size={16} className="text-sky-400" />
            Level Kunci Pivot Points (Support & Resistance)
          </h3>
          <span className="text-xs text-slate-400">Standard Daily Levels</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
          {/* Resistance 3 */}
          <div className="p-2 rounded-lg bg-rose-950/20 border border-rose-900/30">
            <div className="text-[10px] text-rose-400 font-sans">Resistance 3</div>
            <div className="font-bold text-white">${pivots.r3}</div>
          </div>
          {/* Resistance 2 */}
          <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-900/40">
            <div className="text-[10px] text-rose-400 font-sans">Resistance 2</div>
            <div className="font-bold text-white">${pivots.r2}</div>
          </div>
          {/* Resistance 1 */}
          <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/40">
            <div className="text-[10px] text-rose-300 font-sans">Resistance 1</div>
            <div className="font-bold text-rose-300">${pivots.r1}</div>
          </div>

          {/* Central Pivot */}
          <div className="col-span-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/40 flex items-center justify-between px-4">
            <span className="text-amber-400 font-bold font-sans">Central Pivot Point (PP):</span>
            <span className="text-sm font-black text-amber-300">${pivots.pivot}</span>
          </div>

          {/* Support 1 */}
          <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40">
            <div className="text-[10px] text-emerald-300 font-sans">Support 1</div>
            <div className="font-bold text-emerald-300">${pivots.s1}</div>
          </div>
          {/* Support 2 */}
          <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-900/40">
            <div className="text-[10px] text-emerald-400 font-sans">Support 2</div>
            <div className="font-bold text-white">${pivots.s2}</div>
          </div>
          {/* Support 3 */}
          <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-900/30">
            <div className="text-[10px] text-emerald-400 font-sans">Support 3</div>
            <div className="font-bold text-white">${pivots.s3}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
