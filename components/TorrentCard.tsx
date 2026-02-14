
import React from 'react';
import { TorrentResult } from '../types';

interface TorrentCardProps {
  torrent: TorrentResult;
}

const TorrentCard: React.FC<TorrentCardProps> = ({ torrent }) => {
  const getSafetyColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'text-green-500 border-green-500/30 bg-green-500/5';
      case 'SUSPICIOUS': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/5';
      case 'DANGEROUS': return 'text-red-500 border-red-500/30 bg-red-500/5';
      default: return 'text-zinc-500 border-white/5 bg-white/5';
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(torrent.magnetLink);
    alert('Magnet link copied to neural buffer.');
  };

  return (
    <div className={`p-6 rounded-[2rem] border ${getSafetyColor(torrent.safetyStatus)} transition-all hover:scale-[1.02] group shadow-xl relative overflow-hidden`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-1">Decrypted_Fragment</span>
          <h4 className="text-lg font-black uppercase italic tracking-tighter truncate max-w-[240px] text-white">
            {torrent.fileName}
          </h4>
        </div>
        <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getSafetyColor(torrent.safetyStatus)}`}>
           {torrent.safetyStatus}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Payload_Size</span>
          <span className="text-xs font-mono font-bold text-zinc-300">{torrent.size}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Health_Index</span>
          <div className="flex items-center gap-2">
             <div className="w-16 h-1 bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-1000" 
                  style={{ width: `${torrent.healthScore * 10}%` }}
                ></div>
             </div>
             <span className="text-[10px] font-black text-green-500">{torrent.healthScore}/10</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-4">
         <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest">Node: {torrent.sourceNode}</span>
         <button 
           onClick={copyToClipboard}
           className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-red-600/10 text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 text-zinc-400 hover:text-white"
         >
            <i className="fa-solid fa-magnet text-red-500"></i>
            Copy Magnet
         </button>
      </div>

      {/* Decorative HUD Scanline */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>
    </div>
  );
};

export default TorrentCard;
