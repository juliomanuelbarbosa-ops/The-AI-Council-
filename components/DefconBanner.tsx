
import React from 'react';

interface DefconBannerProps {
  level: number;
}

const DefconBanner: React.FC<DefconBannerProps> = ({ level }) => {
  const getPizzaIntel = (lv: number) => {
    switch (lv) {
      case 1:
        return {
          text: "MAXIMUM PIZZA SATURATION: Delivery drivers are currently occupying the Pentagon War Room.",
          color: "bg-red-600",
          icon: "🍕💀",
          pulse: "animate-pulse"
        };
      case 2:
        return {
          text: "CRITICAL SURGE: Domino's reports multiple large-volume orders to underground bunkers.",
          color: "bg-orange-600",
          icon: "🍕⚠️",
          pulse: "animate-pulse"
        };
      case 3:
        return {
          text: "STRATEGIC INTAKE: Significant increase in late-night deliveries at Intelligence Nodes.",
          color: "bg-yellow-600",
          icon: "🍕📉",
          pulse: ""
        };
      case 4:
        return {
          text: "MODERATE ESCALATION: Pizza volume at the Pentagon is trending above standard baselines.",
          color: "bg-blue-600",
          icon: "🍕🔍",
          pulse: ""
        };
      case 5:
      default:
        return {
          text: "NORMALIZED CALORIE INTAKE: No significant pizza activity detected. Domestic tranquility maintained.",
          color: "bg-slate-800",
          icon: "🍕✅",
          pulse: ""
        };
    }
  };

  const intel = getPizzaIntel(level);

  return (
    <div className={`${intel.color} text-white py-1.5 px-6 text-center font-mono font-bold border-b border-black/20 shadow-lg uppercase tracking-wider text-[9px] flex items-center justify-center gap-4 transition-all duration-700`}>
      <span className={`${intel.pulse} text-sm`}>{intel.icon.split(' ')[0]}</span>
      <span className="flex items-center gap-2">
        <strong className="text-white/90">PIZZA-INTEL LEVEL {level}:</strong>
        <span className="text-white/80">{intel.text}</span>
      </span>
      <span className={`${intel.pulse} text-sm`}>{intel.icon.split(' ')[1] || intel.icon.split(' ')[0]}</span>
    </div>
  );
};

export default DefconBanner;
