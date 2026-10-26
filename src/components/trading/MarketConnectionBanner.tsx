'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface MarketConnectionBannerProps {
  timeframe: string;
}

export default function MarketConnectionBanner({ timeframe }: MarketConnectionBannerProps) {
  return (
    <div className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
        <span>
          <b>Koneksi Pasar Spot Real-Time Aktif:</b> Data candlestick dan kuotasi live menggunakan acuan <b>Pasar Spot Emas Dunia (XAU/USD Spot • London LBMA)</b> 24/7.
        </span>
      </div>
      <div className="text-slate-500 text-[11px] font-mono">
        Pembaruan spot otomatis tiap 10 detik • Timeframe aktif: {timeframe.toUpperCase()}
      </div>
    </div>
  );
}
