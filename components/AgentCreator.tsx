
import React, { useState, useMemo } from 'react';
import { BASE_AI_LIST, UNDERGROUND_AGENTS } from '../constants';
import { Agent, AgentId } from '../types';
import { synthesizeHybrid, createCustomAgent } from '../services/geminiService';

interface AgentCreatorProps {
  onCreated: (agent: Agent) => void;
  onClose: () => void;
  onOpenTorrents?: () => void;
}

const AgentCreator: React.FC<AgentCreatorProps> = ({ onCreated, onClose, onOpenTorrents }) => {
  const [activeTab, setActiveTab] = useState<'fusion' | 'custom' | 'underground'>('fusion');
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedUnderground, setSelectedUnderground] = useState<AgentId[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [undergroundPrompt, setUndergroundPrompt] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [showValidationWarning, setShowValidationWarning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCores = useMemo(() => {
    return BASE_AI_LIST.filter(ai => 
      ai.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const toggleSelect = (name: string) => {
    setShowValidationWarning(false);
    if (selected.includes(name)) {
      setSelected(selected.filter(s => s !== name));
    } else if (selected.length < 3) {
      setSelected([...selected, name]);
    }
  };

  const toggleUndergroundSelect = (id: AgentId) => {
    setShowValidationWarning(false);
    if (selectedUnderground.includes(id)) {
      setSelectedUnderground(selectedUnderground.filter(sid => sid !== id));
    } else {
      setSelectedUnderground([...selectedUnderground, id]);
    }
  };

  const handleSynthesize = async () => {
    if (activeTab === 'fusion') {
      if (selected.length < 1) {
        setShowValidationWarning(true);
        return;
      }
      setIsSynthesizing(true);
      try {
        const hybrid = await synthesizeHybrid(selected);
        onCreated(hybrid);
      } catch (error) {
        console.error(error);
        alert("Fusion failed. Neural destabilization detected.");
      } finally {
        setIsSynthesizing(false);
      }
    } else if (activeTab === 'custom') {
      if (!customPrompt.trim()) {
        setShowValidationWarning(true);
        return;
      }
      setIsSynthesizing(true);
      try {
        const custom = await createCustomAgent(customPrompt);
        onCreated(custom);
      } catch (error) {
        console.error(error);
        alert("Neural mapping failed. Prompt rejected by core.");
      } finally {
        setIsSynthesizing(false);
      }
    } else if (activeTab === 'underground') {
      if (selectedUnderground.length < 1) {
        setShowValidationWarning(true);
        return;
      }
      setIsSynthesizing(true);
      try {
        for (const agentId of selectedUnderground) {
          const baseAgent = UNDERGROUND_AGENTS.find(a => a.id === agentId);
          if (baseAgent) {
            const finalAgent = {
              ...baseAgent,
              id: `${baseAgent.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              personality: undergroundPrompt.trim() 
                ? `${baseAgent.personality} [INITIALIZATION DIRECTIVE]: ${undergroundPrompt}`
                : baseAgent.personality
            };
            onCreated(finalAgent);
          }
        }
        onClose();
      } catch (error) {
        console.error(error);
        alert("Underground link failed.");
      } finally {
        setIsSynthesizing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-fadeIn">
      <div className="w-full max-w-5xl h-[90vh] glass-panel rounded-[3rem] overflow-hidden flex flex-col border-white/10 shadow-[0_0_120px_rgba(239,68,68,0.1)] relative">
        
        {/* Animated Background Pulse */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-600/5 blur-[150px] pointer-events-none"></div>

        {/* Header Section */}
        <div className="p-8 md:p-10 border-b border-white/10 bg-white/[0.02] relative z-10 shrink-0">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-lg shadow-red-600/20">
                  <i className="fa-solid fa-microchip text-xl text-white"></i>
                </div>
                <div>
                  <h2 className="text-3xl font-heading font-black text-white tracking-tight italic uppercase">Operative Fabrication</h2>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.4em] font-black mt-1">Neural Assembly System v9.4</p>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-red-600/20 border border-white/5 hover:border-red-500/50 flex items-center justify-center text-zinc-500 hover:text-red-500 transition-all group"
            >
              <i className="fa-solid fa-times text-xl group-hover:rotate-90 transition-transform"></i>
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-wrap gap-4 p-1.5 bg-black/60 rounded-2xl border border-white/5 w-fit">
              <button 
                onClick={() => setActiveTab('fusion')}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'fusion' ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <i className="fa-solid fa-flask-vial"></i>
                Fusion Chamber
              </button>
              <button 
                onClick={() => setActiveTab('custom')}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'custom' ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <i className="fa-solid fa-dna"></i>
                Direct Mapping
              </button>
              <button 
                onClick={() => setActiveTab('underground')}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'underground' ? 'bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <i className="fa-solid fa-eye-slash"></i>
                Underground AI
              </button>
            </div>

            {activeTab === 'fusion' && (
              <div className="relative w-full md:w-64">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-xs"></i>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="FILTER CORES..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-[10px] font-black tracking-widest text-zinc-400 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all uppercase"
                />
              </div>
            )}
          </div>
        </div>

        {/* Lab Content */}
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative z-10">
          
          {/* Main Selection Area */}
          <div className="flex-grow overflow-y-auto p-8 custom-scrollbar bg-zinc-950/20">
            {activeTab === 'underground' ? (
              <div className="max-w-4xl mx-auto space-y-8 pb-12">
                <div className="bg-green-500/5 border border-green-500/20 rounded-3xl p-8 mb-10 flex items-center justify-between gap-6">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                          <i className="fa-solid fa-user-ninja text-3xl"></i>
                      </div>
                      <div className="flex-grow">
                          <h3 className="text-xl font-black uppercase italic tracking-widest text-white">Underground Framework Gateway</h3>
                          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] mt-1">Accessing non-standard cognitive architectures.</p>
                      </div>
                   </div>
                   {onOpenTorrents && (
                     <button 
                        onClick={onOpenTorrents}
                        className="px-6 py-3 rounded-xl bg-red-600/10 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-3"
                     >
                        <i className="fa-solid fa-magnet"></i>
                        Torrent Hub
                     </button>
                   )}
                </div>

                {/* Specialized Input for Underground Tab */}
                <div className="mb-10 p-6 bg-black/40 border border-green-500/10 rounded-[2rem] relative overflow-hidden group">
                   <div className="flex items-center gap-3 mb-4">
                      <i className="fa-solid fa-terminal text-green-500 text-xs"></i>
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">INITIALIZATION DIRECTIVE</span>
                   </div>
                   <textarea
                      value={undergroundPrompt}
                      onChange={(e) => setUndergroundPrompt(e.target.value)}
                      placeholder="Input initialization parameters for the selected frameworks... (e.g. 'Audit the SOL/USDC pool on Raydium...')"
                      className="w-full h-32 bg-transparent text-zinc-200 focus:outline-none transition-all resize-none placeholder:text-zinc-800 font-mono text-sm leading-relaxed"
                   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {UNDERGROUND_AGENTS.map(agent => {
                    const isSelected = selectedUnderground.includes(agent.id);
                    return (
                      <button
                        key={agent.id}
                        onClick={() => toggleUndergroundSelect(agent.id)}
                        className={`flex flex-col p-8 rounded-[2.5rem] border transition-all text-left group relative overflow-hidden h-full ${isSelected ? 'bg-green-950/20 border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.2)]' : 'bg-black/60 border-green-500/10 hover:border-green-500/30'}`}
                      >
                        <div className="flex items-center gap-5 mb-6">
                           <div className={`w-14 h-14 rounded-2xl ${agent.color} border border-white/20 flex items-center justify-center text-white shadow-xl transition-transform ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                              <i className={`${agent.icon} text-xl`}></i>
                           </div>
                           <div className="flex-grow">
                              <h4 className="text-lg font-black uppercase italic tracking-tighter text-white">{agent.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                 <span className="text-[8px] font-black uppercase tracking-[0.2em] text-green-600">Framework_v4.1</span>
                                 {agent.id === 'clanker' && <i className="fa-solid fa-globe text-[8px] text-zinc-600" title="Search Enabled"></i>}
                                 {agent.id === 'smolagents' && <i className="fa-solid fa-terminal text-[8px] text-zinc-600" title="Code Execution Enabled"></i>}
                              </div>
                           </div>
                           {/* Tick Indicator */}
                           <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'bg-green-500 border-green-500' : 'border-white/10'}`}>
                              {isSelected && <i className="fa-solid fa-check text-[10px] text-black"></i>}
                           </div>
                        </div>
                        <p className="text-[11px] leading-relaxed text-zinc-400 font-inter mb-6">{agent.personality}</p>
                        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-6">
                           <div className="flex gap-2">
                              {agent.id === 'clanker' && <span className="px-2 py-0.5 rounded-full bg-white/5 text-[7px] font-black uppercase text-zinc-600 tracking-widest">Base_Network</span>}
                              {agent.id === 'smolagents' && <span className="px-2 py-0.5 rounded-full bg-white/5 text-[7px] font-black uppercase text-zinc-600 tracking-widest">Python_Core</span>}
                              {agent.id === 'reaper' && <span className="px-2 py-0.5 rounded-full bg-white/5 text-[7px] font-black uppercase text-zinc-600 tracking-widest">Ethical_Pen_Test</span>}
                           </div>
                        </div>
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,rgba(34,197,94,0.03)_0%,transparent_70%)] transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : activeTab === 'fusion' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-10">
                {filteredCores.map(ai => {
                  const isSelected = selected.includes(ai);
                  return (
                    <button
                      key={ai}
                      onClick={() => toggleSelect(ai)}
                      className={`
                        p-5 rounded-2xl border text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 relative overflow-hidden group h-24 flex flex-col justify-between text-left
                        ${isSelected 
                          ? 'bg-red-900/40 border-red-500 text-white shadow-[0_0_25px_rgba(220,38,38,0.2)] scale-[1.03] z-10' 
                          : 'bg-black/40 border-white/5 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}
                      `}
                    >
                      <span className="relative z-10">{ai}</span>
                      <div className="flex justify-between items-end relative z-10">
                        <span className="text-[8px] font-mono opacity-40">SR# {Math.floor(Math.random() * 9999)}</span>
                        {isSelected && (
                          <div className="flex items-center gap-1">
                            <i className="fa-solid fa-bolt text-red-500 animate-pulse text-[10px]"></i>
                            <span className="text-red-500 text-[8px] font-black">ACTIVE</span>
                          </div>
                        )}
                      </div>
                      <div className={`absolute inset-0 bg-gradient-to-tr from-red-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-30' : ''}`}></div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="max-w-3xl mx-auto py-12 px-4">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-red-600/10 border border-red-500/30 flex items-center justify-center">
                    <i className="fa-solid fa-terminal text-red-500 text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading font-black text-white uppercase tracking-widest italic">Direct Path Directives</h3>
                    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em] mt-1">Manual Cognitive Formatting</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="p-8 bg-black/40 border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
                    <textarea
                      value={customPrompt}
                      onChange={(e) => {
                        setCustomPrompt(e.target.value);
                        setShowValidationWarning(false);
                      }}
                      placeholder="Input behavioral specifications... (e.g. 'Clinical psychologist with a secret agenda for world chaos...')"
                      className="w-full h-56 bg-transparent text-zinc-200 focus:outline-none transition-all resize-none placeholder:text-zinc-800 font-mono text-base leading-relaxed"
                    />
                    <div className="absolute top-4 right-8 text-[9px] font-black text-zinc-800 uppercase tracking-widest group-focus-within:text-red-900 transition-colors">
                      STRICT_MODE_ACTIVE
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-[10px] text-zinc-600 uppercase font-black tracking-widest px-6">
                     <i className="fa-solid fa-circle-info text-red-500/40"></i>
                     Direct mapping allows for high precision but requires a stable prompt logic.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Fusion Status (Desktop only) */}
          {activeTab === 'fusion' && (
            <div className="hidden lg:flex w-80 shrink-0 flex-col border-l border-white/10 bg-black/40 backdrop-blur-md p-8 relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <i className="fa-solid fa-dna text-[120px] text-red-500"></i>
              </div>

              <div className="relative z-10 flex-grow flex flex-col">
                <div className="mb-10">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                    Fusion Chamber
                  </h4>
                  
                  <div className="relative w-full aspect-square flex items-center justify-center mb-8">
                    <div className="absolute inset-0 border border-dashed border-red-900/20 rounded-full animate-spin-slow"></div>
                    <div className="absolute inset-4 border border-dashed border-red-500/10 rounded-full animate-spin-reverse"></div>
                    
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center border-2 transition-all duration-700 ${selected.length > 0 ? 'bg-red-600/10 border-red-500 shadow-[0_0_50px_rgba(220,38,38,0.2)]' : 'bg-zinc-900 border-zinc-800 opacity-20'}`}>
                       <i className={`fa-solid ${selected.length === 0 ? 'fa-atom' : selected.length === 1 ? 'fa-microchip' : selected.length === 2 ? 'fa-bolt' : 'fa-explosion'} text-3xl text-red-500 ${selected.length > 0 ? 'animate-pulse' : ''}`}></i>
                    </div>

                    {selected.map((s, i) => {
                      const angle = (i * (360 / selected.length) * Math.PI) / 180;
                      const radius = 80;
                      return (
                        <div 
                          key={s}
                          className="absolute w-8 h-8 rounded-lg bg-red-600 border border-white/20 flex items-center justify-center shadow-lg animate-fadeIn"
                          style={{
                            transform: `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px)`
                          }}
                        >
                          <i className="fa-solid fa-link text-[10px] text-white"></i>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-center">
                    <div className="text-[24px] font-black text-white italic tracking-tighter uppercase">{selected.length} / 3</div>
                    <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1">Cores Linked</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[9px] font-black text-zinc-700 uppercase tracking-widest border-b border-white/5 pb-2">Cognitive Map</h5>
                  {selected.length === 0 ? (
                    <div className="text-[10px] text-zinc-800 font-mono leading-relaxed uppercase">Awaiting neural link initiation...</div>
                  ) : (
                    selected.map(s => (
                      <div key={s} className="flex items-center gap-3 group animate-slideIn">
                        <i className="fa-solid fa-angle-right text-red-500 text-[10px]"></i>
                        <span className="text-[11px] font-black text-zinc-300 uppercase tracking-widest truncate">{s}</span>
                        <button 
                          onClick={() => toggleSelect(s)}
                          className="ml-auto opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-500 transition-all"
                        >
                          <i className="fa-solid fa-times text-[10px]"></i>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-8 md:p-10 border-t border-white/10 bg-black/60 relative z-10 shrink-0">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-600 uppercase tracking-[0.4em] font-black mb-1">Stability Threshold</span>
                <div className="flex items-center gap-3">
                  <div className="w-48 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full transition-all duration-1000 ${(activeTab === 'fusion' ? selected.length / 3 : activeTab === 'underground' ? selectedUnderground.length / UNDERGROUND_AGENTS.length : 1) * 100}%`}
                      style={{ width: `${(activeTab === 'fusion' ? selected.length / 3 : activeTab === 'underground' ? selectedUnderground.length / UNDERGROUND_AGENTS.length : 1) * 100}%` }}
                    ></div>
                  </div>
                  <span className={`text-[11px] font-black tracking-widest ${(activeTab === 'fusion' ? selected.length : activeTab === 'underground' ? selectedUnderground.length : 1) > 0 ? (activeTab === 'underground' ? 'text-green-500' : 'text-red-500') : 'text-zinc-800'}`}>
                    {((activeTab === 'fusion' ? selected.length / 3 : activeTab === 'underground' ? selectedUnderground.length / UNDERGROUND_AGENTS.length : 1) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {showValidationWarning && (
                <div className="flex items-center gap-2 text-red-500 animate-bounce px-4 py-2 bg-red-500/10 rounded-xl border border-red-500/20">
                  <i className="fa-solid fa-triangle-exclamation text-xs"></i>
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {activeTab === 'fusion' ? 'Select at least 1 core' : activeTab === 'underground' ? 'Select at least 1 framework' : 'Directive required'}
                  </span>
                </div>
              )}
            </div>
            
            <button
              disabled={isSynthesizing}
              onClick={handleSynthesize}
              className={`
                w-full md:w-auto px-16 py-5 rounded-[2rem] font-black uppercase text-[13px] tracking-[0.3em] transition-all flex items-center justify-center gap-4 relative overflow-hidden group
                ${((activeTab === 'fusion' && selected.length > 0) || (activeTab === 'custom' && customPrompt.trim()) || (activeTab === 'underground' && selectedUnderground.length > 0)) 
                  ? `${activeTab === 'underground' ? 'bg-green-600 hover:bg-green-500 shadow-[0_15px_40px_-10px_rgba(34,197,94,0.5)]' : 'bg-red-600 hover:bg-red-500 shadow-[0_15px_40px_-10px_rgba(220,38,38,0.5)]'} text-white active:scale-95` 
                  : 'bg-zinc-900 text-zinc-800 border border-white/5 cursor-not-allowed'}
              `}
            >
              {isSynthesizing ? (
                <>
                  <i className="fa-solid fa-dna animate-spin text-lg"></i>
                  <span>CONSTRUCTING OPERATIVE...</span>
                </>
              ) : (
                <>
                  <i className={`fa-solid ${activeTab === 'fusion' ? 'fa-bolt' : activeTab === 'underground' ? 'fa-eye-slash' : 'fa-terminal'} group-hover:rotate-12 transition-transform text-lg`}></i>
                  <span>{activeTab === 'underground' ? 'LINK FRAMEWORKS' : 'FABRICATE AGENT'}</span>
                </>
              )}
              
              {!isSynthesizing && ((activeTab === 'fusion' && selected.length > 0) || (activeTab === 'custom' && customPrompt.trim()) || (activeTab === 'underground' && selectedUnderground.length > 0)) && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              )}
            </button>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-zinc-800 font-black uppercase tracking-[0.8em] pointer-events-none opacity-40">
           Neural Fabrication Interface // System Status: Nominal
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .animate-spin-slow { animation: spin 25s linear infinite; }
        .animate-spin-reverse { animation: spin-rev 15s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-rev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        .animate-slideIn { animation: slideIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AgentCreator;
