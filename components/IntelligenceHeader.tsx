
import React from 'react';
import { DoughconLevel } from '../types';

interface IntelligenceHeaderProps {
  doughcon: DoughconLevel;
  statusText: string;
}

const IntelligenceHeader: React.FC<IntelligenceHeaderProps> = ({ doughcon, statusText }) => {
  const getDoughconColor = (level: number) => {
    if (level === 1) return 'text-red-500 bg-red-500/10 border-red-500/50';
    if (level === 2) return 'text-orange-500 bg-orange-500/10 border-orange-500/50';
    if (level === 3) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/50';
    if (level === 4) return 'text-blue-400 bg-blue-500/10 border-blue-500/50';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/50';
  };

  const getDoughconStatus = (level: number) => {
    if (level === 1) return 'SEVERE_SURGE';
    if (level === 2) return 'HIGH_ACTIVITY';
    if (level === 3) return 'ELEVATED';
    if (level === 4) return 'GUARDED';
    return 'NOMINAL';
  };

  return (
    <div className="sticky top-0 z-[200] w-full bg-slate-950 border-b border-white/5 py-3 px-8 flex items-center justify-between shadow-2xl font-mono">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-3 h-3 ${doughcon <= 2 ? 'bg-red-500 animate-ping' : 'bg-emerald-500'} rounded-full absolute inset-0`}></div>
            <div className={`w-3 h-3 ${doughcon <= 2 ? 'bg-red-600' : 'bg-emerald-600'} rounded-full relative shadow-[0_0_15px_rgba(16,185,129,0.8)]`}></div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 leading-none">PIZZINT SURVEILLANCE</span>
            <span className="text-[7px] text-slate-600 uppercase tracking-widest mt-1">Status: {getDoughconStatus(doughcon)}</span>
          </div>
        </div>
        
        <div className="h-6 w-px bg-white/10 hidden md:block"></div>
        
        <div className="hidden md:flex items-center gap-4">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest">Uplink: OSINT_STABLE</span>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest">Feed: PIZZINT.WATCH</span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full border ${getDoughconColor(doughcon)} transition-all duration-500`}>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-pizza-slice text-[10px]"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">DOUGHCON {doughcon}</span>
          </div>
          <div className="w-px h-3 bg-current opacity-20"></div>
          <span className="text-[9px] font-bold uppercase tracking-tighter whitespace-nowrap">{statusText}</span>
        </div>
        
        <div className="hidden sm:block text-[9px] text-slate-500 bg-white/5 px-3 py-1 rounded-md border border-white/5">
          OSINT_ID_{Math.random().toString(36).substring(7).toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default IntelligenceHeader;
