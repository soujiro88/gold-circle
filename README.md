# GoldPulse AI • XAU/USD Forex Prediction & Technical Terminal

Aplikasi web modern berbasis **Next.js 16**, **React 19**, **TypeScript**, dan **Tailwind CSS** untuk memprediksi arah pergerakan harga emas (**XAU/USD** / Gold Spot) yang dilengkapi dengan interactive candlestick chart, indikator Bollinger Bands, Moving Average, serta sistem rekomendasi sinyal **BUY** / **SELL** forex berakurasi tinggi.

---

## 🌟 Fitur Utama

1. **Interactive Candlestick Chart (Lightweight Charts v5)**:
   - Grafik Candlestick real-time dengan zoom, pan, dan crosshair HUD.
   - Multi-timeframe: `1M`, `5M`, `15M`, `30M`, `1H`, `4H`, dan `1D`.
   - Visual marker panah **BUY** (hijau) dan **SELL** (merah) langsung pada candle.
   - Overlay indikator teknikal dengan tombol toggle langsung di chart:
     - **Bollinger Bands (20, 2)**: Pita atas, tengah (SMA 20), dan bawah.
     - **SMA 20**: Tren jangka pendek.
     - **SMA 50**: Tren jangka menengah.
     - **EMA 200**: Baseline tren utama institusional.

2. **Mesin Prediksi & Rekomendasi Sinyal Forex**:
   - Menghasilkan rekomendasi: **STRONG BUY**, **BUY**, **NEUTRAL / WAIT**, **SELL**, atau **STRONG SELL**.
   - Dilengkapi **Tingkat Keyakinan (Confidence Score %)**.
   - **Rencana Trading Lengkap**:
     - Rekomendasi Area Entry ($)
     - Dynamic Stop Loss (SL) berbasis ATR (Average True Range)
     - Take Profit 1 (TP1) & Take Profit 2 (TP2)
     - Rasio Risk to Reward (RRR)
     - Proyeksi target harga Next 1 Jam, 4 Jam, dan 24 Jam.
   - Tombol **Salin Sinyal** satu kali klik untuk ditempel ke MT4/MT5/Telegram.

3. **Status Detail Indikator Teknikal**:
   - Status Bollinger Bands (Oversold Rebound, Overbought Rejection, Squeeze, Expansion).
   - Moving Average Consensus (Golden Cross, Death Cross, Bullish/Bearish Alignment).
   - Gauge RSI (14) dengan deteksi kondisi jenuh jual (<30) dan jenuh beli (>70).
   - Indikator Momentum MACD (12, 26, 9) dan histogram.

4. **Kalkulator Lot & Manajemen Risiko Forex (Money Management)**:
   - Khusus instrumen XAU/USD (1 Lot = 100 troy oz).
   - Menghitung ukuran lot optimal berdasarkan saldo akun ($), toleransi risiko (%), dan jarak Stop Loss (pips).
   - Estimasi profit dalam dollar pada level TP1 dan TP2.

5. **Multi-Timeframe Trend Matrix (MTF)**:
   - Penyelarasan tren antar timeframe: 5M (Scalping), 15M (Intraday), 1H (Swing), 4H (Trend), dan 1D (Macro).

6. **Konteks Pasar Makro & Pivot Points**:
   - Korelasi US Dollar Index (DXY) dan Yield Obligasi US 10-Year.
   - Rasio Sentimen Pasar Buyer vs Seller.
   - Level Kunci Pivot Points harian (Central Pivot, R1-R3, S1-S3).

7. **Live Tick Simulation & Audio Notifikasi**:
   - Simulator tick harga live setiap 1.5 detik dengan efek visual flash hijau/merah.
   - Notifikasi suara arpeggio sintetis (Web Audio API) ketika terjadi perubahan sinyal trading.

---

## 🚀 Cara Menjalankan

1. **Install dependensi** (jika belum):
   ```bash
   npm install
   ```

2. **Jalankan development server**:
   ```bash
   npm run dev
   ```

3. Buka browser dan akses:
   [http://localhost:3000](http://localhost:3000)

4. **Build untuk production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 📁 Struktur Direktori

```
src/
├── app/
│   ├── layout.tsx         # Root layout dengan tema dark financial
│   ├── globals.css        # Konfigurasi Tailwind CSS v4 & styling
│   └── page.tsx           # Halaman utama Trading Terminal XAU/USD
├── components/
│   ├── Header.tsx         # Navbar dengan status pasar sesi London/NY
│   ├── Footer.tsx         # Footer dengan disclaimer risiko forex
│   └── trading/
│       ├── GoldChart.tsx                   # TradingView Lightweight Candlestick Chart
│       ├── SignalRecommendationCard.tsx    # Rekomendasi BUY/SELL & Target Harga
│       ├── IndicatorSummaryPanel.tsx       # Status Bollinger, MA, RSI, MACD
│       ├── ForexLotCalculator.tsx          # Kalkulator Lot & Money Management
│       ├── MultiTimeframeMatrix.tsx        # Matriks konsensus multi-timeframe
│       ├── MarketDriversWidget.tsx         # Makro DXY, 10Y Yields & Pivot Points
│       └── RecentSignalsHistory.tsx        # Log riwayat akurasi sinyal
├── lib/
│   ├── goldData.ts        # Generator & simulator pergerakan harga emas
│   ├── indicators.ts      # Rumus matematis BB, SMA, EMA, RSI, MACD, ATR, Pivots
│   ├── prediction.ts      # Algoritma analisis konfluensi sinyal & target
│   └── sound.ts           # Synthesizer audio notifikasi sinyal (Web Audio API)
└── types/
    └── trading.ts         # TypeScript interface instrumen trading & indikator
```

---

## ⚠️ Peringatan Risiko (Risk Disclosure)
Trading instrumen Forex dan komoditas (khususnya emas XAU/USD) mengandung risiko finansial tinggi karena faktor leverage dan volatilitas pasar. Analisis dan sinyal dalam aplikasi ini dihasilkan secara otomatis menggunakan kombinasi indikator teknikal (Bollinger Bands, Moving Average, RSI, MACD, ATR) untuk tujuan edukasi dan analitis.
