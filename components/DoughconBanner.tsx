
import React from 'react';
import { DoughconLevel } from '../types';

interface DoughconBannerProps {
  level: DoughconLevel;
}

const DoughconBanner: React.FC<DoughconBannerProps> = ({ level }) => {
  const getDoughconConfig = (lv: DoughconLevel) => {
    switch (lv) {
      case 1:
        return {
          text: "SEVERE: EXTREME OPERATIONAL TEMPO",
          desc: "Pizzint.watch reports 500% surge. War room saturation.",
          color: "bg-red-600",
          border: "border-red-400",
          fontColor: "text-white",
          animate: "animate-pulse"
        };
      case 2:
        return {
          text: "HIGH: INTEL ACTIVITY DETECTED",
          desc: "Significant delivery spikes near underground nodes.",
          color: "bg-orange-600",
          border: "border-orange-400",
          fontColor: "text-white",
          animate: ""
        };
      case 3:
        return {
          text: "ELEVATED: SIGNIFICANT SPIKES",
          desc: "Trending above baseline metrics. Preparation underway.",
          color: "bg-yellow-600",
          border: "border-yellow-400",
          fontColor: "text-black",
          animate: ""
        };
      case 4:
        return {
          text: "GUARDED: INCREASED ORDERS",
          desc: "Late night operations observed. Monitoring throughput.",
          color: "bg-blue-600",
          border: "border-blue-400",
          fontColor: "text-white",
          animate: ""
        };
      case 5:
      default:
        return {
          text: "SAFE: NORMAL ACTIVITY",
          desc: "Nominal caloric intake. Domestic nodes stable.",
          color: "bg-emerald-600",
          border: "border-emerald-400",
          fontColor: "text-white",
          animate: ""
        };
    }
  };

  const config = getDoughconConfig(level);

  return (
    <div className={`sticky top-0 z-[250] ${config.color} ${config.fontColor} py-2 px-8 border-b-2 ${config.border} shadow-2xl transition-all duration-700 font-mono flex items-center justify-between`}>
      <div className="flex items-center gap-4">
        <div className="bg-black/20 px-2 py-0.5 border border-white/20 text-[10px] font-bold">
          DOUGHCON_{level}
        </div>
        <div className="flex flex-col">
          <span className={`text-[12px] font-black tracking-widest ${config.animate}`}>{config.text}</span>
          <span className="text-[9px] opacity-80 tracking-tight uppercase">Source: Pizzint.watch // OSINT Surveillance</span>
        </div>
      </div>
      
      <div className="hidden lg:block text-[10px] italic opacity-70">
        {config.desc}
      </div>

      <div className="flex items-center gap-4">
         <div className="text-[10px] font-bold bg-black/40 px-3 py-1 rounded border border-white/10 uppercase">
           Live Feed
         </div>
      </div>
    </div>
  );
};

export default DoughconBanner;
