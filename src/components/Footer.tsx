'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050810] border-t border-slate-800 text-slate-400 py-8 px-4 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
            Au
          </div>
          <span className="font-semibold text-slate-300">
            GoldPulse AI • XAU/USD Technical Prediction Terminal
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-[11px] text-center md:text-right">
          <ShieldAlert size={14} className="text-amber-500 shrink-0" />
          <span>
            <b>Peringatan Risiko Forex:</b> Trading XAU/USD membawa risiko tinggi. Prediksi indikator (Bollinger Bands & Moving Average) bersifat analitis statistik dan bukan jaminan keuntungan mutlak.
          </span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-slate-900 text-center text-slate-600 text-[11px]">
        &copy; {new Date().getFullYear()} GoldPulse AI. All rights reserved.
      </div>
    </footer>
  );
}
