
export type AgentId = string;

export interface Agent {
  id: AgentId;
  name: string;
  fullName: string;
  color: string;
  borderColor: string;
  icon: string;
  personality: string;
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

export interface MeetingMessage {
  id: string;
  agentId: AgentId;
  content: string;
  timestamp: number;
  blindRating?: number;
  neuralState?: NeuralState;
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
  creatorInsights?: CreatorInsights;
}

export interface DebateTurn {
  agentId: AgentId;
  thought: string;
  blindRating?: number;
  neuralState: NeuralState;
}

export interface DebateResponse {
  discussion: DebateTurn[];
  finalConsensus: string;
  creatorInsights: CreatorInsights;
}
