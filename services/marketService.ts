
export interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  isBanker?: boolean;
}

export interface MarketData {
  gainers: MarketQuote[];
  losers: MarketQuote[];
}

const MOCK_STOCKS: MarketData = {
  gainers: [
    { symbol: 'NVDA', price: 135.22, change: 4.50, changePercent: 3.44 },
    { symbol: 'TSLA', price: 248.10, change: 12.30, changePercent: 5.22 },
    { symbol: 'AAPL', price: 224.15, change: 2.10, changePercent: 0.95 },
    { symbol: 'PLTR', price: 38.45, change: 1.85, changePercent: 5.05 },
    { symbol: 'AMD', price: 162.30, change: 3.40, changePercent: 2.14 },
  ],
  losers: [
    { symbol: 'INTC', price: 19.45, change: -1.20, changePercent: -5.81 },
    { symbol: 'BA', price: 155.10, change: -4.30, changePercent: -2.70 },
    { symbol: 'NKE', price: 82.15, change: -0.95, changePercent: -1.14 },
    { symbol: 'DJT', price: 14.20, change: -2.10, changePercent: -12.88 },
    { symbol: 'SBUX', price: 92.40, change: -0.50, changePercent: -0.54 },
  ]
};

const MOCK_CRYPTO: MarketData = {
  gainers: [
    { symbol: 'BTC', price: 64230.15, change: 1200.50, changePercent: 1.90 },
    { symbol: 'SOL', price: 152.45, change: 8.30, changePercent: 5.76 },
    { symbol: 'KAS', price: 0.1652, change: 0.012, changePercent: 7.84 },
    { symbol: 'PEPE', price: 0.0000084, change: 0.000001, changePercent: 13.50 },
    { symbol: 'SUI', price: 1.88, change: 0.15, changePercent: 8.67 },
    { symbol: 'TAO', price: 542.10, change: 45.30, changePercent: 9.12 },
  ],
  losers: [
    { symbol: 'ETH', price: 2640.12, change: -45.20, changePercent: -1.68 },
    { symbol: 'DOGE', price: 0.108, change: -0.005, changePercent: -4.42 },
    { symbol: 'XRP', price: 0.58, change: -0.02, changePercent: -3.33 },
    { symbol: 'AVAX', price: 27.15, change: -1.10, changePercent: -3.89 },
    { symbol: 'LINK', price: 12.40, change: -0.35, changePercent: -2.75 },
  ]
};

const MOCK_BANKERS: MarketData = {
  gainers: [
    { symbol: 'REAL MADRID (W)', price: 1.45, change: 0.20, changePercent: 88, isBanker: true },
    { symbol: 'LIVERPOOL (W)', price: 1.82, change: 0.15, changePercent: 74, isBanker: true },
    { symbol: 'MAN CITY (W)', price: 1.30, change: 0.05, changePercent: 92, isBanker: true },
    { symbol: 'BTTS: ARS vs CHE', price: 1.65, change: 0.10, changePercent: 81, isBanker: true },
  ],
  losers: [
    { symbol: 'UFC: PEREIRA (KO)', price: 1.55, change: -0.05, changePercent: 65, isBanker: false },
    { symbol: 'NFL: CHIEFS (W)', price: 1.42, change: -0.10, changePercent: 58, isBanker: false },
  ]
};

const MOCK_POLYMARKET: MarketData = {
  gainers: [
    { symbol: 'Will Fed cut rates in March?', price: 0.72, change: 0.05, changePercent: 72 },
    { symbol: 'Will BTC hit $100k in 2025?', price: 0.48, change: 0.02, changePercent: 48 },
    { symbol: 'Next UK Prime Minister?', price: 0.85, change: 0.01, changePercent: 85 },
    { symbol: 'Will GTA 6 be delayed?', price: 0.25, change: 0.10, changePercent: 25 },
  ],
  losers: [
    { symbol: 'Will it rain in London tomorrow?', price: 0.90, change: -0.05, changePercent: 90 },
    { symbol: 'Will SpaceX land on Mars in 2026?', price: 0.05, change: -0.01, changePercent: 5 },
  ]
};

/**
 * To use real Alpaca API keys:
 * 1. Ensure process.env.ALPACA_API_KEY and process.env.ALPACA_SECRET_KEY are set.
 * 2. Update the fetch calls to the Alpaca Market Data v2 endpoints.
 */
export const fetchMarketIntelligence = async (type: 'stocks' | 'crypto' | 'bankers' | 'polymarket'): Promise<MarketData> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (type === 'stocks') return MOCK_STOCKS;
  if (type === 'crypto') return MOCK_CRYPTO;
  if (type === 'bankers') return MOCK_BANKERS;
  return MOCK_POLYMARKET;
};
