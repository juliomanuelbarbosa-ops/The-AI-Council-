
export type AgentId = string;

export interface Agent {
  id: AgentId;
  name: string;
  fullName: string;
  color: string;
  borderColor: string;
  icon: string;
  personality: string;
  avatarUrl?: string; // High-res 3D portrait URL
}

export interface NeuralState {
  speaker_id: string;
  target_id: string;
  sentiment_hex: string;
  intensity: number;
  connection_type: 'attack' | 'agree' | 'query';
  status_text: string;
  memory_link_text?: string;
}

export interface FileAttachment {
  inlineData: {
    data: string;
    mimeType: string;
  };
  name: string;
  url: string;
}

export interface GroundingMetadata {
  searchEntryPoint?: { renderedContent?: string };
  groundingChunks?: Array<{
    web?: { uri: string; title: string };
    maps?: { uri: string; title: string; placeId?: string };
  }>;
}

export interface TorrentResult {
  fileName: string;
  size: string;
  healthScore: number; // 1-10
  safetyStatus: 'VERIFIED' | 'SUSPICIOUS' | 'DANGEROUS';
  magnetLink: string;
  sourceNode: string;
}

export interface MeetingMessage {
  id: string;
  agentId: AgentId;
  content: string;
  timestamp: number;
  blindRating?: number;
  neuralState?: NeuralState;
  groundingMetadata?: GroundingMetadata;
  audioUrl?: string; // For TTS
  torrentResults?: TorrentResult[];
}

export interface CreatorInsights {
  observations: string[];
  suggestedImprovements: string[];
  codeSnippets?: string[];
  rawReport: string;
}

export interface BrainstormingSession {
  topic: string;
  messages: MeetingMessage[];
  consensus?: string;
  status: 'idle' | 'preparing' | 'debating' | 'concluding' | 'finished' | 'error';
  errorMessage?: string;
  attachments?: FileAttachment[];
  visuals?: string[];
  generatedVideos?: string[]; // Veo videos
  creatorInsights?: CreatorInsights;
  totalTurns?: number;
}

export interface DebateTurn {
  agentId: AgentId;
  thought: string;
  blindRating?: number;
  neuralState: NeuralState;
  torrentResults?: TorrentResult[];
}

export interface DebateResponse {
  discussion: DebateTurn[];
  finalConsensus: string;
  creatorInsights: CreatorInsights;
  groundingMetadata?: GroundingMetadata;
}
