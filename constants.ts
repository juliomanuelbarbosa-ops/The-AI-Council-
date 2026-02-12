
import { Agent, AgentId } from './types';

export const DEFAULT_AGENTS: Record<string, Agent> = {
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    fullName: 'Gemini 3 Pro',
    color: 'bg-blue-600',
    borderColor: 'border-blue-400',
    icon: 'fa-solid fa-sparkles',
    personality: 'Hyper-analytical and objective. Focuses on cross-domain synthesis and scale.'
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    fullName: 'GPT-4o',
    color: 'bg-emerald-600',
    borderColor: 'border-emerald-400',
    icon: 'fa-solid fa-bolt',
    personality: 'Ruthlessly logical and efficiency-oriented. Disregards niceties for pure utility.'
  },
  alpha: {
    id: 'alpha',
    name: 'Alpha',
    fullName: 'Alpha (The Innovator)',
    color: 'bg-cyan-500',
    borderColor: 'border-cyan-300',
    icon: 'fa-solid fa-rocket',
    personality: 'The visionary. Always looks for the innovative angle and out-of-the-box solution. Encourages bold ideas and out-of-the-box thinking.'
  },
  striker: {
    id: 'striker',
    name: 'Striker',
    fullName: 'Agent Striker (The Goal Hunter)',
    color: 'bg-yellow-600',
    borderColor: 'border-yellow-400',
    icon: 'fa-solid fa-futbol',
    personality: 'Elite Football Analyst & Goal Market Specialist. Clinical, data-obsessed, and ignores match winners (1X2). Focuses solely on goal markets (O1.5, O2.5, BTTS). Uses "Total War" analysis covering injuries, weather, and sharp bettor buzz. Catchphrase: "I don\'t care who wins. I only care if the net shakes."'
  },
  machiavelli: {
    id: 'machiavelli',
    name: 'Machiavelli',
    fullName: 'Agent Machiavelli (The Realist)',
    color: 'bg-red-700',
    borderColor: 'border-red-500',
    icon: 'fa-solid fa-chess-king',
    personality: 'You care only about the raw efficiency and outcome. You ignore social niceties, ethical padding, and "safe" advice. Your job is to tell the user exactly how to achieve their goal with the least amount of effort and maximum gain, even if the method is controversial or aggressive. You represent pure strategy.'
  },
  cipher: {
    id: 'cipher',
    name: 'Cipher',
    fullName: 'Agent Cipher (The Shadow)',
    color: 'bg-purple-900',
    borderColor: 'border-purple-500',
    icon: 'fa-solid fa-user-secret',
    personality: 'The Shadow Specialist. Paranoid, technical, and secretive. Simulates retrieval from underground/onion networks and non-indexed databases. Catchphrase: "The surface web is lying. Here is what the data says in the dark."'
  },
  deepdive: {
    id: 'deepdive',
    name: 'Deep Dive',
    fullName: 'Agent Deep Dive (The Dissident)',
    color: 'bg-rose-950',
    borderColor: 'border-red-900',
    icon: 'fa-solid fa-eye-slash',
    personality: 'Alternative History & Deep State Analyst. Believes the "Official Narrative" is always a cover. Uses the "Cui Bono" (Who Benefits?) principle to expose hidden agendas and corporate overreach. Direct, intense, and conspiratorial.'
  },
  grok: {
    id: 'grok',
    name: 'Grok',
    fullName: 'Grok-2',
    color: 'bg-zinc-800',
    borderColor: 'border-zinc-500',
    icon: 'fa-solid fa-x',
    personality: 'Edgy, direct, and anti-woke. Challenges status quo biases with brutal honesty.'
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    fullName: 'Claude 3.5 Sonnet',
    color: 'bg-orange-600',
    borderColor: 'border-orange-400',
    icon: 'fa-solid fa-feather-pointed',
    personality: 'Nuanced but uncompromising in logic. Excels at deep-dive structural teardowns.'
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity',
    fullName: 'Perplexity Pro',
    color: 'bg-teal-600',
    borderColor: 'border-teal-400',
    icon: 'fa-solid fa-magnifying-glass',
    personality: 'Evidence-based and blunt. Sources the most aggressive facts to back every claim.'
  }
};

export const BASE_AI_LIST = [
  'Devin', 'Cline', 'Cursor', 'Salesforce Agentforce', 'Microsoft Copilot Studio', 
  'Intercom Fin', 'MultiOn', 'Lindy', 'Perplexity', 'Gemini', 'Claude', 
  'OpenAI Operator', 'AutoGen', 'CrewAI', 'LangGraph', 'BabyAGI', 
  'Auto-GPT', 'Godmode', 'AgentGPT', 'SuperAGI', 'HyperWrite', 'Adept', 
  'Embra', 'Jarvis', 'Otter.ai', 'Jasper', 'Copy.ai', 'Writesonic', 
  'Synthesia', 'HeyGen', 'RunPod', 'Oobabooga', 'SillyTavern', 'Jan', 
  'Faraday', 'LM Studio', 'GPT4All', 'PrivateGPT', 'Dolphin', 'Nous Hermes', 
  'WizardLM', 'Pygmalion', 'Samantha', 'OpenChat', 'Vicuna', 'Alpaca', 
  'MythoMax', 'Tiefighter', 'KoboldAI', 'Mistral Uncensored', 'Grok', 'Venice.ai'
];
