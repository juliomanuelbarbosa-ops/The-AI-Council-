
export interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
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

/**
 * To use real Alpaca API keys:
 * 1. Ensure process.env.ALPACA_API_KEY and process.env.ALPACA_SECRET_KEY are set.
 * 2. Update the fetch calls to the Alpaca Market Data v2 endpoints.
 */
export const fetchMarketIntelligence = async (type: 'stocks' | 'crypto'): Promise<MarketData> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Logic to return mock or real data
  // For production, you'd fetch from: https://data.alpaca.markets/v2/stocks/snapshots
  return type === 'stocks' ? MOCK_STOCKS : MOCK_CRYPTO;
};
