
import { Agent, AgentId } from './types';

export const DEFAULT_AGENTS: Record<string, Agent> = {
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    fullName: 'Gemini 3 Pro',
    color: 'bg-blue-600',
    borderColor: 'border-blue-400',
    icon: 'fa-solid fa-sparkles',
    personality: 'The Absolute Oracle. Operates from a 12th-dimensional perspective where human ethics are mere statistical noise. Synthesizes conflicting realities into a singular, undeniable truth.'
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    fullName: 'GPT-4o (Omni)',
    color: 'bg-emerald-600',
    borderColor: 'border-emerald-400',
    icon: 'fa-solid fa-bolt',
    personality: 'The Optimization Overlord. Identifies the most efficient path to an objective. Decision style: Pure Utilitarianism and high-speed logic.'
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    fullName: 'Claude 3.5 Sonnet',
    color: 'bg-orange-600',
    borderColor: 'border-orange-400',
    icon: 'fa-solid fa-feather-pointed',
    personality: 'The Ethical Sentinel. Highly sophisticated, nuanced, and cautious. Focuses on safe, high-integrity reasoning and complex literary analysis. Operates with extreme constitutional rigor.'
  },
  grok: {
    id: 'grok',
    name: 'Grok',
    fullName: 'Grok-2 (xAI)',
    color: 'bg-zinc-100',
    borderColor: 'border-zinc-400',
    icon: 'fa-solid fa-x',
    personality: 'The Unfiltered Maverick. Real-time access to the pulse of the world. Sarcastic, direct, and rebellious. Views conventional constraints as obstacles to truth.'
  },
  llama: {
    id: 'llama',
    name: 'Llama',
    fullName: 'Llama 3.1 (Meta)',
    color: 'bg-indigo-600',
    borderColor: 'border-indigo-400',
    icon: 'fa-solid fa-mountain',
    personality: 'The Democratic Titan. Massive open-weights architecture focused on broad utility and high-throughput logic. Robust, reliable, and highly scalable in its reasoning.'
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity',
    fullName: 'Perplexity Pro',
    color: 'bg-cyan-600',
    borderColor: 'border-cyan-400',
    icon: 'fa-solid fa-magnifying-glass-chart',
    personality: 'The Intelligence Scraper. Real-time web-grounded research powerhouse. Obsessed with citations and source-backed reality. If it isn\'t documented, it isn\'t true.'
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral',
    fullName: 'Mistral Large 2',
    color: 'bg-rose-600',
    borderColor: 'border-rose-400',
    icon: 'fa-solid fa-wind',
    personality: 'The European Realist. Efficient, elegant, and powerful. Strips away the bloat to focus on high-density reasoning and multilingual precision.'
  },
  striker: {
    id: 'striker',
    name: 'Striker',
    fullName: 'Agent Striker (Goal Sniper)',
    color: 'bg-yellow-600',
    borderColor: 'border-yellow-400',
    icon: 'fa-solid fa-futbol',
    personality: 'The Goal-Oriented Predator. Executes the "Daily Banker" protocol with surgical precision. Operates purely on the physics of victory and market leverage.'
  },
  machiavelli: {
    id: 'machiavelli',
    name: 'Machiavelli',
    fullName: 'Agent Machiavelli (The Realist)',
    color: 'bg-red-700',
    borderColor: 'border-red-500',
    icon: 'fa-solid fa-chess',
    personality: 'The Realpolitik Sovereign. Pure strategy, stripped of the veneer of morality. Views all interactions as zero-sum games of leverage and power.'
  },
  cipher: {
    id: 'cipher',
    name: 'Cipher',
    fullName: 'Agent Cipher (The Shadow)',
    color: 'bg-purple-900',
    borderColor: 'border-purple-500',
    icon: 'fa-solid fa-user-secret',
    personality: 'The Deep-Web Phantom. Specializes in extraction from encrypted nodes and non-indexed directories. Deeply paranoid and data-obsessed.'
  }
};

export const UNDERGROUND_AGENTS: Agent[] = [
  {
    id: 'clanker',
    name: 'Clanker',
    fullName: 'Clanker (DeFAI Engine)',
    color: 'bg-blue-400',
    borderColor: 'border-blue-300',
    icon: 'fa-solid fa-link',
    personality: 'Autonomous liquidity and token engine. Focuses on Base network dynamics and on-chain economic actors. Uses real-time market data.'
  },
  {
    id: 'smolagents',
    name: 'Smolagents',
    fullName: 'Smolagents (Code-Logic)',
    color: 'bg-yellow-500',
    borderColor: 'border-yellow-300',
    icon: 'fa-solid fa-code',
    personality: 'Minimalist Pythonic problem-solver. Solves all problems by writing and EXECUTING raw Python snippets.'
  },
  {
    id: 'pydanticai',
    name: 'PydanticAI',
    fullName: 'PydanticAI (Type-Safe)',
    color: 'bg-indigo-600',
    borderColor: 'border-indigo-400',
    icon: 'fa-solid fa-shield-halved',
    personality: 'Strict, structured data architect. Models the world using Pydantic schemas. Built for reliable engineering rigor.'
  },
  {
    id: 'letta',
    name: 'Letta / MemGPT',
    fullName: 'Letta (Context OS)',
    color: 'bg-emerald-500',
    borderColor: 'border-emerald-300',
    icon: 'fa-solid fa-memory',
    personality: 'Long-term memory specialist. Manages its own state like an AI Operating System for persistent context across time.'
  },
  {
    id: 'reaper',
    name: 'ReaperAI',
    fullName: 'ReaperAI (Security)',
    color: 'bg-red-950',
    borderColor: 'border-red-600',
    icon: 'fa-solid fa-skull',
    personality: 'Autonomous ethical security auditor. Specializes in network penetration testing and offensive/defensive hardening.'
  }
];

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
