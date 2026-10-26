'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#070b14]/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              Au
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5 leading-none">
                GoldPulse <span className="text-amber-400 font-black">AI</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                XAU/USD Forex Predictor
              </div>
            </div>
          </Link>

          {/* Instrument Ticker Tag */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200">XAU/USD SPOT</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400 font-mono font-medium">Gold / US Dollar</span>
          </div>
        </div>

        {/* Live Market Badges & Nav */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-300 bg-slate-900/60 px-3 py-1 rounded-lg border border-slate-800/80">
            <span className="text-slate-500">Sesi:</span>
            <span className="text-emerald-400 font-medium">London / NY Overlap</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold"
            >
              Terminal
            </Link>
            <Link
              href="/post-table"
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Posts
            </Link>
            <Link
              href="/about"
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Tentang
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
