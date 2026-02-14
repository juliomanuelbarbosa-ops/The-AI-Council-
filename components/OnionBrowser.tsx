
import React, { useState, useEffect, useRef } from 'react';
import { performTorrentSearch } from '../services/geminiService';
import TorrentCard from './TorrentCard';
import { TorrentResult } from '../types';

interface OnionBrowserProps {
  initialMode?: 'search' | 'torrent';
  onClose: () => void;
  onInjectIntel: (intel: string) => void;
}

const OnionBrowser: React.FC<OnionBrowserProps> = ({ initialMode = 'search', onClose, onInjectIntel }) => {
  const [mode, setMode] = useState<'search' | 'torrent'>(initialMode);
  const [url, setUrl] = useState(initialMode === 'search' ? 'onion://shadow.search' : 'onion://torrent.node');
  const [input, setInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [torrentResults, setTorrentResults] = useState<TorrentResult[]>([]);
  const [hops, setHops] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const NODE_LOCATIONS = ['GERMANY', 'SINGAPORE', 'ICELAND', 'BRAZIL', 'JAPAN', 'SWITZERLAND'];

  useEffect(() => {
    // Simulate Tor circuit establishment
    const establishCircuit = async () => {
      const selectedHops = [];
      for (let i = 0; i < 3; i++) {
        await new Promise(r => setTimeout(r, 600));
        selectedHops.push(NODE_LOCATIONS[Math.floor(Math.random() * NODE_LOCATIONS.length)]);
        setHops([...selectedHops]);
      }
      setIsConnecting(false);
    };
    establishCircuit();
  }, []);

  useEffect(() => {
    setUrl(mode === 'search' ? 'onion://shadow.search' : 'onion://torrent.node');
  }, [mode]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSearching) return;

    setIsSearching(true);
    setResults([]);
    setTorrentResults([]);
    
    try {
      if (mode === 'torrent') {
        const torrents = await performTorrentSearch(input);
        setTorrentResults(torrents);
      } else {
        const ai = new (await import("@google/genai")).GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Extract deep-dive shadow intel on: "${input}". Focus on non-obvious details.`,
          config: { tools: [{ googleSearch: {} }] },
        });

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        setResults([{
          id: Date.now(),
          source: 'DECRYPTED_NODE',
          content: response.text || "",
          links: chunks.map((c: any) => c.web?.uri).filter(Boolean)
        }]);
      }
    } catch (err) {
      setResults([{ id: Date.now(), source: 'ERROR', content: 'Uplink severed. Node timed out.' }]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl h-[80vh] bg-[#050505] border border-green-500/30 rounded-lg flex flex-col shadow-[0_0_100px_rgba(34,197,94,0.1)] overflow-hidden font-mono">
        
        {/* Browser Top Bar */}
        <div className="p-4 bg-zinc-900 flex items-center gap-4 border-b border-green-500/20">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
          </div>
          <div className="flex-grow flex items-center gap-2 px-4 py-1.5 bg-black rounded border border-green-500/10">
            <i className={`fa-solid ${mode === 'torrent' ? 'fa-magnet text-red-500' : 'fa-lock text-green-500'} text-[10px]`}></i>
            <span className="text-[10px] text-zinc-500 tracking-wider lowercase">{url}</span>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {/* Browser Navigation / Tools */}
        <div className="px-6 py-2 bg-zinc-900/50 border-b border-green-500/10 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="flex bg-black rounded-lg p-1 border border-white/5 mr-4">
                 <button onClick={() => setMode('search')} className={`px-4 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'search' ? 'bg-green-500 text-black' : 'text-zinc-500 hover:text-zinc-300'}`}>Search</button>
                 <button onClick={() => setMode('torrent')} className={`px-4 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'torrent' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Torrents</button>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-green-600 flex items-center gap-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${isConnecting ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,1)]'}`}></div>
                 {isConnecting ? 'Building Circuit...' : 'Circuit Established'}
              </span>
              <div className="flex gap-2">
                 {hops.map((hop, i) => (
                    <div key={i} className="flex items-center gap-2">
                       <span className="text-[8px] text-zinc-500 px-2 py-0.5 border border-zinc-800 rounded">{hop}</span>
                    </div>
                 ))}
              </div>
           </div>
           <div className="flex items-center gap-3">
              <i className="fa-solid fa-ghost text-zinc-800"></i>
              <span className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.2em]">Incognito_Mode: 100% Stealth</span>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-12 custom-scrollbar relative" ref={scrollRef}>
          {isConnecting ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
               <div className="w-20 h-20 mb-6 relative">
                  <div className="absolute inset-0 border-2 border-green-500/20 rounded-full animate-spin-slow"></div>
                  <div className="absolute inset-2 border-2 border-green-500/40 border-t-transparent rounded-full animate-spin"></div>
                  <i className="fa-solid fa-eye-slash absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-green-500/40"></i>
               </div>
               <p className="text-zinc-500 text-xs tracking-[0.4em] uppercase font-black animate-pulse">Routing through Onion layers...</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-12">
               {/* Search Engine Interface */}
               <div className="flex flex-col items-center">
                  <div className="mb-10 text-center">
                     <h2 className={`text-4xl font-black italic tracking-tighter uppercase mb-1 ${mode === 'torrent' ? 'text-red-500' : 'text-white'}`}>
                       {mode === 'torrent' ? 'Torrent Hub' : 'Onion Search'}
                     </h2>
                     <p className="text-green-600 text-[10px] font-black uppercase tracking-[0.5em]">Shadow Web Link v0.92</p>
                  </div>
                  
                  <div className={`${mode === 'torrent' ? 'bg-red-950/20 border-red-500/20' : 'bg-transparent border-green-500/20'} p-8 rounded-[2.5rem] border w-full transition-all`}>
                    <div className="flex items-center gap-3 mb-6">
                       <i className={`fa-solid ${mode === 'torrent' ? 'fa-magnet text-red-500' : 'fa-search text-green-500'} text-xs`}></i>
                       <span className={`text-[9px] font-black uppercase tracking-[0.4em] ${mode === 'torrent' ? 'text-red-500' : 'text-zinc-600'}`}>
                          {mode === 'torrent' ? 'DECENTRALIZED MAGNET SEARCH' : 'GLOBAL DATA EXTRACTION'}
                       </span>
                    </div>
                    <form onSubmit={handleSearch} className="w-full relative group">
                        <input 
                          type="text" 
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder={mode === 'torrent' ? "INPUT FILENAME OR MAGNET FRAGMENT..." : "SEARCH DATA FRAGMENTS..."}
                          className={`w-full bg-black border ${mode === 'torrent' ? 'border-red-500/20 focus:border-red-500/60 focus:shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-green-500/20 focus:border-green-500/60 focus:shadow-[0_0_30px_rgba(34,197,94,0.1)]'} rounded-2xl py-5 px-10 text-zinc-300 focus:outline-none transition-all placeholder:text-zinc-800 uppercase tracking-widest text-xs`}
                        />
                        <button type="submit" className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl ${mode === 'torrent' ? 'bg-red-600' : 'bg-green-500'} text-black flex items-center justify-center hover:opacity-80 transition-all shadow-xl`}>
                          <i className={`fa-solid ${isSearching ? 'fa-circle-notch animate-spin' : (mode === 'torrent' ? 'fa-magnet' : 'fa-search')} text-xs`}></i>
                        </button>
                    </form>
                  </div>
               </div>

               {/* Results Area */}
               <div className="space-y-8 pb-10">
                  {results.map(res => (
                    <div key={res.id} className="p-8 rounded-2xl bg-zinc-950 border border-green-500/10 animate-fadeIn group">
                       <div className="flex justify-between items-center mb-6">
                          <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">[{res.source}]</span>
                          <button 
                             onClick={() => onInjectIntel(res.content)}
                             className="text-[9px] font-black text-zinc-700 hover:text-green-500 uppercase tracking-widest flex items-center gap-2 transition-colors"
                          >
                             <i className="fa-solid fa-download"></i>
                             Inject into Council
                          </button>
                       </div>
                       <div className="text-sm leading-relaxed text-zinc-400 whitespace-pre-wrap font-inter">
                          {res.content}
                       </div>
                       {res.links && res.links.length > 0 && (
                          <div className="mt-8 pt-6 border-t border-zinc-900 space-y-3">
                             {res.links.map((link: string, li: number) => (
                                <a key={li} href={link} target="_blank" className="block text-[9px] text-green-700 hover:text-green-500 transition-colors truncate">
                                   <i className="fa-solid fa-link mr-2"></i>
                                   {link}
                                </a>
                             ))}
                          </div>
                       )}
                    </div>
                  ))}

                  {torrentResults.length > 0 && (
                    <div className="grid grid-cols-1 gap-6 animate-fadeIn">
                       <div className="flex items-center gap-4 mb-2">
                          <i className="fa-solid fa-shield-halved text-green-500 text-xs"></i>
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Triple-Agent Protocol Verified Results</span>
                       </div>
                       {torrentResults.map((t, idx) => (
                         <TorrentCard key={idx} torrent={t} />
                       ))}
                    </div>
                  )}

                  {isSearching && mode === 'torrent' && (
                    <div className="space-y-6">
                       <div className="p-6 rounded-2xl bg-zinc-900/50 border border-red-500/10 flex items-center gap-6 animate-pulse">
                          <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center text-red-500">
                             <i className="fa-solid fa-magnifying-glass"></i>
                          </div>
                          <div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Clanker Discovery Active</span>
                             <p className="text-[8px] text-zinc-600 uppercase tracking-widest">Scanning decentralized trackers...</p>
                          </div>
                       </div>
                       <div className="p-6 rounded-2xl bg-zinc-900/50 border border-yellow-500/10 flex items-center gap-6 animate-pulse delay-75">
                          <div className="w-10 h-10 rounded-full bg-yellow-600/20 flex items-center justify-center text-yellow-500">
                             <i className="fa-solid fa-skull"></i>
                          </div>
                          <div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">ReaperAI Security Audit</span>
                             <p className="text-[8px] text-zinc-600 uppercase tracking-widest">Analyzing metadata signatures...</p>
                          </div>
                       </div>
                       <div className="p-6 rounded-2xl bg-zinc-900/50 border border-blue-500/10 flex items-center gap-6 animate-pulse delay-150">
                          <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500">
                             <i className="fa-solid fa-code"></i>
                          </div>
                          <div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Smolagents Health Check</span>
                             <p className="text-[8px] text-zinc-600 uppercase tracking-widest">Simulating seeder throughput...</p>
                          </div>
                       </div>
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>

        {/* Browser Footer */}
        <div className="p-4 bg-zinc-900 border-t border-green-500/10 flex justify-between items-center px-8">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,1)]"></div>
                 <span className="text-[8px] text-zinc-500 uppercase font-black">Secure</span>
              </div>
              <span className="text-[8px] text-zinc-700 uppercase font-black tracking-widest">AES-256 Enabled</span>
           </div>
           <span className="text-[8px] text-zinc-800 uppercase font-black tracking-[0.4em]">Shadow_Web_Extraction_Active</span>
        </div>
      </div>
      <style>{`
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        .animate-shimmer { animation: shimmer 2s infinite; }
      `}</style>
    </div>
  );
};

export default OnionBrowser;
