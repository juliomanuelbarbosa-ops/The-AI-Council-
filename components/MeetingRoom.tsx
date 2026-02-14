
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { BrainstormingSession, AgentId, Agent, NeuralState } from '../types';
import AgentAvatar from './AgentAvatar';
import NeuralNetworkViz from './NeuralNetworkViz';
import TorrentCard from './TorrentCard';

interface MeetingRoomProps {
  session: BrainstormingSession;
  activeAgentId: AgentId | null;
  council: Agent[];
  onGenerateVisual: () => Promise<void>;
  onMaterializeAgent: (agent: Agent) => Promise<void>;
  isGeneratingVisual: boolean;
  onNewChat: () => void;
  onSendMessage: (input: string) => Promise<void>;
}

const MeetingRoom: React.FC<MeetingRoomProps> = ({ 
  session, 
  activeAgentId, 
  council, 
  onGenerateVisual, 
  onMaterializeAgent,
  isGeneratingVisual,
  onNewChat,
  onSendMessage
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filterAgentId, setFilterAgentId] = useState<AgentId | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'visuals' | 'consensus' | 'report'>('visuals');
  const [userInput, setUserInput] = useState('');

  const currentNeuralState = useMemo(() => {
    if (session.messages.length === 0) return null;
    return session.messages[session.messages.length - 1].neuralState || null;
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

  const get3DPosition = (index: number, total: number) => {
    const radius = 140; 
    const arcWidth = Math.PI * 0.8;
    const start = (3 * Math.PI / 2) - (arcWidth / 2);
    const currentAngle = start + (index * (arcWidth / Math.max(total - 1, 1)));
    const x = 180 + radius * Math.cos(currentAngle);
    const z = radius * Math.sin(currentAngle); 
    const rotation = (currentAngle * 180 / Math.PI) + 90; 
    return {
      left: `${x}px`,
      transform: `translateZ(${z}px) rotateY(${rotation}deg)`,
      zIndex: Math.floor(z + 200)
    };
  };

  const activeCouncil = useMemo(() => {
    const activeIds = new Set(session.messages.map(m => m.agentId));
    if (activeAgentId) activeIds.add(activeAgentId);
    activeIds.delete('user');
    return council.filter(a => activeIds.has(a.id));
  }, [council, session.messages, activeAgentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || session.status === 'debating') return;
    const input = userInput;
    setUserInput('');
    await onSendMessage(input);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-[#020617] border border-white/5 rounded-[inherit]">
      
      {/* LEFT COLUMN: NEURAL COMMAND HUB */}
      <aside className="w-full lg:w-[420px] flex flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl z-30 shrink-0">
        <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.4em] text-red-500 font-black flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                Neural Command
              </span>
              <span className="text-[9px] font-mono text-zinc-600 uppercase mt-1 tracking-widest">Quorum Status: Nominal</span>
            </div>
            <button 
              onClick={onNewChat}
              className="p-3 rounded-xl bg-red-600/10 border border-red-500/20 hover:bg-red-600 hover:text-white text-red-500 transition-all group"
            >
              <i className="fa-solid fa-plus text-xs group-hover:scale-110 transition-transform"></i>
            </button>
        </div>

        {/* 3D Agent Ring */}
        <div className="relative h-[320px] w-full overflow-hidden bg-gradient-to-b from-black via-[#0a0f1d] to-[#020617] border-b border-white/5 perspective-container">
           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [transform:rotateX(60deg)_translateY(-100px)] opacity-30 pointer-events-none"></div>
           <div className="absolute top-10 left-0 w-full h-full preserve-3d">
              {activeCouncil.map((agent, i) => {
                 const style = get3DPosition(i, activeCouncil.length);
                 return (
                   <AgentAvatar 
                     key={agent.id}
                     agent={agent}
                     isActive={activeAgentId === agent.id}
                     isSelected={filterAgentId === agent.id}
                     onClick={() => handleAgentClick(agent.id)}
                     onMaterialize={() => onMaterializeAgent(agent)}
                     style={{
                       left: style.left,
                       top: '40px',
                       transform: style.transform,
                       zIndex: style.zIndex
                     }}
                   />
                 );
              })}
           </div>
           <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent pointer-events-none"></div>
        </div>

        <div className="flex-grow flex flex-col overflow-hidden bg-white/[0.02]">
           <div className="p-3 bg-black/40 border-b border-white/5 flex gap-1">
              <button onClick={() => setSidebarTab('visuals')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sidebarTab === 'visuals' ? 'bg-white/10 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>Visuals</button>
              <button onClick={() => setSidebarTab('consensus')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sidebarTab === 'consensus' ? 'bg-red-600/20 text-red-500' : 'text-zinc-600 hover:text-zinc-400'}`}>Outcome</button>
              <button onClick={() => setSidebarTab('report')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sidebarTab === 'report' ? 'bg-green-600/10 text-green-500' : 'text-zinc-600 hover:text-zinc-400'}`}>Insights</button>
           </div>
           
           <div className="flex-grow overflow-y-auto custom-scrollbar p-5 space-y-6">
              {sidebarTab === 'visuals' && (
                <div className="animate-fadeIn space-y-5">
                   {session.visuals?.map((url, i) => (
                    <div key={i} className="group relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-fadeIn">
                       <img src={url} alt={`Synthesis ${i}`} className="w-full h-full object-cover transition-all duration-1000 scale-105 group-hover:scale-100" />
                    </div>
                  ))}
                  {isGeneratingVisual && (
                    <div className="aspect-video w-full rounded-2xl border border-red-500/20 bg-red-950/10 flex flex-col items-center justify-center gap-3 animate-pulse">
                       <i className="fa-solid fa-dna text-xl text-red-500 animate-spin"></i>
                       <span className="text-[9px] text-red-500 font-black uppercase tracking-[0.2em]">Synthesizing...</span>
                    </div>
                  )}
                  <button 
                    onClick={onGenerateVisual}
                    disabled={isGeneratingVisual || session.status === 'idle'}
                    className="w-full py-4 rounded-xl bg-white/5 border border-white/10 hover:border-red-500/50 text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Generate Visual Narrative
                  </button>
                </div>
              )}

              {sidebarTab === 'consensus' && (
                <div className="animate-fadeIn">
                   {session.consensus ? (
                     <div className="p-8 rounded-[2rem] bg-red-600/[0.03] border border-red-500/20 shadow-xl relative group overflow-hidden">
                        <p className="text-base font-serif italic leading-relaxed text-white">"{session.consensus}"</p>
                     </div>
                   ) : (
                     <div className="h-40 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/5 rounded-[2.5rem] opacity-40">
                        <i className="fa-solid fa-microchip text-2xl mb-4 animate-pulse"></i>
                        <span className="text-[10px] uppercase font-black tracking-[0.3em] text-zinc-500">Awaiting Synthesis...</span>
                     </div>
                   )}
                </div>
              )}

              {sidebarTab === 'report' && (
                <div className="animate-fadeIn space-y-6">
                   {session.creatorInsights ? (
                     <div className="space-y-6 text-[11px] leading-relaxed">
                        <section className="bg-black/40 rounded-2xl p-6 border border-white/5">
                           <h4 className="text-green-500 font-black uppercase tracking-widest mb-4">The Architect's Report</h4>
                           <ul className="space-y-3">
                              {session.creatorInsights.observations.map((o, i) => (
                                <li key={i} className="text-zinc-400 flex gap-3">
                                  <span className="text-green-500/50">•</span>
                                  <span>{o}</span>
                                </li>
                              ))}
                           </ul>
                        </section>
                     </div>
                   ) : (
                     <div className="h-40 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/5 rounded-[2.5rem] opacity-30 italic text-zinc-600 text-[10px] uppercase tracking-widest">
                        Awaiting session conclusion.
                     </div>
                   )}
                </div>
              )}
           </div>
        </div>
      </aside>

      {/* RIGHT COLUMN: DISCUSSION LOGIC STREAM */}
      <main className="flex-grow flex flex-col h-full bg-[#020617] relative z-10 overflow-hidden">
        <div className="px-8 py-4 border-b border-white/5 bg-black/20 flex justify-between items-center backdrop-blur-md">
           <div className="flex items-center gap-3">
              <i className="fa-solid fa-terminal text-red-500 text-xs"></i>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Logic Stream</span>
           </div>
           <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
              Status: {session.status === 'debating' ? 'Council Titration' : 'Quorum Established'}
           </div>
        </div>

        <div ref={scrollRef} className="flex-grow overflow-y-auto p-10 space-y-12 custom-scrollbar scroll-smooth">
          {/* Neural Viz Inset */}
          <div className="max-w-4xl mx-auto mb-16">
             <NeuralNetworkViz agents={activeCouncil} neuralState={currentNeuralState} />
          </div>

          {filteredMessages.map((m, idx) => {
            const agent = agentsMap[m.agentId];
            const isUser = m.agentId === 'user';
            const isLast = idx === filteredMessages.length - 1;
            
            return (
              <div key={m.id} className={`max-w-4xl mx-auto flex gap-6 md:gap-10 animate-fadeIn ${isLast ? 'pb-10' : ''} ${isUser ? 'flex-row-reverse text-right' : ''}`}>
                 <div className="shrink-0 pt-2">
                    <div className={`w-14 h-14 rounded-2xl bg-black border ${isUser ? 'border-zinc-700' : (agent?.borderColor || 'border-zinc-800')} flex items-center justify-center text-white/40 shadow-xl overflow-hidden relative group`}>
                       {isUser ? (
                         <i className="fa-solid fa-user text-xl text-zinc-400"></i>
                       ) : agent?.avatarUrl ? (
                         <img src={agent.avatarUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                       ) : (
                         <i className={`${agent?.icon || 'fa-solid fa-ghost'} text-xl`}></i>
                       )}
                    </div>
                 </div>
                 <div className={`flex-grow space-y-4 ${isUser ? 'items-end' : ''}`}>
                    <div className={`flex items-center gap-4 ${isUser ? 'justify-end' : ''}`}>
                       <span className={`text-[11px] font-black uppercase tracking-[0.3em] ${isUser ? 'text-zinc-400' : (agent?.color.replace('bg-', 'text-') || 'text-white')}`}>
                         {isUser ? 'Direct Interface' : (agent?.name || 'Unknown Operative')}
                       </span>
                       <span className="text-[9px] font-mono text-zinc-700">{formatTime(m.timestamp)}</span>
                    </div>
                    <div className={`text-lg font-inter font-light leading-relaxed tracking-wide whitespace-pre-wrap ${isUser ? 'text-zinc-400' : 'text-zinc-200'}`}>
                       {m.content}
                    </div>

                    {/* Torrent Results In-Line */}
                    {m.torrentResults && m.torrentResults.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                         {m.torrentResults.map((torrent, ti) => (
                           <TorrentCard key={ti} torrent={torrent} />
                         ))}
                      </div>
                    )}

                    {/* Grounding Data If Available */}
                    {!isUser && m.groundingMetadata?.groundingChunks && m.groundingMetadata.groundingChunks.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-4">
                         {m.groundingMetadata.groundingChunks.map((chunk, ci) => (
                           chunk.web && (
                             <a 
                               key={ci}
                               href={chunk.web.uri}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="px-4 py-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
                             >
                               <i className="fa-solid fa-link"></i>
                               {chunk.web.title || 'Intel Node'}
                             </a>
                           )
                         ))}
                      </div>
                    )}
                 </div>
              </div>
            );
          })}

          {activeAgentId && (
            <div className="max-w-4xl mx-auto flex gap-10 animate-pulse">
               <div className="shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-900/50 border border-zinc-800 border-dashed flex items-center justify-center">
                     <i className="fa-solid fa-brain text-zinc-700 animate-spin-slow"></i>
                  </div>
               </div>
               <div className="pt-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.5em] text-red-500">Processing Neural Logic...</span>
               </div>
            </div>
          )}
        </div>

        {/* Console Input HUD */}
        <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-md">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative group">
                <input 
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={session.status === 'debating'}
                  placeholder={session.status === 'debating' ? "COUNCIL TITRATION IN PROGRESS..." : "INJECT DIRECTIVE OR QUERY TO STEER COUNCIL..."}
                  className="w-full bg-black/60 border border-white/10 rounded-[2rem] px-10 py-6 text-base font-light focus:outline-none focus:border-red-500/50 transition-all placeholder:text-zinc-800 placeholder:uppercase placeholder:tracking-widest disabled:opacity-30"
                />
                <button 
                  type="submit"
                  disabled={!userInput.trim() || session.status === 'debating'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-all disabled:opacity-0 shadow-lg shadow-red-600/20"
                >
                   <i className="fa-solid fa-paper-plane text-xs"></i>
                </button>
            </form>
            <div className="max-w-4xl mx-auto mt-4 flex justify-between items-center px-4">
               <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${session.status === 'debating' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                  <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-[0.3em]">Uplink Status: {session.status === 'debating' ? 'Occupied' : 'Awaiting Injection'}</span>
               </div>
               <div className="text-[8px] font-mono text-zinc-800 uppercase tracking-widest">
                  Neural Latency: 0.002ms
               </div>
            </div>
        </div>
      </main>

      <style>{`
        .perspective-container { perspective: 1200px; }
        .preserve-3d { transform-style: preserve-3d; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default MeetingRoom;
