'use client';

import React from 'react';
import { History, CheckCircle, XCircle } from 'lucide-react';
import { TradeHistoryItem } from '@/types/trading';

export default function RecentSignalsHistory() {
  const history: TradeHistoryItem[] = [
    {
      id: 'TX-901',
      time: 'Hari ini, 18:30 WIB',
      pair: 'XAU/USD',
      timeframe: '15m',
      signal: 'STRONG_BUY',
      entryPrice: 2731.5,
      targetPrice: 2742.0,
      stopLoss: 2726.0,
      exitPrice: 2742.0,
      pips: +105,
      status: 'HIT_TP',
    },
    {
      id: 'TX-900',
      time: 'Hari ini, 14:15 WIB',
      pair: 'XAU/USD',
      timeframe: '1h',
      signal: 'BUY',
      entryPrice: 2725.2,
      targetPrice: 2736.0,
      stopLoss: 2719.5,
      exitPrice: 2736.0,
      pips: +108,
      status: 'HIT_TP',
    },
    {
      id: 'TX-899',
      time: 'Kemarin, 21:00 WIB',
      pair: 'XAU/USD',
      timeframe: '5m',
      signal: 'SELL',
      entryPrice: 2744.8,
      targetPrice: 2737.0,
      stopLoss: 2749.0,
      exitPrice: 2737.0,
      pips: +78,
      status: 'HIT_TP',
    },
    {
      id: 'TX-898',
      time: 'Kemarin, 16:45 WIB',
      pair: 'XAU/USD',
      timeframe: '15m',
      signal: 'STRONG_SELL',
      entryPrice: 2748.1,
      targetPrice: 2739.0,
      stopLoss: 2752.5,
      exitPrice: 2752.5,
      pips: -44,
      status: 'HIT_SL',
    },
    {
      id: 'TX-897',
      time: 'Kemarin, 11:20 WIB',
      pair: 'XAU/USD',
      timeframe: '1h',
      signal: 'BUY',
      entryPrice: 2718.4,
      targetPrice: 2730.0,
      stopLoss: 2713.0,
      exitPrice: 2730.0,
      pips: +116,
      status: 'HIT_TP',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d1321] p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History size={16} className="text-amber-400" />
            Riwayat Akurasi Sinyal Algoritmik (Track Record)
          </h3>
          <p className="text-xs text-slate-400">Verifikasi performa sinyal terkini</p>
        </div>

        {/* Win Rate Stats Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
            <span className="text-slate-400">Win Rate:</span>
            <span className="font-bold text-emerald-400">80.0% (4/5)</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
            <span className="text-slate-400">Net Gain:</span>
            <span className="font-bold text-amber-400 font-mono">+363 Pips</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-2.5 px-3">ID / Waktu</th>
              <th className="py-2.5 px-3">Instrumen</th>
              <th className="py-2.5 px-3">Sinyal</th>
              <th className="py-2.5 px-3">Entry</th>
              <th className="py-2.5 px-3">Target TP</th>
              <th className="py-2.5 px-3">Stop Loss</th>
              <th className="py-2.5 px-3">Hasil (Pips)</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {history.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-800/30">
                <td className="py-3 px-3">
                  <div className="font-semibold text-white">{tx.id}</div>
                  <div className="text-[10px] text-slate-500 font-sans">{tx.time}</div>
                </td>
                <td className="py-3 px-3 text-slate-300">
                  {tx.pair} ({tx.timeframe})
                </td>
                <td className="py-3 px-3 font-sans">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tx.signal.includes('BUY')
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {tx.signal.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-3 text-white">${tx.entryPrice.toFixed(2)}</td>
                <td className="py-3 px-3 text-emerald-400">${tx.targetPrice.toFixed(2)}</td>
                <td className="py-3 px-3 text-rose-400">${tx.stopLoss.toFixed(2)}</td>
                <td className="py-3 px-3 font-bold">
                  <span className={tx.pips > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {tx.pips > 0 ? `+${tx.pips}` : tx.pips} pips
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  {tx.status === 'HIT_TP' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle size={12} /> Target Hit
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                      <XCircle size={12} /> SL Hit
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
