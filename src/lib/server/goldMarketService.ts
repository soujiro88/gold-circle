import { Candle, TimeFrame } from '@/types/trading';
import { SPOT_TIMEFRAME_MAP, SPOT_GOLD_SYMBOL } from '@/constants/trading';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

interface YahooChartPayload {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: (number | null)[];
          high?: (number | null)[];
          low?: (number | null)[];
          close?: (number | null)[];
          volume?: (number | null)[];
        }>;
      };
    }>;
  };
}
interface GoldApiQuote {
  timestamp?: number;
  datetime?: string;
  price?: number;
  bid?: number;
  ask?: number;
  prev_close_price?: number;
  high_price?: number;
  low_price?: number;
  chp?: number;
  change_percent?: number;
}

export interface FetchedMarketData {
  candles: Candle[];
  currentPrice: number;
  dailyHigh: number;
  dailyLow: number;
  dailyChangePercent: number;
  provider: string;
}

async function fetchGoldApiQuote(): Promise<GoldApiQuote> {
  const apiKey = process.env.GOLDAPI_API_KEY || readExampleApiKey();
  if (!apiKey) throw new Error('GoldAPI belum dikonfigurasi. Isi GOLDAPI_API_KEY di environment server.');

  const response = await fetch('https://www.goldapi.io/api/price/XAU/USD', {
    headers: { Accept: 'application/json', 'x-access-token': apiKey },
    next: { revalidate: 30 },
  });
  if (!response.ok) throw new Error(`GoldAPI mengembalikan HTTP ${response.status}. Periksa API key dan kuota.`);

  const quote: GoldApiQuote = await response.json();
  if (typeof quote.price !== 'number' || quote.price <= 0) {
    throw new Error('GoldAPI tidak mengirim harga XAU/USD yang valid.');
  }
  return quote;
}

function readExampleApiKey(): string | undefined {
  try {
    const exampleEnv = readFileSync(join(process.cwd(), '.env.example'), 'utf8');
    const match = exampleEnv.match(/^GOLDAPI_API_KEY\s*=\s*(.*?)\s*$/m);
    const value = match?.[1]?.replace(/^['"]|['"]$/g, '');
    return value || undefined;
  } catch {
    return undefined;
  }
}

async function fetchSpotGoldCandles(timeframe: TimeFrame): Promise<Candle[]> {
  const cfg = SPOT_TIMEFRAME_MAP[timeframe] || SPOT_TIMEFRAME_MAP['1h'];
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${SPOT_GOLD_SYMBOL}?interval=${cfg.interval}&range=${cfg.range}`;
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 30 },
  });
  if (!response.ok) throw new Error(`Data candle historis mengembalikan HTTP ${response.status}.`);

  const payload: YahooChartPayload = await response.json();
  const result = payload.chart?.result?.[0];
  const timestamps = result?.timestamp;
  const quote = result?.indicators?.quote?.[0];
  if (!timestamps || !quote) throw new Error('Format candle historis XAU/USD tidak valid.');

  const candles: Candle[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const open = quote.open?.[i];
    const high = quote.high?.[i];
    const low = quote.low?.[i];
    const close = quote.close?.[i];
    if (open == null || high == null || low == null || close == null) continue;
    candles.push({
      time: timestamps[i],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: quote.volume?.[i] ?? 0,
    });
  }
  return candles;
}

export async function getLiveGoldMarketData(timeframe: TimeFrame): Promise<FetchedMarketData> {
  const [quote, candles] = await Promise.all([
    fetchGoldApiQuote(),
    fetchSpotGoldCandles(timeframe).catch(() => []),
  ]);
  const currentPrice = Number(quote.price!.toFixed(2));

  if (candles.length) {
    const lastIndex = candles.length - 1;
    candles[lastIndex] = {
      ...candles[lastIndex],
      close: currentPrice,
      high: Math.max(candles[lastIndex].high, currentPrice),
      low: Math.min(candles[lastIndex].low, currentPrice),
    };
  } else {
    candles.push({
      time: Math.floor((quote.timestamp ?? Date.now() / 1000) / 60) * 60,
      open: currentPrice,
      high: currentPrice,
      low: currentPrice,
      close: currentPrice,
      volume: 0,
    });
  }

  const previousClose = quote.prev_close_price || currentPrice;
  const dailyChangePercent = quote.chp ?? quote.change_percent ?? Number((((currentPrice - previousClose) / previousClose) * 100).toFixed(2));
  return {
    candles: candles.slice(-250),
    currentPrice,
    dailyHigh: quote.high_price ?? currentPrice,
    dailyLow: quote.low_price ?? currentPrice,
    dailyChangePercent: Number(dailyChangePercent.toFixed(2)),
    provider: `GoldAPI.io XAU/USD${quote.datetime ? ` · ${quote.datetime}` : ''}`,
  };
}
