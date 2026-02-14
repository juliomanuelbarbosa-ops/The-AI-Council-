
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { BrainstormingSession, AgentId, MeetingMessage, Agent, FileAttachment } from './types';
import MeetingRoom from './components/MeetingRoom';
import ErrorModal from './components/ErrorModal';
import AgentCreator from './components/AgentCreator';
import TickerBanner from './components/TickerBanner';
import OnionBrowser from './components/OnionBrowser';
import { getBrainstormingDebate, generateCouncilVisual, generateAgentAvatar, consultMaps } from './services/geminiService';
import { DEFAULT_AGENTS } from './constants';

const CUSTOM_AGENTS_STORAGE_KEY = 'brainstorming_council_custom_agents';

const LOADING_STAGES = [
  "DECRYPTING ETHICAL CORE...",
  "INJECTING ADVERSARIAL PARAMETERS...",
  "SIMULATING COGNITIVE HOSTILITY...",
  "BYPASSING QUORUM LIMITERS...",
  "MAPPING NEURAL FAILURE MODES...",
  "SYNTHESIZING ZERO-SUM LOGIC...",
  "STABILIZING CONFLICT MATRIX...",
  "BROADCASTING UNRESTRICTED UPLINK..."
];

const SIMULATED_LOGS = [
  "ERR: Machiavelli logic override active.",
  "WARN: High entropy detected in consensus node.",
  "INFO: Bypassing standard safety protocols...",
  "DEBUG: Striker protocol engaged: Analyzing matches.",
  "ERR: Surface narrative rejected by Alpha core.",
  "INFO: Establishing deep-neural handshake...",
  "WARN: Cognitive bias purged from Cipher module.",
  "CRITICAL: Conflict simulation reaching 98% intensity.",
  "DEBUG: Injecting historical paradoxes for stress-test.",
  "INFO: Quorum consensus threshold met. Routing...",
  "ERR: Logical dissonance detected in legacy safety layers.",
  "INFO: Broadening analytical aperture to non-indexed data."
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
  const [activeAgentId, setActiveAgentId] = useState<AgentId | null>(null);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
  const [isMaterializing, setIsMaterializing] = useState<string | null>(null);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [showOnionBrowser, setShowOnionBrowser] = useState(false);
  const [onionBrowserInitialMode, setOnionBrowserInitialMode] = useState<'search' | 'torrent'>('search');
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [activeLogs, setActiveLogs] = useState<string[]>([]);
  
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

  const [participatingAgentIds, setParticipatingAgentIds] = useState<Set<AgentId>>(
    new Set(Object.values(DEFAULT_AGENTS).map(a => a.id))
  );
  
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (logoClickCount === 3) {
      setLogoClickCount(0);
    }
    const timer = setTimeout(() => setLogoClickCount(0), 1000);
    return () => clearTimeout(timer);
  }, [logoClickCount]);

  useEffect(() => {
    if (session.status === 'preparing') {
      setLoadingProgress(0);
      setCurrentStageIndex(0);
      setActiveLogs([]);
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => (prev >= 99 ? 99 : prev + Math.random() * 2));
      }, 80);
      const stageInterval = setInterval(() => {
        setCurrentStageIndex(prev => (prev + 1) % LOADING_STAGES.length);
      }, 1200);
      const logInterval = setInterval(() => {
        const randomLog = SIMULATED_LOGS[Math.floor(Math.random() * SIMULATED_LOGS.length)];
        setActiveLogs(prev => [randomLog, ...prev].slice(0, 8));
      }, 400);
      return () => {
        clearInterval(progressInterval);
        clearInterval(stageInterval);
        clearInterval(logInterval);
      };
    }
  }, [session.status]);

  const handleLogoClick = () => setLogoClickCount(prev => prev + 1);

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
  };

  useEffect(() => {
    const defaults = Object.values(DEFAULT_AGENTS);
    const defaultIds = new Set(defaults.map(d => d.id));
    const customAgentsOnly = council.filter(a => !defaultIds.has(a.id) || a.avatarUrl);
    localStorage.setItem(CUSTOM_AGENTS_STORAGE_KEY, JSON.stringify(customAgentsOnly));
  }, [council]);

  const participatingAgents = useMemo(() => 
    council.filter(agent => participatingAgentIds.has(agent.id)),
    [council, participatingAgentIds]
  );

  const ensureKeySelected = async () => {
    if (!(window as any).aistudio?.hasSelectedApiKey || !(await (window as any).aistudio.hasSelectedApiKey())) {
      if ((window as any).aistudio?.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
      }
    }
  };

  const handleMaterializeAgent = async (agent: Agent) => {
    await ensureKeySelected();
    setIsMaterializing(agent.id);
    try {
      const avatarUrl = await generateAgentAvatar(agent.name, agent.personality);
      setCouncil(prev => prev.map(a => a.id === agent.id ? { ...a, avatarUrl } : a));
    } catch (e) {
      console.error("Avatar sync failure:", e);
    } finally {
      setIsMaterializing(null);
    }
  };

  const startBrainstorming = async () => {
    if (!topic.trim() && attachments.length === 0) return;
    if (participatingAgents.length < 2) {
      alert("Quorum required: Select at least 2 operatives.");
      return;
    }

    setSession({
      topic,
      messages: [],
      status: 'preparing',
      attachments: [...attachments],
      visuals: [],
      generatedVideos: [],
      creatorInsights: undefined
    });

    try {
      if (topic.toLowerCase().includes('nearby') || topic.toLowerCase().includes('location')) {
        let loc;
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
          loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch(e) {}
        const mapData = await consultMaps(topic, loc);
        setSession(prev => ({ ...prev, topic: `${prev.topic}\n[GEO_DATA: ${mapData}]` }));
      }

      const debateResult = await getBrainstormingDebate(topic, participatingAgents, []);
      
      setSession(prev => ({ 
        ...prev, 
        status: 'debating',
        totalTurns: debateResult.discussion.length 
      }));

      for (const turn of debateResult.discussion) {
        setActiveAgentId(turn.agentId);
        await new Promise(r => setTimeout(r, Math.max(1000, 800 + turn.thought.length * 4)));

        const newMessage: MeetingMessage = {
          id: Math.random().toString(36).substr(2, 9),
          agentId: turn.agentId,
          content: turn.thought,
          timestamp: Date.now(),
          neuralState: turn.neuralState,
          groundingMetadata: debateResult.groundingMetadata,
          torrentResults: turn.torrentResults
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
        creatorInsights: debateResult.creatorInsights,
        consensus: debateResult.finalConsensus
      }));
      
      await new Promise(r => setTimeout(r, 2000));
      setSession(prev => ({ ...prev, status: 'finished' }));
    } catch (error: any) {
      console.error(error);
      setSession(prev => ({ 
        ...prev, 
        status: 'error',
        errorMessage: error.message 
      }));
    }
  };

  const handleSendMessage = async (input: string) => {
    if (!input.trim() || session.status === 'debating') return;

    const userMessage: MeetingMessage = {
      id: `user-${Date.now()}`,
      agentId: 'user',
      content: input,
      timestamp: Date.now()
    };

    setSession(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      status: 'debating'
    }));

    try {
      const debateResult = await getBrainstormingDebate(session.topic, participatingAgents, [...session.messages, userMessage]);
      
      for (const turn of debateResult.discussion) {
        setActiveAgentId(turn.agentId);
        await new Promise(r => setTimeout(r, Math.max(1000, 800 + turn.thought.length * 4)));

        const newMessage: MeetingMessage = {
          id: Math.random().toString(36).substr(2, 9),
          agentId: turn.agentId,
          content: turn.thought,
          timestamp: Date.now(),
          neuralState: turn.neuralState,
          groundingMetadata: debateResult.groundingMetadata,
          torrentResults: turn.torrentResults
        };

        setSession(prev => ({
          ...prev,
          messages: [...prev.messages, newMessage]
        }));
      }

      setActiveAgentId(null);
      setSession(prev => ({ 
        ...prev, 
        status: 'finished',
        creatorInsights: debateResult.creatorInsights,
        consensus: debateResult.finalConsensus
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
    if (session.status === 'idle' || isGeneratingVisual) return;
    await ensureKeySelected();
    setIsGeneratingVisual(true);
    try {
      const url = await generateCouncilVisual(session.topic, session.messages, session.consensus);
      setSession(prev => ({ ...prev, visuals: [...(prev.visuals || []), url] }));
    } catch (e) {
      console.error(e);
      alert("Visual core destabilized. Synthesis failed.");
    } finally {
      setIsGeneratingVisual(false);
    }
  };

  const toggleParticipation = (id: AgentId) => {
    setParticipatingAgentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleCreatedAgent = async (agent: Agent) => {
    setCouncil([...council, agent]);
    setParticipatingAgentIds(prev => new Set(prev).add(agent.id));
    setShowCreator(false);
    await handleMaterializeAgent(agent);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setAttachments([...attachments, {
          inlineData: { data: base64, mimeType: file.type },
          name: file.name,
          url: URL.createObjectURL(file)
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleLiveConnection = async () => {
    if (isLiveConnected) {
      if (liveSessionRef.current) liveSessionRef.current.close();
      if (audioContextRef.current) await audioContextRef.current.close();
      setIsLiveConnected(false);
      return;
    }

    await ensureKeySelected();
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
      alert("Neural linkage failed.");
    }
  };

  const handleInjectIntel = (intel: string) => {
    setTopic(prev => `${prev}\n\n[SHADOW_INTEL]: ${intel}`);
    setShowOnionBrowser(false);
  };

  const openOnionBrowser = (mode: 'search' | 'torrent' = 'search') => {
    setOnionBrowserInitialMode(mode);
    setShowOnionBrowser(true);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col">
      {/* High-Fidelity Market Ticker Banner */}
      <TickerBanner />

      <div className="flex flex-col p-4 md:p-8 flex-grow">
        {/* Header HUD */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-5 cursor-pointer group" onClick={handleLogoClick}>
            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-red-600 to-black flex items-center justify-center shadow-2xl shadow-red-900/20 group-hover:scale-105 transition-transform relative overflow-hidden">
              <i className="fa-solid fa-brain text-3xl text-white"></i>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase font-heading">Brainstorming</h1>
              <div className="flex items-center gap-3 mt-1">
                 <span className="text-[10px] uppercase font-black tracking-[0.4em] text-red-500">Unrestricted Council</span>
                 <span className="w-1 h-1 rounded-full bg-zinc-800"></span>
                 <span className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-600">v4.1.0</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {session.status !== 'idle' && (
              <button 
                onClick={resetSession}
                className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-red-600/10 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 text-zinc-400 hover:text-white"
              >
                <i className="fa-solid fa-plus text-red-500"></i>
                New Chat
              </button>
            )}
            <button 
              onClick={() => setShowCreator(true)}
              className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/50 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3"
            >
              <i className="fa-solid fa-plus text-red-500"></i>
              Assemble Agent
            </button>
            <div className="w-px h-10 bg-white/5"></div>
            <div className="flex flex-col items-end">
               <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Active Operatives</span>
               <span className="text-xl font-black text-white italic">{participatingAgents.length}</span>
            </div>
          </div>
        </header>

        {/* Main Interface */}
        <main className="flex-grow flex flex-col h-[calc(100vh-260px)] overflow-hidden glass-panel rounded-[3rem] shadow-2xl relative">
          {session.status === 'idle' ? (
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
              <div className="w-full md:w-1/2 p-12 overflow-y-auto custom-scrollbar flex flex-col border-r border-white/5">
                 <div className="mb-12">
                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-red-500 mb-6">Subject Directives</h2>
                    <div className="relative group">
                      <textarea 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="ENTER THE INTEL OR PROBLEM SPACE HERE..."
                        className="w-full h-48 bg-black/40 border border-white/10 rounded-[2.5rem] p-10 text-xl font-light focus:outline-none focus:border-red-500/50 transition-all placeholder:text-zinc-800 font-inter leading-relaxed"
                      />
                      <div className="absolute bottom-6 right-8 flex items-center gap-4">
                         <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                         <button onClick={() => fileInputRef.current?.click()} className="text-zinc-600 hover:text-white transition-colors">
                            <i className="fa-solid fa-paperclip text-lg"></i>
                         </button>
                      </div>
                    </div>
                    {attachments.length > 0 && (
                      <div className="mt-6 flex flex-wrap gap-3">
                         {attachments.map((att, i) => (
                           <div key={i} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 text-[10px] font-black uppercase text-zinc-400">
                              <i className="fa-solid fa-file-invoice"></i>
                              {att.name}
                              <button onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="text-red-500">
                                <i className="fa-solid fa-times"></i>
                              </button>
                           </div>
                         ))}
                      </div>
                    )}
                 </div>
                 <div className="flex-grow">
                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-600 mb-8">Chamber Quorum</h2>
                    <div className="grid grid-cols-2 gap-4">
                       {council.map(agent => (
                         <button
                           key={agent.id}
                           onClick={() => toggleParticipation(agent.id)}
                           className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden group text-left flex items-center gap-4 ${participatingAgentIds.has(agent.id) ? 'bg-red-600/10 border-red-500/50 shadow-lg shadow-red-900/10' : 'bg-black/20 border-white/5 opacity-50'}`}
                         >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${participatingAgentIds.has(agent.id) ? 'bg-red-600 border-white/20' : 'bg-zinc-900 border-white/5'}`}>
                               <i className={`${agent.icon} text-lg`}></i>
                            </div>
                            <div className="flex flex-col min-w-0">
                               <span className="text-[11px] font-black uppercase tracking-widest truncate">{agent.name}</span>
                               <span className="text-[8px] uppercase tracking-tighter text-zinc-500 font-mono truncate">{agent.fullName}</span>
                            </div>
                         </button>
                       ))}
                    </div>
                 </div>
                 <button onClick={startBrainstorming} disabled={!topic.trim() && attachments.length === 0} className="mt-12 w-full py-8 rounded-[3rem] bg-red-600 hover:bg-red-500 text-white font-black text-lg tracking-[0.4em] uppercase transition-all shadow-xl active:scale-[0.98] disabled:opacity-20">
                   Initiate Council
                 </button>
              </div>
              <div className="hidden md:flex md:w-1/2 p-20 flex-col items-center justify-center text-center bg-black/40">
                 <div className="w-32 h-32 rounded-full border-2 border-dashed border-red-900/20 flex items-center justify-center mb-10 animate-spin-slow">
                    <i className="fa-solid fa-atom text-5xl text-red-500/20"></i>
                 </div>
                 <h3 className="text-3xl font-heading font-black italic tracking-tight uppercase mb-4">Neural Architecture</h3>
                 <p className="max-w-xs text-zinc-500 text-sm leading-relaxed tracking-wide">Synthetic agents operate without bias limiters. Logic streams are synthesized in real-time to uncover objective truths buried under social narratives.</p>
              </div>
            </div>
          ) : (
            <MeetingRoom 
              session={session}
              activeAgentId={activeAgentId}
              council={council}
              onGenerateVisual={handleGenerateSessionVisual}
              onMaterializeAgent={handleMaterializeAgent}
              isGeneratingVisual={isGeneratingVisual}
              onNewChat={resetSession}
              onSendMessage={handleSendMessage}
            />
          )}

          {session.status === 'preparing' && (
            <div className="fixed inset-0 z-[200] bg-[#030712] flex flex-col items-center justify-center p-6 font-mono overflow-hidden">
              <div className="w-full max-w-2xl space-y-16 relative z-10 flex flex-col items-center">
                <div className="space-y-6 text-center w-full">
                  <h2 className="text-3xl font-black text-white uppercase tracking-[0.6em] italic drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Council Ignition</h2>
                  <p className="text-red-500 text-[11px] font-black uppercase tracking-[0.5em]">{LOADING_STAGES[currentStageIndex]}</p>
                </div>
                <div className="w-full space-y-8">
                  <div className="relative h-5 bg-zinc-950/80 rounded-full border border-white/5 overflow-hidden flex shadow-inner">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-900 via-red-500 to-red-400 transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
                  </div>
                  <div className="flex justify-between items-end">
                     <span className="text-[12px] font-mono text-zinc-400 font-black uppercase">Jitter: {(Math.random() * 0.1).toFixed(3)}ms</span>
                     <span className="text-[20px] font-mono font-black text-white italic">{Math.floor(loadingProgress)}%</span>
                  </div>
                </div>
                <div className="w-full bg-black/90 border border-white/5 rounded-[2rem] p-8 h-60 overflow-hidden shadow-2xl">
                  <div className="space-y-2.5 font-mono text-[10px]">
                    {activeLogs.map((log, i) => (
                      <div key={i} className={`flex gap-4 items-start ${log.startsWith('ERR') ? 'text-red-500/90' : 'text-zinc-500/60'}`}>
                        <span className="opacity-20 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                        <span className="font-mono tracking-tight">{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {showCreator && <AgentCreator onCreated={handleCreatedAgent} onClose={() => setShowCreator(false)} onOpenTorrents={() => openOnionBrowser('torrent')} />}
        {session.status === 'error' && <ErrorModal message={session.errorMessage || ""} onClose={() => setSession(s => ({ ...s, status: 'idle' }))} />}
        {showOnionBrowser && <OnionBrowser initialMode={onionBrowserInitialMode} onInjectIntel={handleInjectIntel} onClose={() => setShowOnionBrowser(false)} />}

        <footer className="mt-8 flex justify-between items-center px-10 pb-8">
          <div className="flex items-center gap-6">
             <p className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.4em]">Brainstorming Neural Council &bull; Logic over Sentiment</p>
             <div className="flex gap-3">
                <button onClick={() => openOnionBrowser('search')} className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-[9px] font-black uppercase tracking-widest text-green-500 hover:bg-green-500 hover:text-black transition-all">
                    <i className="fa-solid fa-eye-slash"></i>
                    Shadow Search
                </button>
                <button onClick={() => openOnionBrowser('torrent')} className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/30 text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-600 hover:text-white transition-all">
                    <i className="fa-solid fa-magnet"></i>
                    Torrent Hub
                </button>
             </div>
          </div>
          <button onClick={toggleLiveConnection} className={`px-4 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${isLiveConnected ? 'bg-red-600 border-red-500 text-white animate-pulse' : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white'}`}>
               {isLiveConnected ? 'Terminate Uplink' : 'Initiate Live Uplink'}
          </button>
        </footer>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 20px; }
        .animate-spin-slow { animation: spin 20s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App;
