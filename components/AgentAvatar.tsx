import React, { useEffect, useState } from 'react';
import { Agent } from '../types';

interface AgentAvatarProps {
  agent: Agent;
  isActive: boolean;
  isSelected?: boolean;
  isSmall?: boolean;
  onClick?: () => void;
  onMaterialize?: (id: string) => void;
  style?: React.CSSProperties;
}

const AgentAvatar: React.FC<AgentAvatarProps> = ({ 
  agent, 
  isActive, 
  isSelected = false,
  onClick,
  onMaterialize,
  style
}) => {
  const [isFabricating, setIsFabricating] = useState(false);

  // Automatically trigger materialization if avatar is missing and agent becomes active
  useEffect(() => {
    if (isActive && !agent.avatarUrl && onMaterialize && !isFabricating) {
      setIsFabricating(true);
      onMaterialize(agent.id);
    }
  }, [isActive, agent.avatarUrl, agent.id, onMaterialize, isFabricating]);

  // Reset local fabricating state if the parent updates the avatarUrl
  useEffect(() => {
    if (agent.avatarUrl) {
      setIsFabricating(false);
    }
  }, [agent.avatarUrl]);

  const personaRole = agent.fullName.includes('(') 
    ? agent.fullName.split('(')[1].replace(')', '') 
    : 'OPERATIVE';

  const agentThemeColor = agent.color.replace('bg-', 'text-');

  return (
    <div 
      onClick={onClick}
      className="absolute group transition-all duration-1000 cursor-pointer select-none"
      style={{
        ...style,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* 3D Throne/Pedestal Container */}
      <div className={`relative flex flex-col items-center justify-end w-40 h-64 transition-all duration-1000 ${isActive ? 'scale-115 -translate-y-8' : 'scale-100'}`}>
        
        {/* Cinematic Backdrop Glow */}
        <div className={`absolute inset-0 bg-gradient-to-t ${isActive ? 'from-white/10 blur-[100px]' : 'from-transparent'} to-transparent transition-opacity duration-1000`}></div>

        {/* The Throne Backrest - High Fidelity Obsidian/Metals */}
        <div className={`
          absolute bottom-0 w-36 h-52 
          bg-gradient-to-b from-[#0f172a] via-[#020617] to-black 
          border-x border-t ${isActive ? 'border-white/40 shadow-[0_0_100px_rgba(255,255,255,0.15)]' : `border-white/5`}
          rounded-t-[5rem]
          transition-all duration-1000
          transform-style-3d
        `}>
          {/* Internal Glow emphasizing depth */}
          <div className={`absolute top-0 left-0 right-0 h-44 bg-gradient-to-b ${isActive ? 'from-white/15' : 'from-transparent'} to-transparent rounded-t-[5rem]`}></div>
          
          {/* Council Crest Emblem */}
          <div className={`absolute top-8 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-[0.6em] text-zinc-800 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-20'}`}>
             NODE_{agent.id.substring(0, 3).toUpperCase()}
          </div>
          
          {/* Persona Icon Shadow */}
           <div className="absolute top-28 left-1/2 -translate-x-1/2 opacity-[0.03]">
              <i className={`${agent.icon} text-9xl ${agentThemeColor}`}></i>
           </div>
        </div>

        {/* The High-Fidelity Portrait Frame */}
        <div className="relative z-10 mb-16 flex flex-col items-center transform-style-3d">
           {/* Light Volumetric Beam */}
           <div className={`absolute bottom-0 w-32 h-48 bg-gradient-to-t ${isActive ? 'from-white/20' : 'from-transparent'} to-transparent blur-3xl opacity-50`}></div>
           
           {/* Crystal Glass Portrait Container */}
           <div className={`
             relative w-36 h-36 rounded-[3rem] flex items-center justify-center overflow-hidden
             border-[1px] ${isActive ? 'border-white shadow-[0_0_80px_rgba(255,255,255,0.4)]' : 'border-white/10 shadow-2xl'}
             bg-black/80 backdrop-blur-3xl transition-all duration-1000
             ${isActive ? 'scale-110' : 'grayscale-[0.3] opacity-90'}
           `}>
             {agent.avatarUrl ? (
               <div className="relative w-full h-full">
                 <img 
                   src={agent.avatarUrl} 
                   alt={agent.name} 
                   className={`w-full h-full object-cover transform transition-all duration-[4000ms] ${isActive ? 'scale-110 contrast-125 saturate-110' : 'scale-100'}`} 
                   loading="eager"
                 />
                 {/* Minimal Filmic Overlays */}
                 <div className="absolute inset-0 pointer-events-none">
                    {/* Focus Vignette */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_30%,rgba(0,0,0,0.8)_120%)]"></div>
                    {/* Scanlines Effect */}
                    <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px]"></div>
                 </div>
               </div>
             ) : isFabricating ? (
                <div className="flex flex-col items-center gap-3">
                   <div className="w-14 h-14 border-2 border-white/5 border-t-white rounded-full animate-spin"></div>
                   <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Titrating...</span>
                </div>
             ) : (
               <div className={`flex flex-col items-center justify-center ${agentThemeColor} opacity-40 animate-pulse`}>
                 <i className={`${agent.icon} text-6xl`}></i>
               </div>
             )}
           </div>

           {/* Holographic Raised Hand - Visual indication of speaking */}
           <div className={`
              absolute -right-10 top-1/2 -translate-y-1/2 z-20 transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)
              ${isActive ? 'opacity-100 translate-x-0 scale-125' : 'opacity-0 translate-x-12 scale-50 pointer-events-none'}
           `}>
              <div className="relative">
                 {/* Neon Halo */}
                 <div className="absolute inset-0 bg-white/30 blur-2xl rounded-full animate-pulse"></div>
                 <div className="relative w-12 h-12 rounded-2xl bg-white text-black border border-white/60 flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.9)] transform hover:rotate-12 transition-transform">
                    <i className="fa-solid fa-hand-spock text-lg"></i>
                 </div>
                 {/* Speaking HUD */}
                 <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                    <div className="w-1 h-1 bg-white rounded-full animate-ping"></div>
                    <span className="text-[7px] font-black uppercase tracking-[0.4em] text-white/80 whitespace-nowrap">UPLINK_TRANSMITTING</span>
                 </div>
              </div>
           </div>

           {/* Precision Nameplate */}
           <div className={`
             mt-8 px-8 py-3 rounded-2xl text-[12px] font-black uppercase tracking-[0.6em] 
             border ${isActive ? 'bg-white text-black border-white shadow-[0_30px_60px_rgba(0,0,0,0.9)]' : 'bg-black/95 text-zinc-500 border-white/10'}
             transition-all duration-1000
             flex flex-col items-center min-w-[160px] text-center
           `}>
             <span className="whitespace-nowrap">{agent.name}</span>
             <span className={`text-[9px] mt-2 tracking-[0.4em] opacity-50 font-bold border-t border-current pt-1.5`}>
                {personaRole}
             </span>
           </div>
        </div>

        {/* Throne Base Architecture */}
        <div className={`absolute bottom-0 w-48 h-14 bg-[#01040a] border-t border-white/20 rounded-b-[2.5rem] shadow-[0_50px_120px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden`}>
           {/* Active Pulse Strip */}
           <div className={`w-28 h-1 rounded-full transition-all duration-1000 ${isActive ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,1)]' : 'bg-zinc-900'}`}></div>
           
           {/* Micro HUD markings */}
           <div className="absolute bottom-1 text-[7px] font-mono text-zinc-800 uppercase tracking-[0.6em] whitespace-nowrap">
              QUORUM_ESTABLISHED // NODE_ONLINE
           </div>
           
           {/* Holographic Scanline */}
           <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full ${isActive ? 'animate-shimmer' : ''}`}></div>
        </div>
      </div>

      <style>{`
        .transform-style-3d { transform-style: preserve-3d; }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        .animate-shimmer { animation: shimmer 3s infinite linear; }
      `}</style>
    </div>
  );
};

export default AgentAvatar;