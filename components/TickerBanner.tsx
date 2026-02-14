
import React, { useState, useEffect, useMemo } from 'react';
import { fetchMarketIntelligence, MarketData, MarketQuote } from '../services/marketService';

const TickerBanner: React.FC = () => {
  const [assetType, setAssetType] = useState<'stocks' | 'crypto'>('stocks');
  const [data, setData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const result = await fetchMarketIntelligence(assetType);
      setData(result);
      setError(null);
    } catch (err) {
      setError("Intel Link Failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // 60s refresh
    return () => clearInterval(interval);
  }, [assetType]);

  const allQuotes = useMemo(() => {
    if (!data) return [];
    return [...data.gainers, ...data.losers];
  }, [data]);

  // FIX: Explicitly typed as React.FC to allow JSX-standard props like 'key' during list rendering
  const TickerItem: React.FC<{ quote: MarketQuote }> = ({ quote }) => (
    <div className="inline-flex items-center gap-4 px-8 border-r border-white/5 py-3">
      <span className="text-[11px] font-black tracking-widest text-zinc-400">{quote.symbol}</span>
      <span className="text-[11px] font-mono font-bold text-white">
        ${quote.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: quote.price < 1 ? 6 : 2 })}
      </span>
      <span className={`text-[10px] font-black flex items-center gap-1 ${quote.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
        <i className={`fa-solid fa-caret-${quote.change >= 0 ? 'up' : 'down'}`}></i>
        {Math.abs(quote.changePercent).toFixed(2)}%
      </span>
    </div>
  );

  return (
    <div className="w-full bg-black/40 backdrop-blur-md border-b border-white/5 flex flex-col md:flex-row items-center overflow-hidden">
      {/* Label & Toggle */}
      <div className="flex items-center gap-4 px-6 py-3 border-r border-white/5 bg-black/20 shrink-0 z-10 w-full md:w-auto justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Global_Pulse</span>
        </div>
        <div className="flex bg-zinc-900/50 p-1 rounded-lg border border-white/5">
          <button 
            onClick={() => setAssetType('stocks')}
            className={`px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${assetType === 'stocks' ? 'bg-white text-black' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            Stocks
          </button>
          <button 
            onClick={() => setAssetType('crypto')}
            className={`px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${assetType === 'crypto' ? 'bg-white text-black' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            Crypto
          </button>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="relative flex-grow overflow-hidden flex items-center h-10 md:h-auto">
        {isLoading && !data ? (
          <div className="px-6 flex items-center gap-3">
            <i className="fa-solid fa-circle-notch animate-spin text-zinc-800 text-xs"></i>
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-800">Syncing Market Nodes...</span>
          </div>
        ) : error ? (
          <div className="px-6 text-rose-500 text-[9px] font-black uppercase tracking-widest">
            {error}
          </div>
        ) : (
          <div className="flex whitespace-nowrap animate-marquee">
            {/* Double mapping for infinite scroll effect */}
            {allQuotes.map((q, i) => <TickerItem key={`${q.symbol}-${i}`} quote={q} />)}
            {allQuotes.map((q, i) => <TickerItem key={`${q.symbol}-repeat-${i}`} quote={q} />)}
            {allQuotes.map((q, i) => <TickerItem key={`${q.symbol}-repeat2-${i}`} quote={q} />)}
          </div>
        )}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default TickerBanner;
