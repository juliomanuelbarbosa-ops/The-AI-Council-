
import React from 'react';
import { Agent } from '../types';

interface AgentAvatarProps {
  agent: Agent;
  isActive: boolean;
  isSelected?: boolean;
  isSmall?: boolean;
  onClick?: () => void;
}

const AgentAvatar: React.FC<AgentAvatarProps> = ({ 
  agent, 
  isActive, 
  isSelected = false,
  isSmall = false,
  onClick 
}) => {
  return (
    <div 
      onClick={onClick}
      className={`group relative flex flex-col items-center transition-all duration-700 cursor-pointer ${isActive ? 'scale-110 z-10' : 'opacity-40 grayscale scale-90 hover:opacity-70 hover:grayscale-0'} ${isSelected ? 'opacity-100 grayscale-0 scale-105' : ''}`}
    >
      {/* Personality Tooltip */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full w-48 p-3 glass-panel rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none shadow-2xl border-white/20">
        <div className="text-white text-xs font-bold mb-1 uppercase tracking-tighter flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${agent.color}`}></span>
          {agent.fullName}
        </div>
        <p className="text-[10px] text-gray-300 leading-tight">
          {agent.personality}
        </p>
        {/* Tooltip Arrow */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#111827] rotate-45 border-r border-b border-white/10"></div>
      </div>

      <div className="relative">
        {/* Active Breathing Glow Effect */}
        {isActive && (
          <div className={`absolute inset-0 rounded-full blur-xl opacity-60 animate-pulse ${agent.color}`}></div>
        )}
        
        <div className={`
          relative rounded-full border-2 flex items-center justify-center
          ${agent.borderColor} ${agent.color} 
          ${isSmall ? 'w-10 h-10' : 'w-16 h-16 md:w-24 md:h-24'}
          ${isActive ? 'animate-active-glow border-white z-10 shadow-[0_0_30px_rgba(255,255,255,0.4)]' : 'border-white/10'}
          ${isSelected ? 'ring-4 ring-white ring-offset-2 ring-offset-[#030712]' : ''}
          transition-all duration-500
        `}>
          <i className={`${agent.icon} ${isSmall ? 'text-sm' : 'text-2xl md:text-4xl'} text-white ${isActive ? 'animate-bounce' : ''}`}></i>
          
          {isActive && (
            <div className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-white border-2 border-[#030712]"></span>
            </div>
          )}
        </div>
      </div>
      
      <span className={`mt-2 font-heading font-bold ${isSmall ? 'text-xs' : 'text-sm'} tracking-wider uppercase transition-colors duration-500 ${isActive || isSelected ? 'text-white' : 'text-gray-500'}`}>
        {agent.name}
      </span>
    </div>
  );
};

export default AgentAvatar;
