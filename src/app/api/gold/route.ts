import { NextRequest, NextResponse } from 'next/server';
import { TimeFrame } from '@/types/trading';
import { getLiveGoldMarketData } from '@/lib/server/goldMarketService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tf = (searchParams.get('timeframe') as TimeFrame) || '1h';

  try {
    const marketData = await getLiveGoldMarketData(tf);

    return NextResponse.json({
      success: true,
      source: 'REAL_MARKET',
      ...marketData,
      timestamp: Date.now(),
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Unknown market error';
    return NextResponse.json(
      {
        success: false,
        source: 'FALLBACK',
        error: errMessage,
      },
      { status: 500 }
    );
  }
}
