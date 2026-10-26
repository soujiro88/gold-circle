'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';

interface StrategyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StrategyGuideModal({ isOpen, onClose }: StrategyGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0d1321] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen size={18} className="text-amber-400" />
            Panduan Strategi Trading Emas (XAU/USD)
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
              1. Sumber Data Pasar Spot Emas (XAU/USD Spot)
            </h4>
            <p>
              Aplikasi ini mengambil data candlestick historis dan kuotasi harga langsung dari <b>Pasar Spot Emas Fisik (London Bullion Market Association - LBMA / PAX Gold)</b> dan fixing spot <code className="text-amber-300">XAU/USD</code> secara continuous 24/7. Hal ini memastikan harga mencerminkan pasar spot riil tanpa distorsi roll kontrak berjangka (futures).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
              2. Bollinger Bands (20, 2)
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>
                <b className="text-emerald-400">Lower Band Touch:</b> Ketika candlestick menyentuh atau menembus pita bawah lalu ditutup kembali ke dalam, ini mengindikasikan jenuh jual (oversold) dan memicu sinyal <b>BUY</b> untuk pembalikan arah (mean-reversion).
              </li>
              <li>
                <b className="text-rose-400">Upper Band Touch:</b> Ketika harga membentur pita atas dan membentuk penolakan, mengindikasikan jenuh beli (overbought) dan memicu sinyal <b>SELL</b>.
              </li>
              <li>
                <b className="text-sky-400">Bollinger Squeeze:</b> Saat kedua pita merapat sangat sempit, pasar sedang mengumpulkan energi sebelum terjadi lonjakan tren besar.
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
              3. Moving Average (SMA 20, SMA 50 & EMA 200)
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>
                <b className="text-emerald-400">Golden Cross:</b> Terjadi saat SMA 20 melintas naik di atas SMA 50. Konfirmasi dorongan momentum beli.
              </li>
              <li>
                <b className="text-rose-400">Death Cross:</b> Terjadi saat SMA 20 melintas turun ke bawah SMA 50. Konfirmasi momentum jual.
              </li>
              <li>
                <b className="text-purple-400">EMA 200 Baseline:</b> Filter tren utama institusi. Jika harga berada di atas EMA 200, utamakan hanya posisi <b>BUY</b>. Jika di bawah EMA 200, utamakan posisi <b>SELL</b>.
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
              4. Manajemen Risiko Forex XAU/USD
            </h4>
            <p>
              Emas memiliki volatilitas tinggi ($1 pergerakan = 10 pips). Selalu gunakan Stop Loss (SL) yang telah dihitung oleh kalkulator lot di sebelah kanan, dan jangan resikokan lebih dari 1-2% modal per transaksi.
            </p>
          </div>
        </div>

        <div className="mt-5 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
