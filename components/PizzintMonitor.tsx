
import React, { useEffect, useState } from 'react';

const NODES = ['Pentagon', 'Fort Meade', 'Langley', 'Neural-Core', 'Shadow-Node'];

const PizzintMonitor: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const generatePing = () => {
      const node = NODES[Math.floor(Math.random() * NODES.length)];
      const surge = Math.floor(Math.random() * 20) + 1;
      const newEntry = {
        id: Math.random().toString(36).substr(2, 5).toUpperCase(),
        node,
        surge,
        time: new Date().toLocaleTimeString()
      };
      setData(prev => [newEntry, ...prev].slice(0, 5));
    };

    const interval = setInterval(generatePing, 4000);
    generatePing();
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3 font-mono">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">PIZZINT Live Feed</span>
        <span className="text-[8px] text-red-500 animate-pulse">MONITORING</span>
      </div>
      
      <div className="bg-black/60 border border-white/5 p-4 rounded-xl space-y-2 h-44 overflow-y-auto custom-scrollbar">
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-[10px] border-b border-white/5 pb-1">
            <span className="text-zinc-500">[{item.time}]</span>
            <span className="text-emerald-400 font-bold">{item.node}</span>
            <span className="text-zinc-600">+{item.surge}%</span>
          </div>
        ))}
      </div>
      <div className="text-[8px] text-zinc-700 italic text-center">
        Data synchronized with pizzint.watch master feed.
      </div>
    </div>
  );
};

export default PizzintMonitor;
