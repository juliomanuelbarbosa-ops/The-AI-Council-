
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { BrainstormingSession, AgentId, Agent, NeuralState } from '../types';
import AgentAvatar from './AgentAvatar';

interface MeetingRoomProps {
  session: BrainstormingSession;
  activeAgentId: AgentId | null;
  council: Agent[];
  onGenerateVisual: () => Promise<void>;
  isGeneratingVisual: boolean;
}

const MeetingRoom: React.FC<MeetingRoomProps> = ({ 
  session, 
  activeAgentId, 
  council, 
  onGenerateVisual, 
  isGeneratingVisual 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filterAgentId, setFilterAgentId] = useState<AgentId | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'visuals' | 'consensus'>('visuals');

  const currentNeuralState = useMemo(() => {
    if (session.messages.length === 0) return null;
    return session.messages[session.messages.length - 1].neuralState;
  }, [session.messages]);

  const lastActivityTime = useMemo(() => {
    if (session.messages.length === 0) return Date.now();
    return session.messages[session.messages.length - 1].timestamp;
  }, [session.messages]);

  const agentsMap = useMemo(() => {
    return council.reduce((acc, agent) => {
      acc[agent.id] = agent;
      return acc;
    }, {} as Record<string, Agent>);
  }, [council]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session.messages, session.consensus, filterAgentId, session.status]);

  // Auto-switch to consensus tab when finished
  useEffect(() => {
    if (session.status === 'finished') {
      setSidebarTab('consensus');
    }
  }, [session.status]);

  const filteredMessages = useMemo(() => {
    if (!filterAgentId) return session.messages;
    return session.messages.filter(m => m.agentId === filterAgentId);
  }, [session.messages, filterAgentId]);

  const formatTime = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    }).format(new Date(timestamp));
  };

  const handleAgentClick = (id: AgentId) => {
    setFilterAgentId(prev => (prev === id ? null : id));
  };

  const getAgentPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radius = 90; 
    return {
      x: 150 + radius * Math.cos(angle),
      y: 150 + radius * Math.sin(angle)
    };
  };

  const agentPositions = useMemo(() => {
    return council.map((agent, i) => ({
      ...agent,
      ...getAgentPosition(i, council.length)
    }));
  }, [council]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-[#020617] border border-white/5 rounded-[inherit]">
      
      {/* LEFT COLUMN: NEURAL COMMAND HUB */}
      <aside className="w-full lg:w-[420px] flex flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl z-30 shrink-0">
        
        {/* Hub Header: Quorum Status */}
        <div className="p-6 border-b border-white/5 bg-white/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.4em] text-red-500 font-black flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                Neural Command
              </span>
              <span className="text-[9px] font-mono text-zinc-600 uppercase mt-1 tracking-widest">Auth Level: Absolute</span>
            </div>
            {currentNeuralState && (
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-mono text-red-500 uppercase px-2 py-0.5 bg-red-500/10 rounded border border-red-500/20">
                  {currentNeuralState.status_text}
                </span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-5 gap-3">
            {council.map(agent => (
              <AgentAvatar 
                key={agent.id} 
                agent={agent} 
                isActive={activeAgentId === agent.id}
                isSelected={filterAgentId === agent.id}
                onClick={() => handleAgentClick(agent.id)}
                isSmall
              />
            ))}
          </div>
        </div>

        {/* Neural Map */}
        <div className="p-4 flex flex-col items-center justify-center bg-gradient-to-b from-red-950/5 to-transparent border-b border-white/5">
          <div className="relative w-full aspect-square max-w-[280px]">
            <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]" viewBox="0 0 300 300">
              {activeAgentId && currentNeuralState && currentNeuralState.target_id !== 'all' && (
                (() => {
                  const speaker = agentPositions.find(p => p.id === activeAgentId);
                  const target = agentPositions.find(p => p.id === currentNeuralState.target_id);
                  if (speaker && target) {
                    return (
                      <g>
                        <line 
                          x1={speaker.x} y1={speaker.y} 
                          x2={target.x} y2={target.y} 
                          stroke={currentNeuralState.sentiment_hex} 
                          strokeWidth={4}
                          strokeDasharray={currentNeuralState.connection_type === 'attack' ? "10,5" : "none"}
                          className="animate-pulse opacity-80"
                        />
                        <circle cx={target.x} cy={target.y} r="6" fill={currentNeuralState.sentiment_hex} className="animate-ping" />
                      </g>
                    );
                  }
                })()
              )}
              {agentPositions.map((p) => (
                <g key={p.id} className="transition-all duration-500">
                  {activeAgentId === p.id && (
                    <circle 
                      cx={p.x} cy={p.y} r={22} 
                      fill={currentNeuralState?.sentiment_hex || '#ef4444'} 
                      className="opacity-20 animate-pulse"
                    />
                  )}
                  <circle 
                    cx={p.x} cy={p.y} r="8" 
                    className={`${activeAgentId === p.id ? 'fill-white stroke-red-500 stroke-2' : 'fill-zinc-800 stroke-zinc-700'} transition-all`} 
                  />
                </g>
              ))}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 rounded-full border border-dashed border-red-900/40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                 <i className="fa-solid fa-atom text-red-600/60 text-sm animate-spin-slow"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Sidebar Content: Visuals or Consensus */}
        <div className="flex-grow flex flex-col overflow-hidden bg-white/[0.02]">
           <div className="p-3 bg-black/40 border-b border-white/5 flex gap-2">
              <button 
                onClick={() => setSidebarTab('visuals')}
                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sidebarTab === 'visuals' ? 'bg-white/10 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                Visuals
              </button>
              <button 
                onClick={() => setSidebarTab('consensus')}
                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sidebarTab === 'consensus' ? 'bg-red-600/20 text-red-500 border border-red-500/20' : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                Consensus
              </button>
           </div>
           
           <div className="flex-grow overflow-y-auto custom-scrollbar p-5 space-y-5">
              {sidebarTab === 'visuals' ? (
                <>
                   <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-eye text-[10px] text-red-500"></i>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Synthesis Gallery</span>
                      </div>
                      <button 
                        onClick={onGenerateVisual}
                        disabled={isGeneratingVisual || session.status === 'preparing' || session.status === 'idle'}
                        className="group p-2 rounded-lg bg-red-600/10 border border-red-500/20 hover:bg-red-600 transition-all disabled:opacity-30"
                      >
                        {isGeneratingVisual ? <i className="fa-solid fa-circle-notch animate-spin text-xs"></i> : <i className="fa-solid fa-wand-magic-sparkles text-xs group-hover:text-white transition-colors"></i>}
                      </button>
                   </div>
                   
                   {(!session.visuals || session.visuals.length === 0) && !isGeneratingVisual && (
                    <div className="h-40 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/5 rounded-3xl opacity-40">
                       <i className="fa-solid fa-panorama text-2xl mb-3"></i>
                       <p className="text-[9px] text-zinc-400 uppercase font-black tracking-widest leading-relaxed">No visual data synthesized.</p>
                    </div>
                  )}

                  {isGeneratingVisual && (
                    <div className="aspect-video w-full rounded-3xl border border-red-500/20 bg-red-950/10 flex flex-col items-center justify-center gap-3 animate-pulse">
                       <i className="fa-solid fa-dna text-xl text-red-500 animate-spin"></i>
                       <span className="text-[9px] text-red-500 font-black uppercase tracking-[0.2em]">Synthesizing...</span>
                    </div>
                  )}

                  {session.visuals?.map((url, i) => (
                    <div key={i} className="group relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-fadeIn ring-1 ring-white/5">
                       <img src={url} alt={`Synthesis ${i}`} className="w-full h-full object-cover transition-all duration-1000 scale-105 group-hover:scale-100" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                          <span className="text-[9px] text-white font-black uppercase tracking-[0.3em]">RECORD #{i+1}</span>
                       </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="animate-fadeIn">
                   <div className="flex items-center gap-2 mb-6">
                      <i className="fa-solid fa-check-double text-[10px] text-green-500"></i>
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Final Master-Key</span>
                   </div>
                   {session.consensus ? (
                     <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 shadow-inner">
                        <p className="text-sm italic leading-relaxed text-zinc-300 font-serif">
                          "{session.consensus}"
                        </p>
                        <div className="mt-8 pt-6 border-t border-white/5">
                           <button 
                            onClick={scrollToBottom}
                            className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2 hover:text-red-400 transition-colors"
                           >
                              <i className="fa-solid fa-arrow-down-to-bracket"></i>
                              View Full Output in Stream
                           </button>
                        </div>
                     </div>
                   ) : (
                     <div className="h-40 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/5 rounded-3xl opacity-40 italic text-zinc-600 text-[10px] uppercase tracking-widest">
                        Consensus Pending Synthesis
                     </div>
                   )}
                </div>
              )}
           </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-black border-t border-white/10">
           <p className="text-[8px] text-zinc-700 font-mono text-center uppercase tracking-[0.4em]">
             Neural Archive Locked &bull; Sync v4.1.2
           </p>
        </div>
      </aside>

      {/* RIGHT COLUMN: DISCUSSION LOGIC STREAM */}
      <main className="flex-grow flex flex-col h-full bg-[#020617] relative z-10 overflow-hidden">
        
        {/* Stream Header */}
        <div className="px-8 py-4 border-b border-white/5 bg-black/20 flex justify-between items-center backdrop-blur-md">
           <div className="flex items-center gap-3">
              <i className="fa-solid fa-terminal text-red-500 text-xs"></i>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Logic Stream</span>
           </div>
           
           <div className="flex items-center gap-6">
              {session.consensus && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 animate-fadeIn">
                   <i className="fa-solid fa-shield-check text-green-500 text-[10px]"></i>
                   <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Master-Key Deciphered</span>
                </div>
              )}
              <div className="text-[9px] font-mono text-zinc-600 flex items-center gap-4">
                  <span>MESSAGES: {session.messages.length}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500/50 animate-pulse"></span>
                  <span>LIVE</span>
              </div>
           </div>
        </div>

        {/* Message Area */}
        <div ref={scrollRef} className="flex-grow overflow-y-auto p-10 space-y-16 custom-scrollbar scroll-smooth">
          {filteredMessages.length === 0 && !session.consensus && (
            <div className="h-full flex flex-col items-center justify-center text-zinc-800 animate-fadeIn">
              <i className="fa-solid fa-tower-broadcast text-6xl mb-8 opacity-5"></i>
              <p className="font-heading italic text-lg tracking-[0.2em] opacity-30 text-center max-w-sm uppercase font-black">
                Awaiting Initial Input Transmission...
              </p>
            </div>
          )}

          {filteredMessages.map((msg) => {
            const agent = agentsMap[msg.agentId];
            if (!agent) return null;
            const isCurrentlyActive = activeAgentId === msg.agentId;
            
            return (
              <div key={msg.id} className={`flex flex-col animate-fadeIn group max-w-3xl mx-auto w-full transition-all duration-700 ${isCurrentlyActive ? 'scale-[1.01] z-10' : 'opacity-60 grayscale-[0.4] hover:opacity-100 hover:grayscale-0'}`}>
                <div className="flex items-end justify-between mb-4 px-2">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-2xl transition-transform group-hover:rotate-3 ${agent.borderColor} ${agent.color}`}>
                      <i className={`${agent.icon} text-white text-lg`}></i>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-black uppercase tracking-[0.3em] text-white">{agent.fullName}</span>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-tighter bg-white/5 px-2 py-0.5 rounded">ID: {msg.id.slice(0, 8)}</span>
                        {msg.blindRating !== undefined && <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Rating: {msg.blindRating}/10</span>}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-700 tracking-widest">{formatTime(msg.timestamp)}</span>
                </div>

                <div className={`p-12 rounded-[3.5rem] glass-panel border-l-[10px] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] transition-all duration-700 relative ${isCurrentlyActive ? 'border-l-red-500 bg-red-950/10 ring-1 ring-red-500/20 translate-x-1' : 'border-l-zinc-800 bg-white/[0.03]'}`}>
                  {msg.neuralState?.memory_link_text && msg.neuralState.target_id !== 'all' && (
                    <div className="mb-8 flex items-center gap-3">
                      <div className="px-3 py-1.5 rounded-full bg-red-600/10 border border-red-500/30 text-[9px] font-black text-red-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <i className="fa-solid fa-microchip text-[10px] animate-pulse"></i>
                        Recalling: {msg.neuralState.memory_link_text}
                      </div>
                      <div className="h-px w-6 bg-red-500/20"></div>
                      <span className="text-[9px] font-black text-zinc-500 uppercase italic">Directed at {agentsMap[msg.neuralState.target_id]?.name || 'Target'}</span>
                    </div>
                  )}

                  <p className="text-[18px] md:text-[20px] font-light leading-[1.8] text-zinc-200 tracking-wide font-inter">{msg.content}</p>
                  
                  {msg.neuralState && (
                    <div className="mt-10 pt-8 border-t border-white/5 flex flex-wrap gap-8 items-center">
                      <div className="flex flex-col gap-2">
                         <span className="text-[9px] uppercase font-black text-zinc-600 tracking-widest">Intensity Matrix</span>
                         <div className="w-32 h-1 rounded-full bg-zinc-900 overflow-hidden">
                            <div className="h-full transition-all duration-1000 shadow-[0_0_10px_currentcolor]" style={{ width: `${msg.neuralState.intensity}%`, backgroundColor: msg.neuralState.sentiment_hex }}></div>
                         </div>
                      </div>
                      <div className="flex flex-col gap-1">
                         <span className="text-[9px] uppercase font-black text-zinc-600 tracking-widest">Connection</span>
                         <div className="flex items-center gap-2">
                            <i className={`fa-solid ${msg.neuralState.connection_type === 'attack' ? 'fa-bolt-lightning text-red-500' : msg.neuralState.connection_type === 'agree' ? 'fa-circle-nodes text-green-500' : 'fa-network-wired text-blue-500'} text-xs`}></i>
                            <span className="text-[10px] font-black text-zinc-300 uppercase italic">{msg.neuralState.connection_type}</span>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Active Transmission State */}
          {session.status === 'debating' && activeAgentId && agentsMap[activeAgentId] && (
             <div className="max-w-3xl mx-auto w-full py-16 animate-fadeIn border-2 border-dashed border-red-500/20 bg-red-600/[0.02] rounded-[4rem] flex flex-col items-center justify-center gap-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border border-red-500/30 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-ping"></div>
                  </div>
                  <div className="absolute inset-0 border-2 border-red-500/10 rounded-full animate-active-glow"></div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[13px] uppercase tracking-[0.5em] text-red-500 font-black italic">Operative {agentsMap[activeAgentId].name} Broadcasting...</span>
                </div>
             </div>
          )}

          {/* FINAL CONSENSUS: LOGIC MASTER-KEY */}
          {session.consensus && (
            <div className="animate-slideUp mt-24 mb-40 relative max-w-4xl mx-auto w-full" id="consensus-final">
              <div className="absolute inset-0 bg-red-600/5 blur-[120px] -z-10 rounded-full animate-pulse"></div>
              
              <div className="flex flex-col items-center mb-12">
                <div className="flex items-center gap-8 mb-4">
                  <div className="h-px w-24 bg-gradient-to-r from-transparent to-red-500/50"></div>
                  <span className="text-[12px] font-black text-red-600 uppercase tracking-[0.8em] animate-pulse">Neural Quorum Success</span>
                  <div className="h-px w-24 bg-gradient-to-l from-transparent to-red-500/50"></div>
                </div>
                <h2 className="font-heading font-black text-4xl md:text-6xl tracking-tighter uppercase text-white italic drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">Logic Master-Key</h2>
              </div>

              <div className="relative p-20 md:p-28 rounded-[6rem] bg-gradient-to-br from-[#0a0f1d] to-[#020617] border border-red-500/40 shadow-[0_0_150px_rgba(220,38,38,0.3)] group overflow-hidden ring-1 ring-red-500/20 animate-consensus-entrance">
                {/* Visual Glitch Elements */}
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <i className="fa-solid fa-fingerprint text-8xl text-red-500"></i>
                </div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                
                <p className="text-3xl md:text-5xl font-extralight italic text-red-50 leading-relaxed text-center font-serif relative z-10 selection:bg-red-600 selection:text-white">
                  "{session.consensus}"
                </p>

                <div className="mt-20 pt-12 border-t border-white/10 flex flex-col items-center gap-6 relative z-10">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-px bg-zinc-800"></div>
                      <i className="fa-solid fa-check-double text-red-600 text-2xl"></i>
                      <div className="w-12 h-px bg-zinc-800"></div>
                   </div>
                   <span className="text-[12px] text-zinc-600 uppercase tracking-[0.6em] font-black">Uplink Sealed: {formatTime(lastActivityTime)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Dynamic Loading Overlay */}
        {session.status === 'concluding' && (
          <div className="absolute inset-x-0 bottom-0 p-12 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent pointer-events-none z-50">
             <div className="max-w-2xl mx-auto flex flex-col items-center gap-6 p-8 rounded-[3rem] bg-black/60 backdrop-blur-3xl border border-red-500/30 shadow-[0_0_80px_rgba(220,38,38,0.2)]">
                <div className="flex items-center gap-4 text-red-500 font-black uppercase text-xs tracking-[0.4em]">
                   <i className="fa-solid fa-spinner-third animate-spin"></i>
                   Compressing Collective Logic
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                   <div className="h-full bg-red-600 animate-pulse w-full"></div>
                </div>
             </div>
          </div>
        )}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(220, 38, 38, 0.15); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(220, 38, 38, 0.4); }
        .animate-spin-slow { animation: spin 20s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes consensus-entrance {
          from { opacity: 0; transform: scale(0.95) translateY(40px); filter: blur(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        .animate-consensus-entrance { animation: consensus-entrance 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default MeetingRoom;
