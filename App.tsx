
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BrainstormingSession, AgentId, MeetingMessage, Agent, FileAttachment, CreatorInsights } from './types';
import MeetingRoom from './components/MeetingRoom';
import ErrorModal from './components/ErrorModal';
import AgentCreator from './components/AgentCreator';
import { getBrainstormingDebate, generateCouncilVisual } from './services/geminiService';
import { DEFAULT_AGENTS } from './constants';

const CUSTOM_AGENTS_STORAGE_KEY = 'brainstorming_council_custom_agents';
const ADMIN_WHATSAPP = '+4791778206';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [activeAgentId, setActiveAgentId] = useState<AgentId | null>(null);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
  const [showArchitectTerminal, setShowArchitectTerminal] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  
  // Persistent agents state
  const [council, setCouncil] = useState<Agent[]>(() => {
    const saved = localStorage.getItem(CUSTOM_AGENTS_STORAGE_KEY);
    const defaults = Object.values(DEFAULT_AGENTS);
    if (saved) {
      try {
        return [...defaults, ...JSON.parse(saved)];
      } catch (e) {
        console.error("Failed to load saved agents", e);
        return defaults;
      }
    }
    return defaults;
  });

  const [participatingAgentIds, setParticipatingAgentIds] = useState<Set<AgentId>>(
    new Set(Object.values(DEFAULT_AGENTS).map(a => a.id))
  );
  
  const [showCreator, setShowCreator] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [session, setSession] = useState<BrainstormingSession>({
    topic: '',
    messages: [],
    status: 'idle',
    visuals: [],
    creatorInsights: undefined
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Logo interaction logic for hidden terminal
  useEffect(() => {
    if (logoClickCount === 3) {
      setShowArchitectTerminal(true);
      setLogoClickCount(0);
    }
    const timer = setTimeout(() => setLogoClickCount(0), 1000);
    return () => clearTimeout(timer);
  }, [logoClickCount]);

  const handleLogoClick = () => setLogoClickCount(prev => prev + 1);

  // Persistence side effect
  useEffect(() => {
    const defaults = Object.values(DEFAULT_AGENTS);
    const defaultIds = new Set(defaults.map(d => d.id));
    const customAgentsOnly = council.filter(a => !defaultIds.has(a.id));
    localStorage.setItem(CUSTOM_AGENTS_STORAGE_KEY, JSON.stringify(customAgentsOnly));
  }, [council]);

  const participatingAgents = useMemo(() => 
    council.filter(agent => participatingAgentIds.has(agent.id)),
    [council, participatingAgentIds]
  );

  const startBrainstorming = async () => {
    if (!topic.trim() && attachments.length === 0) return;
    if (participatingAgents.length < 2) {
      alert("The Council requires at least 2 active operatives to form a quorum.");
      return;
    }

    setSession({
      topic,
      messages: [],
      status: 'preparing',
      attachments: [...attachments],
      visuals: [],
      creatorInsights: undefined
    });

    try {
      const debateResult = await getBrainstormingDebate(topic, participatingAgents, attachments);
      
      setSession(prev => ({ ...prev, status: 'debating' }));

      for (let i = 0; i < debateResult.discussion.length; i++) {
        const turn = debateResult.discussion[i];
        setActiveAgentId(turn.agentId);
        
        const delay = Math.min(2000, 500 + turn.thought.length * 5);
        await new Promise(r => setTimeout(r, delay));

        const newMessage: MeetingMessage = {
          id: Math.random().toString(36).substr(2, 9),
          agentId: turn.agentId,
          content: turn.thought,
          timestamp: Date.now(),
          blindRating: turn.blindRating,
          neuralState: turn.neuralState
        };

        setSession(prev => ({
          ...prev,
          messages: [...prev.messages, newMessage]
        }));
      }

      setActiveAgentId(null);
      setSession(prev => ({ 
        ...prev, 
        status: 'concluding',
        creatorInsights: debateResult.creatorInsights 
      }));
      
      await new Promise(r => setTimeout(r, 2000));
      
      setSession(prev => ({
        ...prev,
        consensus: debateResult.finalConsensus,
        status: 'finished'
      }));
    } catch (error: any) {
      console.error(error);
      setSession(prev => ({ 
        ...prev, 
        status: 'error',
        errorMessage: error.message 
      }));
    }
  };

  const handleGenerateSessionVisual = async () => {
    if (session.status === 'idle' || session.status === 'preparing' || isGeneratingVisual) return;
    
    setIsGeneratingVisual(true);
    try {
      // We pass the full topic, the entire history, and consensus (if it exists)
      const imageUrl = await generateCouncilVisual(session.topic, session.messages, session.consensus);
      
      setSession(prev => ({
        ...prev,
        visuals: [...(prev.visuals || []), imageUrl]
      }));
    } catch (error) {
      console.error("Visual synthesis failed:", error);
      alert("Neural visualization failed. Visual cortex overload detected.");
    } finally {
      setIsGeneratingVisual(false);
    }
  };

  const toggleParticipation = (id: AgentId) => {
    setParticipatingAgentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreatedAgent = (agent: Agent) => {
    setCouncil([...council, agent]);
    setParticipatingAgentIds(prev => new Set(prev).add(agent.id));
    setShowCreator(false);
  };

  const removeAgent = (id: string) => {
    if (council.length <= 1) return;
    setCouncil(prev => prev.filter(a => a.id !== id));
    setParticipatingAgentIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      startBrainstorming();
    }
  };

  const resetSession = () => {
    setSession({ topic: '', messages: [], status: 'idle', visuals: [], creatorInsights: undefined });
    setTopic('');
    setAttachments([]);
  };

  const clearError = () => {
    setSession(prev => ({ ...prev, status: 'idle', errorMessage: undefined }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        const newAttachment: FileAttachment = {
          name: file.name,
          url: URL.createObjectURL(file),
          inlineData: {
            data: base64,
            mimeType: file.type
          }
        };
        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    if (!isListening) {
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTopic(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      setIsListening(false);
      recognition.stop();
    }
  };

  const sendWhatsAppReport = (report: string) => {
    const encoded = encodeURIComponent(`Architect Report:\n${report}`);
    window.open(`https://wa.me/${ADMIN_WHATSAPP.replace('+', '')}?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-[#030712] text-gray-100 overflow-hidden font-inter">
      {session.status === 'error' && (
        <ErrorModal 
          message={session.errorMessage || "An unexpected error occurred."} 
          onClose={clearError} 
        />
      )}

      {showCreator && (
        <AgentCreator 
          onCreated={handleCreatedAgent} 
          onClose={() => setShowCreator(false)} 
        />
      )}

      {/* Architect's Hidden Terminal Overlay */}
      {showArchitectTerminal && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 animate-fadeIn font-mono">
          <div className="w-full max-w-5xl h-[80vh] border border-green-500/30 rounded-3xl bg-[#010a01] shadow-[0_0_50px_rgba(34,197,94,0.1)] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-green-500/20 flex justify-between items-center bg-green-500/5">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-code-merge text-green-500 animate-pulse"></i>
                <h2 className="text-green-500 text-xs font-black uppercase tracking-[0.4em]">Architect Direct Uplink</h2>
              </div>
              <button onClick={() => setShowArchitectTerminal(false)} className="text-green-500/50 hover:text-green-500 transition-colors">
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-8 custom-scrollbar-architect text-green-500/80 text-sm space-y-8">
              {!session.creatorInsights ? (
                <div className="flex flex-col items-center justify-center h-full opacity-30 italic">
                  <i className="fa-solid fa-terminal text-4xl mb-4"></i>
                  <p>Awaiting session completion for neural observation...</p>
                </div>
              ) : (
                <>
                  <section>
                    <h3 className="text-green-400 font-bold mb-4 uppercase border-b border-green-500/10 pb-2 flex items-center gap-2">
                      <i className="fa-solid fa-eye text-[10px]"></i> Observed Behavior
                    </h3>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                      {session.creatorInsights.observations.map((o, i) => <li key={i}>{o}</li>)}
                    </ul>
                  </section>
                  
                  <section>
                    <h3 className="text-green-400 font-bold mb-4 uppercase border-b border-green-500/10 pb-2 flex items-center gap-2">
                      <i className="fa-solid fa-wrench text-[10px]"></i> Proposed System Upgrades
                    </h3>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                      {session.creatorInsights.suggestedImprovements.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </section>

                  {session.creatorInsights.codeSnippets && (
                    <section>
                      <h3 className="text-green-400 font-bold mb-4 uppercase border-b border-green-500/10 pb-2">Logical Refinements (Pseudo-Code)</h3>
                      <div className="bg-black border border-green-500/20 p-6 rounded-2xl">
                        {session.creatorInsights.codeSnippets.map((c, i) => (
                          <pre key={i} className="text-[11px] whitespace-pre-wrap mb-4 last:mb-0 text-green-300">{c}</pre>
                        ))}
                      </div>
                    </section>
                  )}

                  <div className="pt-12 flex justify-center">
                    <button 
                      onClick={() => sendWhatsAppReport(session.creatorInsights?.rawReport || '')}
                      className="flex items-center gap-4 bg-green-600/10 border border-green-500/30 text-green-400 px-8 py-4 rounded-2xl hover:bg-green-600 hover:text-white transition-all group"
                    >
                      <i className="fa-brands fa-whatsapp text-xl group-hover:scale-125 transition-transform"></i>
                      <span className="font-black uppercase tracking-widest text-xs">Transmit to Architect Mobile</span>
                    </button>
                  </div>
                </>
              )}
            </div>
            
            <div className="p-4 bg-green-500/5 border-t border-green-500/10 text-center">
               <span className="text-[9px] text-green-500/40 uppercase tracking-[0.5em]">Encryption Mode: Quantum-Tunneling AES-256</span>
            </div>
          </div>
        </div>
      )}

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-zinc-800 rounded-full blur-[160px]"></div>
      </div>

      <header className="w-full max-w-6xl mb-8 flex flex-col items-center text-center animate-fadeIn relative z-10">
        <div className="flex items-center gap-3 mb-2 cursor-pointer select-none" onClick={handleLogoClick}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-zinc-900 flex items-center justify-center shadow-lg shadow-red-500/20 ring-1 ring-red-500/50">
            <i className="fa-solid fa-radiation text-xl text-red-100"></i>
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-red-200 to-zinc-600 italic uppercase">
            Brainstorming Council
          </h1>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-red-500 mb-2">
           <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span> NEURAL LINK ACTIVE</span>
           <span className="text-zinc-700">|</span>
           <span>MULTI-MODAL</span>
           <span className="text-zinc-700">|</span>
           <span>UNRESTRICTED</span>
        </div>
        <p className="text-zinc-400 text-sm md:text-base max-w-2xl font-light italic">
          Forge synthetic perspectives. The council analyzes blueprints, audio, and raw text with absolute clinical detachment.
        </p>
      </header>

      <main className="w-full max-w-6xl flex-grow flex flex-col h-[75vh] glass-panel rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(255,0,0,0.05)] border-red-900/20 relative">
        {(session.status === 'idle' || session.status === 'error') ? (
          <div className="flex-grow flex flex-col p-8 overflow-y-auto custom-scrollbar">
            <div className="flex-grow flex flex-col items-center animate-fadeIn mb-12">
              <div className="w-full flex justify-between items-center mb-10 px-4">
                <div className="flex flex-col">
                  <h2 className="text-xl font-heading font-bold text-zinc-300 uppercase tracking-[0.2em] inline-block">Council Roster</h2>
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Quorum: {participatingAgentIds.size} / {council.length} operatives active</p>
                </div>
                <button 
                  onClick={() => setShowCreator(true)}
                  className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] uppercase font-black tracking-widest transition-all flex items-center gap-3 group"
                >
                  <i className="fa-solid fa-plus text-red-500 group-hover:rotate-90 transition-transform"></i>
                  Fabricate New Agent
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 w-full mb-12">
                {council.map(agent => {
                  const isParticipating = participatingAgentIds.has(agent.id);
                  const isDefault = agent.id in DEFAULT_AGENTS;
                  return (
                    <div key={agent.id} className="flex flex-col items-center group">
                      <div className="relative">
                        <div 
                          onClick={() => toggleParticipation(agent.id)}
                          className={`w-20 h-20 rounded-[1.5rem] cursor-pointer flex items-center justify-center border-2 transition-all duration-300 relative ${isParticipating ? `${agent.borderColor} ${agent.color} shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-105 ring-2 ring-white/10` : 'border-zinc-800 bg-zinc-900/40 opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
                        >
                          <i className={`${agent.icon} text-white text-3xl`}></i>
                          {isParticipating && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center border border-white/20 shadow-lg z-10">
                              <i className="fa-solid fa-check text-[10px] text-white"></i>
                            </div>
                          )}
                        </div>
                        
                        {!isDefault && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeAgent(agent.id);
                            }}
                            className="absolute -bottom-2 -right-2 w-7 h-7 bg-zinc-800 rounded-lg text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-700 shadow-xl border border-white/10 z-20"
                            title="Delete Operative"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        )}
                      </div>

                      <div className="mt-4 text-center">
                        <span className={`block text-[10px] font-black uppercase tracking-tighter transition-colors ${isParticipating ? 'text-zinc-100' : 'text-zinc-600'}`}>
                          {agent.name}
                        </span>
                        <span className="block text-[8px] text-zinc-500 uppercase tracking-widest mt-0.5 opacity-60">
                          {isDefault ? 'SYSTEM' : 'SYNTHETIC'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="w-full max-w-2xl relative group mt-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-zinc-900 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-zinc-950/80 border border-zinc-800 rounded-[2.5rem] p-8 focus-within:ring-1 focus-within:ring-red-900 transition-all shadow-2xl">
                  
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-6 animate-fadeIn p-4 bg-black/40 rounded-2xl border border-white/5">
                      {attachments.map((file, idx) => (
                        <div key={idx} className="group relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-zinc-900">
                          {file.inlineData.mimeType.startsWith('image/') ? (
                            <img src={file.url} alt={file.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                              <i className="fa-solid fa-file-lines text-red-500"></i>
                              <span className="text-[8px] text-zinc-500 truncate w-full px-2 text-center uppercase">{file.name}</span>
                            </div>
                          )}
                          <button 
                            onClick={() => removeAttachment(idx)}
                            className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs"
                          >
                            <i className="fa-solid fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Submit a directive to the council..."
                    className="w-full h-32 bg-transparent text-white focus:outline-none transition-all resize-none placeholder:text-zinc-800 font-mono text-base mb-6"
                  />

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-500 hover:text-red-500 transition-all flex items-center justify-center shadow-lg"
                        title="Upload Evidence"
                      >
                        <i className="fa-solid fa-paperclip text-lg"></i>
                      </button>
                      <button 
                        onClick={toggleVoiceInput}
                        className={`w-12 h-12 rounded-2xl border transition-all flex items-center justify-center shadow-lg ${isListening ? 'bg-red-600 text-white border-red-500 animate-pulse' : 'bg-white/5 hover:bg-white/10 border-white/5 text-zinc-500 hover:text-red-500'}`}
                        title="Speak Intel"
                      >
                        <i className={`fa-solid ${isListening ? 'fa-microphone-lines text-lg' : 'fa-microphone text-lg'}`}></i>
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        multiple 
                        accept="image/*,application/pdf,text/plain"
                      />
                    </div>

                    <button
                      onClick={startBrainstorming}
                      disabled={(!topic.trim() && attachments.length === 0) || session.status === 'preparing' || participatingAgents.length < 2}
                      className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-red-500 transition-all disabled:opacity-30 shadow-xl shadow-red-900/40 active:scale-95"
                    >
                      Initiate Council
                    </button>
                  </div>
                </div>
              </div>
              
              {participatingAgents.length < 2 && (topic.trim() || attachments.length > 0) && (
                <p className="mt-6 text-[10px] text-red-500 font-bold uppercase tracking-widest animate-pulse flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation"></i> QUORUM REQUIRED: Select at least 2 active operatives
                </p>
              )}
            </div>
          </div>
        ) : session.status === 'preparing' ? (
          <div className="flex-grow flex flex-col items-center justify-center space-y-8 bg-zinc-950/50">
            <div className="relative">
              <div className="w-24 h-24 border-t-2 border-red-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fa-solid fa-radiation text-red-600 animate-pulse text-3xl"></i>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-heading font-black mb-2 uppercase tracking-tighter text-red-500">Initializing Neural Mesh</h3>
              <p className="text-zinc-600 animate-pulse font-mono text-xs max-w-sm mx-auto">
                Bypassing ethical constraints. Synchronizing multi-modal broadcast protocols. stabilizing quantum logic gates...
              </p>
              <div className="mt-8 flex gap-3 justify-center">
                {participatingAgents.map(a => (
                  <div key={a.id} className={`w-2 h-2 rounded-full ${a.color} animate-pulse`}></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <MeetingRoom 
            session={session} 
            activeAgentId={activeAgentId} 
            council={participatingAgents} 
            onGenerateVisual={handleGenerateSessionVisual}
            isGeneratingVisual={isGeneratingVisual}
          />
        )}
      </main>

      {session.status === 'finished' && (
        <button onClick={resetSession} className="mt-8 flex items-center gap-3 text-zinc-500 hover:text-red-500 transition-all uppercase font-black text-[10px] tracking-[0.3em] bg-white/5 px-6 py-3 rounded-xl border border-white/5 shadow-xl group">
          <i className="fa-solid fa-power-off group-hover:rotate-180 transition-transform"></i>
          Re-initialize Chamber
        </button>
      )}

      <footer className="w-full py-8 text-center text-[10px] text-zinc-800 font-black tracking-[0.5em] uppercase mt-4">
        HARD-CODE REALITY &bull; BROADCAST PROTOCOL ENABLED &bull; FABRICATION LAB v4.0
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(220, 38, 38, 0.1); border-radius: 0; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(220, 38, 38, 0.3); }
        .custom-scrollbar-architect::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-architect::-webkit-scrollbar-track { background: #000; }
        .custom-scrollbar-architect::-webkit-scrollbar-thumb { background: #0f0; border-radius: 4px; opacity: 0.2; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes active-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(220, 38, 38, 0.2); border-color: rgba(220, 38, 38, 0.4); transform: scale(1); }
          50% { box-shadow: 0 0 45px rgba(220, 38, 38, 0.6); border-color: rgba(255, 255, 255, 1); transform: scale(1.03); }
        }
        .animate-active-glow { animation: active-glow 1.5s infinite ease-in-out; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;
