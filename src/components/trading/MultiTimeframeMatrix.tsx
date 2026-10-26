'use client';

import React from 'react';
import { MultiTimeframeSummary, TimeFrame } from '@/types/trading';
import { Clock, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface MultiTimeframeMatrixProps {
  matrix: MultiTimeframeSummary[];
  currentTimeframe: string;
  onSelectTimeframe: (tf: TimeFrame) => void;
}

export default function MultiTimeframeMatrix({
  matrix,
  currentTimeframe,
  onSelectTimeframe,
}: MultiTimeframeMatrixProps) {
  const getSignalBadge = (signal: string) => {
    switch (signal) {
      case 'STRONG_BUY':
      case 'BUY':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
      case 'STRONG_SELL':
      case 'SELL':
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/40';
      default:
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d1321] p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock size={16} className="text-amber-400" />
          Konfirmasi Multi-Timeframe (MTF Consensus)
        </h3>
        <span className="text-xs text-slate-400">Penyelarasan Tren XAU/USD</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-2.5 px-3">Timeframe</th>
              <th className="py-2.5 px-3">Arah Tren</th>
              <th className="py-2.5 px-3">Status Bollinger</th>
              <th className="py-2.5 px-3">Moving Average</th>
              <th className="py-2.5 px-3">RSI (14)</th>
              <th className="py-2.5 px-3 text-right">Konsensus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {matrix.map((item) => {
              const isSelected = currentTimeframe === item.timeframe;
              return (
                <tr
                  key={item.timeframe}
                  onClick={() => onSelectTimeframe(item.timeframe)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-amber-500/10 hover:bg-amber-500/15'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-3 px-3 font-semibold text-white flex items-center gap-2 font-sans">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-amber-400' : 'bg-transparent'
                      }`}
                    />
                    {item.name}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 font-sans">
                      {item.trend === 'UP' ? (
                        <>
                          <TrendingUp size={14} className="text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">BULLISH</span>
                        </>
                      ) : item.trend === 'DOWN' ? (
                        <>
                          <TrendingDown size={14} className="text-rose-400" />
                          <span className="text-rose-400 font-semibold">BEARISH</span>
                        </>
                      ) : (
                        <>
                          <Minus size={14} className="text-amber-400" />
                          <span className="text-amber-400">SIDEWAYS</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-sans">{item.bbStatus}</td>
                  <td className="py-3 px-3 text-slate-300 font-sans">{item.maStatus}</td>
                  <td className="py-3 px-3 text-slate-300">{item.rsiValue.toFixed(1)}</td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getSignalBadge(
                        item.signal
                      )}`}
                    >
                      {item.signal.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-slate-400">
        💡 <b>Tips Trading Forex:</b> Buka posisi hanya jika sinyal timeframe pendek (M5/M15) selaras dengan tren timeframe tinggi (H1/H4). Klik baris untuk berganti timeframe.
      </p>
    </div>
  );
}
