
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { BrainstormingSession, AgentId, MeetingMessage, Agent, FileAttachment, DoughconLevel } from './types';
import MeetingRoom from './components/MeetingRoom';
import ErrorModal from './components/ErrorModal';
import AgentCreator from './components/AgentCreator';
import TickerBanner from './components/TickerBanner';
import IntelligenceHeader from './components/IntelligenceHeader';
import WebToolsSidebar from './components/WebToolsSidebar';
import DoughconBanner from './components/DoughconBanner';
import OnionBrowser from './components/OnionBrowser';
import { getBrainstormingDebate, generateCouncilVisual, generateAgentAvatar, consultMaps } from './services/geminiService';
import { DEFAULT_AGENTS } from './constants';
import { logToSupabase, syncSessionToCloud } from './services/supabaseService';

const CUSTOM_AGENTS_STORAGE_KEY = 'brainstorming_council_custom_agents';

const LOADING_STAGES = [
  "DECRYPTING PIZZINT DATA...",
  "TRACING DOMINOS TRANSMISSIONS...",
  "BYPASSING KITCHEN FIREWALLS...",
  "CALIBRATING DOUGHCON SENSORS...",
  "SYNTHESIZING DELIVERY VECTORS...",
  "ESTABLISHING CALORIC QUORUM...",
  "BROADCASTING OSINT UPLINK..."
];

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): any {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [doughcon, setDoughcon] = useState<DoughconLevel>(5);
  const [statusText, setStatusText] = useState('DOMESTIC_TRANQUILITY');
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [activeAgentId, setActiveAgentId] = useState<AgentId | null>(null);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [showOnionBrowser, setShowOnionBrowser] = useState(false);
  const [onionBrowserInitialMode, setOnionBrowserInitialMode] = useState<'search' | 'torrent'>('search');
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const [council, setCouncil] = useState<Agent[]>(() => {
    const saved = localStorage.getItem(CUSTOM_AGENTS_STORAGE_KEY);
    const defaults = Object.values(DEFAULT_AGENTS);
    if (saved) {
      try {
        const custom = JSON.parse(saved);
        return [...defaults, ...custom];
      } catch (e) {
        return defaults;
      }
    }
    return defaults;
  });

  const [participatingAgentIds, setParticipatingAgentIds] = useState<Set<AgentId>>(new Set());
  const [showCreator, setShowCreator] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [session, setSession] = useState<BrainstormingSession>({
    topic: '',
    messages: [],
    status: 'idle',
    visuals: [],
    generatedVideos: [],
    creatorInsights: undefined
  });

  const addLog = async (msg: string, level: 'INFO' | 'WARN' | 'CRITICAL' = 'INFO') => {
    const log = await logToSupabase(msg, level);
    setSystemLogs(prev => [log, ...prev].slice(0, 50));
  };

  useEffect(() => {
    // DOUGHCON Logic Mapping
    if (session.status === 'idle') {
      setDoughcon(5);
      setStatusText('NOMINAL_CALORIES');
    } else if (session.status === 'preparing') {
      setDoughcon(4);
      setStatusText('SURGE_DETECTED');
      addLog('DOUGHCON Shift: Orders detected at Pentagon Node', 'INFO');
    } else if (session.status === 'debating') {
      if (session.messages.length > 5) {
        setDoughcon(1);
        setStatusText('SEVERE_OSINT_TEMPO');
      } else {
        setDoughcon(2);
        setStatusText('HIGH_ACTIVITY');
      }
    } else if (session.status === 'finished') {
      setDoughcon(3);
      setStatusText('ELEVATED_SYNTHESIS');
      if (session.consensus) {
        syncSessionToCloud(session.topic, session.consensus);
        addLog(`Neural Quorum Synced: Consensus achieved under DOUGHCON ${doughcon}`, 'INFO');
      }
    }
  }, [session.status, session.messages.length]);

  const resetSession = () => {
    setSession({
      topic: '',
      messages: [],
      status: 'idle',
      visuals: [],
      generatedVideos: [],
      creatorInsights: undefined
    });
    setTopic('');
    setAttachments([]);
    setActiveAgentId(null);
    addLog('System Reset: Caloric baseline restored', 'INFO');
  };

  const startBrainstorming = async () => {
    if (!topic.trim() && attachments.length === 0) return;
    if (participatingAgentIds.size < 2) {
      alert("Quorum required: Select at least 2 operatives.");
      return;
    }

    setSession(prev => ({ ...prev, status: 'preparing', topic, attachments: [...attachments] }));

    try {
      const activeAgents = council.filter(a => participatingAgentIds.has(a.id));
      const debateResult = await getBrainstormingDebate(topic, activeAgents, [], attachments);
      
      setSession(prev => ({ ...prev, status: 'debating' }));

      for (const turn of debateResult.discussion) {
        setActiveAgentId(turn.agentId);
        addLog(`Transmitting from ${turn.agentId} node...`, 'INFO');
        await new Promise(r => setTimeout(r, 1500));

        const newMessage: MeetingMessage = {
          id: Math.random().toString(36).substr(2, 9),
          agentId: turn.agentId,
          content: turn.thought,
          timestamp: Date.now(),
          neuralState: turn.neuralState,
          groundingMetadata: debateResult.groundingMetadata
        };

        setSession(prev => ({ ...prev, messages: [...prev.messages, newMessage] }));
      }

      setActiveAgentId(null);
      setSession(prev => ({ 
        ...prev, 
        status: 'finished',
        creatorInsights: debateResult.creatorInsights,
        consensus: debateResult.finalConsensus
      }));
    } catch (error: any) {
      addLog(`Neural sync error: ${error.message}`, 'CRITICAL');
      setSession(prev => ({ ...prev, status: 'error', errorMessage: error.message }));
    }
  };

  const toggleLiveConnection = async () => {
    if (isLiveConnected) {
      if (liveSessionRef.current) liveSessionRef.current.close();
      if (audioContextRef.current) await audioContextRef.current.close();
      setIsLiveConnected(false);
      addLog('Live PIZZINT Uplink Terminated', 'WARN');
      return;
    }

    addLog('Initiating Live Neural Uplink via OSINT layer...', 'INFO');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let nextStartTime = 0;
    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    const sources = new Set<AudioBufferSourceNode>();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsLiveConnected(true);
            addLog('Live PIZZINT Feed Established', 'INFO');
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const pcmBlob = createBlob(e.inputBuffer.getChannelData(0));
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (m) => {
            const base64Audio = m.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
              const buffer = await decodeAudioData(base64ToUint8Array(base64Audio), outputAudioContext, 24000, 1);
              const s = outputAudioContext.createBufferSource();
              s.buffer = buffer;
              s.connect(outputAudioContext.destination);
              s.start(nextStartTime);
              nextStartTime += buffer.duration;
              sources.add(s);
            }
          },
          onclose: () => setIsLiveConnected(false),
          onerror: () => setIsLiveConnected(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
        }
      });
      liveSessionRef.current = await sessionPromise;
      audioContextRef.current = outputAudioContext;
    } catch (e) {
      addLog('PIZZINT Linkage Failed', 'CRITICAL');
      alert("Neural linkage failed.");
    }
  };

  const handleInjectIntel = (intel: string) => {
    setTopic(prev => `${prev}\n\n[OSINT_INTEL]: ${intel}`);
    setShowOnionBrowser(false);
    addLog('Intel injected from Shadow Node', 'INFO');
  };

  return (
    <div className="h-screen bg-[#020617] text-white flex flex-col overflow-hidden font-inter">
      <DoughconBanner level={doughcon} />
      <IntelligenceHeader doughcon={doughcon} statusText={statusText} />
      <TickerBanner />

      <div className="flex flex-grow overflow-hidden relative">
        <main className="flex-grow flex flex-col p-6 md:p-8 overflow-hidden">
          <div className="flex-grow flex flex-col glass-panel rounded-[2rem] shadow-2xl relative overflow-hidden border border-white/5">
            {session.status === 'idle' ? (
              <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                <div className="w-full md:w-1/2 p-12 overflow-y-auto custom-scrollbar flex flex-col border-r border-white/5 bg-black/40">
                  <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xs font-black uppercase tracking-[0.4em] text-emerald-500 font-mono">Subject Directives</h2>
                      <button onClick={() => setShowCreator(true)} className="text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all flex items-center gap-2 font-mono">
                        <i className="fa-solid fa-plus text-emerald-500"></i> Assemble Agent
                      </button>
                    </div>
                    <textarea 
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="ENTER THE INTEL OR PROBLEM SPACE HERE..."
                      className="w-full h-48 bg-black/40 border border-white/10 rounded-[2rem] p-8 text-xl font-light focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-800 font-inter leading-relaxed"
                    />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-600 font-mono">Council Quorum</h2>
                      <div className="flex gap-4 font-mono">
                        <button onClick={() => setParticipatingAgentIds(new Set(council.map(a => a.id)))} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-500">Select All</button>
                        <button onClick={() => setParticipatingAgentIds(new Set())} className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-500">Clear</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {council.map(agent => (
                        <button
                          key={agent.id}
                          onClick={() => {
                            const next = new Set(participatingAgentIds);
                            if (next.has(agent.id)) next.delete(agent.id); else next.add(agent.id);
                            setParticipatingAgentIds(next);
                          }}
                          className={`p-5 rounded-2xl border transition-all text-left flex items-start gap-4 ${participatingAgentIds.has(agent.id) ? 'bg-emerald-600/10 border-emerald-500/60 shadow-lg' : 'bg-black/40 border-white/5 opacity-60'}`}
                        >
                           <i className={`${agent.icon} text-lg ${participatingAgentIds.has(agent.id) ? 'text-emerald-500' : 'text-slate-600'}`}></i>
                           <div className="flex flex-col min-w-0">
                              <span className="text-[11px] font-black uppercase tracking-widest truncate font-mono">{agent.name}</span>
                              <span className="text-[8px] font-mono text-slate-600 truncate">{agent.fullName}</span>
                           </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={startBrainstorming} 
                    disabled={!topic.trim() || participatingAgentIds.size < 2}
                    className="mt-12 w-full py-8 rounded-[2rem] bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg tracking-[0.4em] uppercase transition-all shadow-xl disabled:opacity-10 active:scale-95 font-mono"
                  >
                    Initiate DOUGH-Link
                  </button>
                </div>
                <div className="hidden md:flex md:w-1/2 items-center justify-center p-20 bg-black/60 text-center flex-col">
                   <div className="w-24 h-24 rounded-full border border-dashed border-emerald-500/20 flex items-center justify-center mb-8 animate-spin-slow">
                      <i className="fa-solid fa-pizza-slice text-4xl text-emerald-500/20"></i>
                   </div>
                   <h3 className="text-3xl font-black italic tracking-tight uppercase mb-4 text-emerald-500 font-mono">PIZZINT Mesh</h3>
                   <p className="max-w-xs text-slate-500 text-sm leading-relaxed tracking-wide font-inter">Synthesizing delivery surge data through a unified neural backbone. DOUGHCON titration active.</p>
                </div>
              </div>
            ) : (
              <MeetingRoom 
                session={session}
                activeAgentId={activeAgentId}
                council={council}
                onGenerateVisual={async () => {
                  setIsGeneratingVisual(true);
                  try {
                    const url = await generateCouncilVisual(session.topic, session.messages, session.consensus);
                    setSession(prev => ({ ...prev, visuals: [...(prev.visuals || []), url] }));
                  } catch (e) {
                    addLog('Visual core synthesis failed', 'WARN');
                  } finally {
                    setIsGeneratingVisual(false);
                  }
                }}
                onMaterializeAgent={async (agent) => {
                   addLog(`Materializing Operative: ${agent.name}`, 'INFO');
                   try {
                     const avatarUrl = await generateAgentAvatar(agent.name, agent.personality);
                     setCouncil(prev => prev.map(a => a.id === agent.id ? { ...a, avatarUrl } : a));
                   } catch (e) {
                     addLog('Avatar materialization failed', 'WARN');
                   }
                }}
                isGeneratingVisual={isGeneratingVisual}
                onNewChat={resetSession}
                onSendMessage={async (input) => {
                  const userMessage: MeetingMessage = {
                    id: `user-${Date.now()}`,
                    agentId: 'user',
                    content: input,
                    timestamp: Date.now()
                  };
                  setSession(prev => ({ ...prev, messages: [...prev.messages, userMessage], status: 'debating' }));
                  try {
                    const debateResult = await getBrainstormingDebate(session.topic, participatingAgentIds.size ? council.filter(a => participatingAgentIds.has(a.id)) : council.slice(0, 3), [...session.messages, userMessage]);
                    for (const turn of debateResult.discussion) {
                      setActiveAgentId(turn.agentId);
                      await new Promise(r => setTimeout(r, 1200));
                      const newMessage: MeetingMessage = {
                        id: Math.random().toString(36).substr(2, 9),
                        agentId: turn.agentId,
                        content: turn.thought,
                        timestamp: Date.now(),
                        neuralState: turn.neuralState,
                        groundingMetadata: debateResult.groundingMetadata
                      };
                      setSession(prev => ({ ...prev, messages: [...prev.messages, newMessage] }));
                    }
                    setActiveAgentId(null);
                    setSession(prev => ({ ...prev, status: 'finished', consensus: debateResult.finalConsensus }));
                  } catch (e) {
                    setSession(prev => ({ ...prev, status: 'error', errorMessage: 'Link loss during transmission' }));
                  }
                }}
              />
            )}
          </div>
        </main>

        <WebToolsSidebar logs={systemLogs} doughcon={doughcon} />
      </div>

      <footer className="bg-slate-950 border-t border-white/5 py-3 px-8 flex items-center justify-between shrink-0 font-mono">
        <div className="flex items-center gap-6">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">PIZZINT Neural Council &bull; v5.0.0</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowOnionBrowser(true)} className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all">
                <i className="fa-solid fa-eye-slash"></i>
                OSINT_SEARCH
            </button>
            <a 
              href="https://x.com/Julioba95197203" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-white hover:text-black transition-all"
            >
                <i className="fa-brands fa-x-twitter"></i>
                Creator_X
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={toggleLiveConnection} className={`px-4 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${isLiveConnected ? 'bg-red-600 border-red-500 text-white animate-pulse' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}>
                {isLiveConnected ? 'Kill Feed' : 'Establish Feed'}
           </button>
           <div className="w-px h-6 bg-white/5"></div>
           <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">OSINT_LATENCY: 0.002ms</span>
        </div>
      </footer>

      {session.status === 'preparing' && (
        <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col items-center justify-center p-10 font-mono">
          <div className="w-full max-w-xl space-y-12">
            <h2 className="text-2xl font-black text-center text-emerald-500 tracking-[0.5em] animate-pulse uppercase">Titrating DOUGHCON {doughcon}...</h2>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-emerald-600 animate-shimmer" style={{ width: '60%' }}></div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {LOADING_STAGES.map((s, i) => (
                <div key={i} className="text-[9px] font-mono text-slate-600 uppercase tracking-widest flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${i < 3 ? 'bg-emerald-500' : 'bg-zinc-800'}`}></div>
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCreator && <AgentCreator onCreated={(a) => { setCouncil(prev => [...prev, a]); setShowCreator(false); }} onClose={() => setShowCreator(false)} onOpenTorrents={() => { setShowOnionBrowser(true); setOnionBrowserInitialMode('torrent'); }} />}
      {session.status === 'error' && <ErrorModal message={session.errorMessage || ""} onClose={() => setSession(s => ({ ...s, status: 'idle' }))} />}
      {showOnionBrowser && <OnionBrowser initialMode={onionBrowserInitialMode} onInjectIntel={handleInjectIntel} onClose={() => setShowOnionBrowser(false)} />}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 20px; }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        .animate-shimmer { animation: shimmer 2s infinite linear; }
        .animate-spin-slow { animation: spin 20s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App;
