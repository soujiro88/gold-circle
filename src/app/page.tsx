'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useGoldMarket } from '@/hooks/useGoldMarket';
import { getGoldMarketContext } from '@/lib/goldData';
import MarketHeader from '@/components/trading/MarketHeader';
import MarketConnectionBanner from '@/components/trading/MarketConnectionBanner';
import SignalRecommendationCard from '@/components/trading/SignalRecommendationCard';
import IndicatorSummaryPanel from '@/components/trading/IndicatorSummaryPanel';
import MultiTimeframeMatrix from '@/components/trading/MultiTimeframeMatrix';
import ForexLotCalculator from '@/components/trading/ForexLotCalculator';
import MarketDriversWidget from '@/components/trading/MarketDriversWidget';
import RecentSignalsHistory from '@/components/trading/RecentSignalsHistory';
import StrategyGuideModal from '@/components/trading/StrategyGuideModal';

// Dynamically import GoldChart with SSR disabled to ensure Lightweight Charts canvas attaches cleanly to window
const GoldChart = dynamic(() => import('@/components/trading/GoldChart'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] rounded-2xl bg-[#090d16] border border-slate-800 flex flex-col items-center justify-center text-slate-400 gap-3">
      <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm font-medium">Memuat Candlestick Chart XAU/USD Real-Time...</span>
    </div>
  ),
});

export default function GoldPredictionPage() {
  const {
    timeframe,
    setTimeframe,
    candles,
    prediction,
    mtfMatrix,
    isLive,
    toggleLive,
    soundEnabled,
    toggleSound,
    lastTickDirection,
    dataSource,
    dataProvider,
    isLoadingMarket,
    realStats,
    refresh,
    currentPrice,
  } = useGoldMarket();

  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const marketCtx = getGoldMarketContext(currentPrice);

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 py-6 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Live Ticker Header Bar */}
        <MarketHeader
          currentPrice={currentPrice}
          lastTickDirection={lastTickDirection}
          dataSource={dataSource}
          dataProvider={dataProvider}
          isLoadingMarket={isLoadingMarket}
          realStats={realStats}
          goldSpread={marketCtx.goldSpread}
          onRefresh={refresh}
          onOpenGuide={() => setShowGuideModal(true)}
        />

        {/* Real-time Connection Notice Banner */}
        <MarketConnectionBanner timeframe={timeframe} />

        {/* Main Dashboard Grid */}
        {prediction && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Candlestick Chart & Technical Status Panels (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <GoldChart
                candles={candles}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
                prediction={prediction}
                isLive={isLive}
                onToggleLive={toggleLive}
                soundEnabled={soundEnabled}
                onToggleSound={toggleSound}
              />

              <IndicatorSummaryPanel prediction={prediction} />
            </div>

            {/* Right Column: Signal Recommendation & Lot Risk Calculator (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <SignalRecommendationCard prediction={prediction} />

              <ForexLotCalculator prediction={prediction} />
            </div>
          </div>
        )}

        {/* Secondary Row: Multi-Timeframe Matrix & Macro Drivers */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <MultiTimeframeMatrix
              matrix={mtfMatrix}
              currentTimeframe={timeframe}
              onSelectTimeframe={setTimeframe}
            />
          </div>

          <div className="lg:col-span-6">
            <MarketDriversWidget candles={candles} currentPrice={currentPrice} />
          </div>
        </div>

        {/* Tertiary Row: Backtested Track Record & History */}
        <RecentSignalsHistory />

        {/* Educational Strategy Guide Modal */}
        <StrategyGuideModal
          isOpen={showGuideModal}
          onClose={() => setShowGuideModal(false)}
        />
      </div>
    </div>
  );
}
