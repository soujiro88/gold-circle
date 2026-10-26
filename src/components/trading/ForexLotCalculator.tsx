'use client';

import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { PredictionAnalysis } from '@/types/trading';

interface ForexLotCalculatorProps {
  prediction: PredictionAnalysis;
}

export default function ForexLotCalculator({
  prediction,
}: ForexLotCalculatorProps) {
  const [balance, setBalance] = useState<number>(1000);
  const [riskPercent, setRiskPercent] = useState<number>(2);
  const [customSLPips, setCustomSLPips] = useState<number>(
    Math.max(30, Math.round(Math.abs(prediction.currentPrice - prediction.stopLoss) * 10))
  );

  // Calculations for Gold (XAU/USD)
  // Standard Lot in Gold: 1 Lot = 100 oz. $1 move in price = $100 per lot (or 1 pip = $10 per lot).
  const riskAmount = (balance * riskPercent) / 100;
  const priceDistance = customSLPips / 10; // in USD
  const calculatedLots = priceDistance > 0 ? riskAmount / (priceDistance * 100) : 0.01;
  const roundedLots = Math.max(0.01, Number(calculatedLots.toFixed(2)));

  // Potential Profit based on TP1 and TP2
  const tp1Pips = Math.round(Math.abs(prediction.takeProfit1 - prediction.currentPrice) * 10);
  const tp2Pips = Math.round(Math.abs(prediction.takeProfit2 - prediction.currentPrice) * 10);
  const potentialProfitTP1 = Number(((tp1Pips / 10) * 100 * roundedLots).toFixed(2));
  const potentialProfitTP2 = Number(((tp2Pips / 10) * 100 * roundedLots).toFixed(2));

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0d1321] p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Calculator size={16} className="text-amber-400" />
          Kalkulator Lot & Manajemen Risiko (Money Management)
        </h3>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
          XAU/USD (1 Lot = 100 oz)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* Balance Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Saldo Akun Forex (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs">$</span>
            <input
              type="number"
              min="10"
              value={balance}
              onChange={(e) => setBalance(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-7 pr-3 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="flex gap-1.5 mt-1.5">
            {[500, 1000, 3000, 5000].map((preset) => (
              <button
                key={preset}
                onClick={() => setBalance(preset)}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white"
              >
                ${preset}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Percentage */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Toleransi Risiko (%)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="20"
              value={riskPercent}
              onChange={(e) => setRiskPercent(Math.max(0.1, Number(e.target.value)))}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
            />
            <span className="absolute right-3 top-2.5 text-slate-400 text-xs">%</span>
          </div>
          <div className="flex gap-1.5 mt-1.5">
            {[1, 2, 3, 5].map((preset) => (
              <button
                key={preset}
                onClick={() => setRiskPercent(preset)}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white"
              >
                {preset}%
              </button>
            ))}
          </div>
        </div>

        {/* Stop Loss Distance */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Jarak Stop Loss (Pips)
          </label>
          <div className="relative">
            <input
              type="number"
              min="10"
              value={customSLPips}
              onChange={(e) => setCustomSLPips(Math.max(5, Number(e.target.value)))}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
            />
            <span className="absolute right-3 top-2.5 text-slate-400 text-xs">Pips</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1.5">
            Sesuai Rekomendasi Algoritma: ~{Math.round(Math.abs(prediction.currentPrice - prediction.stopLoss) * 10)} pips
          </div>
        </div>
      </div>

      {/* Calculated Results Box */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
        <div className="p-2">
          <div className="text-[11px] text-slate-400">Rekomendasi Lot</div>
          <div className="text-xl font-black text-amber-400 font-mono">
            {roundedLots} <span className="text-xs font-normal text-slate-400">Lots</span>
          </div>
          <div className="text-[10px] text-slate-500">Ukuran Posisi Ideal</div>
        </div>

        <div className="p-2 border-l border-slate-800">
          <div className="text-[11px] text-rose-400">Maksimum Risiko ($)</div>
          <div className="text-xl font-bold text-rose-400 font-mono">
            ${riskAmount.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500">{riskPercent}% dari Saldo</div>
        </div>

        <div className="p-2 border-l border-slate-800">
          <div className="text-[11px] text-emerald-400">Target Profit TP1</div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            +${potentialProfitTP1}
          </div>
          <div className="text-[10px] text-slate-500">+{tp1Pips} pips gain</div>
        </div>

        <div className="p-2 border-l border-slate-800">
          <div className="text-[11px] text-emerald-300">Target Profit TP2</div>
          <div className="text-xl font-bold text-emerald-300 font-mono">
            +${potentialProfitTP2}
          </div>
          <div className="text-[10px] text-slate-500">+{tp2Pips} pips gain</div>
        </div>
      </div>
    </div>
  );
}
