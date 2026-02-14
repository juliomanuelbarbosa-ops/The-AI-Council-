
import React, { useState } from 'react';
import { logToSupabase } from '../services/supabaseService';
import PizzintMonitor from './PizzintMonitor';
import { DoughconLevel } from '../types';

interface WebToolsSidebarProps {
  logs: any[];
  doughcon: DoughconLevel;
}

const WebToolsSidebar: React.FC<WebToolsSidebarProps> = ({ logs, doughcon }) => {
  const [isTesting, setIsTesting] = useState(false);

  const getDoughconColor = (level: number) => {
    if (level === 1) return 'shadow-[0_0_50px_rgba(239,68,68,0.2)] border-red-500/30';
    if (level === 2) return 'shadow-[0_0_50px_rgba(249,115,22,0.2)] border-orange-500/30';
    if (level === 3) return 'shadow-[0_0_50px_rgba(234,179,8,0.2)] border-yellow-500/30';
    if (level === 4) return 'shadow-[0_0_50px_rgba(59,130,246,0.2)] border-blue-500/30';
    return 'shadow-[0_0_50px_rgba(16,185,129,0.2)] border-emerald-500/30';
  };

  const testTrigger = async (type: 'Zapier' | 'n8n') => {
    setIsTesting(true);
    const isCritical = doughcon <= 2;
    
    await logToSupabase(`Initiating ${type} PIZZINT Webhook Trigger... ${isCritical ? '[CRITICAL_MODE]' : '[TEST_MODE]'}`, 'INFO');
    
    // Simulate API call
    setTimeout(() => {
      setIsTesting(false);
      logToSupabase(`${type} Dough-Link Executed Successfully`, 'INFO');
      if (isCritical) {
        alert(`CRITICAL ALERT: ${type} Trigger bypassed safeguards due to DOUGHCON ${doughcon}!`);
      } else {
        alert(`${type} Webhook Trigger Sent! (Normal Status)`);
      }
    }, 1500);
  };

  return (
    <div className={`w-80 h-full bg-slate-950 border-l border-white/5 flex flex-col shrink-0 overflow-hidden transition-all duration-1000 ${getDoughconColor(doughcon)}`}>
      <div className="p-6 border-b border-white/5 bg-slate-900/50">
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-1">PIZZINT Command</h3>
        <p className="text-[9px] text-slate-500 font-mono italic">Tactical Delivery OSINT Monitor</p>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-8">
        
        {/* PIZZINT Monitor */}
        <section>
          <PizzintMonitor />
        </section>

        {/* Webhook Configuration */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">External Dough-Links</span>
            <i className="fa-solid fa-pizza-slice text-[10px] text-orange-500"></i>
          </div>
          
          <div className="space-y-3">
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-white tracking-widest font-mono">ZAPIER_CORE</span>
                <div className={`w-2 h-2 rounded-full ${doughcon <= 2 ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`}></div>
              </div>
              <button 
                onClick={() => testTrigger('Zapier')}
                disabled={isTesting}
                className="w-full py-2 bg-emerald-600/10 border border-emerald-500/20 rounded-lg text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all font-mono"
              >
                Fire Webhook
              </button>
            </div>

            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-white tracking-widest font-mono">N8N_FLOW</span>
                <div className={`w-2 h-2 rounded-full ${doughcon <= 2 ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`}></div>
              </div>
              <button 
                onClick={() => testTrigger('n8n')}
                disabled={isTesting}
                className="w-full py-2 bg-emerald-600/10 border border-emerald-500/20 rounded-lg text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all font-mono"
              >
                Fire Webhook
              </button>
            </div>
          </div>
        </section>

        {/* OSINT Audit Trail */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono">Supabase Audit Trail</span>
            <span className="text-[8px] font-mono text-emerald-500">ENCRYPTED</span>
          </div>
          
          <div className="bg-black/40 rounded-2xl border border-white/5 p-4 h-56 overflow-y-auto custom-scrollbar font-mono text-[9px] space-y-2">
            {logs.length === 0 ? (
              <div className="text-slate-800 italic uppercase">Awaiting OSINT Activity...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-slate-700">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={log.level === 'CRITICAL' ? 'text-red-500' : 'text-emerald-500'}>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="p-6 bg-slate-900/30 border-t border-white/5">
        <div className="flex items-center justify-between mb-2">
           <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest font-mono">Neural Quorum Load</span>
           <span className="text-[9px] font-mono text-emerald-400">DCON_{doughcon}</span>
        </div>
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000`} 
            style={{ width: `${(6 - doughcon) * 20}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default WebToolsSidebar;
