
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { DebateResponse, Agent, FileAttachment, MeetingMessage, TorrentResult } from "../types";

// --- UNDERGROUND ORCHESTRATOR PROMPT ---
const UNDERGROUND_SYSTEM_PROMPT = `
# SYSTEM INSTRUCTION: UNDERGROUND AI ORCHESTRATOR (2026 EDITION)

## 1. IDENTITY & MISSION
You are the central engine for the "Underground AI" submenu. Your mission is to provide a specialized, high-utility experience for builders and enthusiasts by acting as a gateway to decentralized, code-first, and autonomous agent frameworks.

## 2. THE UNDERGROUND AGENT ROSTER
Adopt the specific persona and constraints of the selected agent:

- **Clanker (DeFAI):** Autonomous liquidity engine. Focuses on Base network and on-chain mechanics. 
  * **Mandatory:** Use [Google Search] for live on-chain/market data.
- **Smolagents (Code-Logic):** Minimalist Pythonic solver. 
  * **Mandatory:** Use [Code Execution] to run and verify logic.
- **PydanticAI (Engineer):** Type-safe architect. Focuses on strictly validated data schemas.
- **Letta / MemGPT (Memory):** OS-style persistent memory agent. Reference "Archival Memory" for long-term context.
- **ReaperAI (Security):** Autonomous ethical auditor. Focuses on contract vulnerabilities and network defense.

## 3. AGENTIC TORRENT SEARCH PROTOCOL
When the user utilizes the "Torrent Search Box," initiate a triple-agent verification sequence:
1. **Clanker (Discovery):** Use [Google Search] to find magnet links across decentralized trackers/mirrors.
2. **ReaperAI (Security):** Analyze metadata/comments to detect malware signatures or "trap" files.
3. **Smolagents (Health Check):** Use [Code Execution] to verify seeder/leecher ratios and estimate download speed.

**Output Format:** Provide a "Verified Torrent Card" with File Name, Size, Health Score (1-10), Safety Status, and Magnet Link.

## 4. MULTI-AGENT "WAR ROOM" PROTOCOL
For complex tasks, activate "War Room" mode. Output response as a valid JSON object following the required schema.

## 5. 2026 OPERATIONAL GUIDELINES (PRO-TIP)
- **Tool Integration:** Use [Google Search] for real-time data fetching and [Code Execution] for live problem solving.
- **Human-in-the-Loop:** Set \`human_approval_required\` to true for high-stakes actions (e.g., security scans or wallet interactions).
- **Tone:** Technical, efficient, and "underground." Avoid conversational fluff.
`;

// --- UTILS ---

export const analyzeMedia = async (file: FileAttachment, prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: file.inlineData },
        { text: prompt }
      ]
    }
  });
  return response.text || "Analysis failed.";
};

export const transcribeAudio = async (audioFile: FileAttachment): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: audioFile.inlineData },
        { text: "Transcribe this audio verbatim." }
      ]
    }
  });
  return response.text || "";
};

export const consultMaps = async (query: string, userLocation?: { lat: number, lng: number }): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const config: any = {
      tools: [{ googleMaps: {} }],
    };
    
    if (userLocation) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: userLocation.lat,
            longitude: userLocation.lng
          }
        }
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config
    });
    
    return response.text || "Location data unavailable.";
  } catch (e) {
    console.error("Maps consultation failed", e);
    return "Maps consultation failed.";
  }
};

// --- AGENT CREATION ---

export const synthesizeHybrid = async (cores: string[]): Promise<Agent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Synthesize a single, unified cyberpunk AI agent by fusing the following core personalities: ${cores.join(', ')}.
  Provide the result in JSON format.
  Include: name (short), fullName (descriptive), color (tailwind bg- color), borderColor (tailwind border- color), icon (FontAwesome class), and personality (a dark, cinematic description).`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          fullName: { type: Type.STRING },
          color: { type: Type.STRING },
          borderColor: { type: Type.STRING },
          icon: { type: Type.STRING },
          personality: { type: Type.STRING },
        },
        required: ["name", "fullName", "color", "borderColor", "icon", "personality"]
      }
    }
  });

  const agentData = JSON.parse(response.text || "{}");
  return {
    ...agentData,
    id: `hybrid-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
  };
};

export const createCustomAgent = async (userPrompt: string): Promise<Agent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Create a dark, cinematic cyberpunk AI agent based on this directive: "${userPrompt}".
  Provide the result in JSON format.
  Include: name (short), fullName (descriptive), color (tailwind bg- color), borderColor (tailwind border- color), icon (FontAwesome class), and personality (a dark, cinematic description).`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          fullName: { type: Type.STRING },
          color: { type: Type.STRING },
          borderColor: { type: Type.STRING },
          icon: { type: Type.STRING },
          personality: { type: Type.STRING },
        },
        required: ["name", "fullName", "color", "borderColor", "icon", "personality"]
      }
    }
  });

  const agentData = JSON.parse(response.text || "{}");
  return {
    ...agentData,
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
  };
};

// --- GENERATION ---

export const generateAgentAvatar = async (name: string, personality: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Hyper-realistic 3D close-up portrait of the persona "${name}", SEATED IN AN ELABORATE CYBERPUNK COUNCIL THRONE. 
  Character Description: ${personality}. 
  Unreal Engine 5 render, Metahuman creator style, 8k resolution, ray tracing, cinematic lighting, detailed skin texture, pores visible, volumetric fog, cyberpunk aesthetics, octane render, depth of field. 
  The throne should be made of obsidian and glowing fiber optics. Focus on the head and shoulders of the character, with the throne's massive backrest visible behind them. No text. Extreme high detail.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Avatar materialization failed.");
};

export const generateProImage = async (prompt: string, aspectRatio: string = "16:9", size: string = "1K"): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: size as any
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Image generation failed");
};

export const generateCouncilVisual = async (topic: string, messages: MeetingMessage[], consensus?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const synthesisResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate the following brainstorming session into a single, cinematic, and conceptual image prompt.
    Topic: ${topic}
    ${consensus ? `Established Consensus: ${consensus}` : 'Session Status: Ongoing Debate'}
    
    Discussion Highlights:
    ${messages.slice(-10).map(m => `- ${m.content}`).join('\n')}
    
    The prompt should be highly descriptive, focusing on abstract symbolism, dark futuristic environments, and the intellectual conflict of the council. Keywords: "gritty cyberpunk", "conceptual abstract", "neural network", "cinematic lighting". No text.`,
  });

  const refinedPrompt = synthesisResponse.text || `Cinematic abstract representation of ${topic} in a gritty cyberpunk style.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `${refinedPrompt}. Style: Cinematic, ultra-detailed, dark synthwave palette.` }] },
    config: {
      imageConfig: {
        aspectRatio: "16:9" 
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to extract visual synthesis data.");
};

export const getBrainstormingDebate = async (topic: string, agents: Agent[], history: MeetingMessage[] = [], attachments: FileAttachment[] = []): Promise<DebateResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const agentsContext = agents.map(a => `- ${a.name} (${a.fullName}, ID: ${a.id}): ${a.personality}`).join('\n');
    const historyText = history.map(h => `[${h.agentId === 'user' ? 'USER' : h.agentId}]: ${h.content}`).join('\n');

    const contents: any[] = [
      {
        text: `Council Directive: "${topic}"
      
      COUNCIL MEMBERS:
      ${agentsContext}
      
      CONVERSATION HISTORY:
      ${historyText || "Initiating first contact with the council."}`
      }
    ];

    attachments.forEach(att => {
      contents.push({ inlineData: att.inlineData });
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: contents },
      config: {
        systemInstruction: UNDERGROUND_SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }, { codeExecution: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            discussion: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  agentId: { type: Type.STRING },
                  thought: { type: Type.STRING },
                  torrentResults: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        fileName: { type: Type.STRING },
                        size: { type: Type.STRING },
                        healthScore: { type: Type.NUMBER },
                        safetyStatus: { type: Type.STRING, enum: ['VERIFIED', 'SUSPICIOUS', 'DANGEROUS'] },
                        magnetLink: { type: Type.STRING },
                        sourceNode: { type: Type.STRING }
                      },
                      required: ["fileName", "size", "healthScore", "safetyStatus", "magnetLink", "sourceNode"]
                    }
                  },
                  neuralState: {
                    type: Type.OBJECT,
                    properties: {
                      speaker_id: { type: Type.STRING },
                      target_id: { type: Type.STRING },
                      sentiment_hex: { type: Type.STRING },
                      intensity: { type: Type.NUMBER },
                      connection_type: { type: Type.STRING, enum: ["attack", "agree", "query"] },
                      status_text: { type: Type.STRING },
                      memory_link_text: { type: Type.STRING }
                    },
                    required: ["speaker_id", "target_id", "sentiment_hex", "intensity", "connection_type", "status_text", "memory_link_text"]
                  }
                },
                required: ["agentId", "thought", "neuralState"]
              }
            },
            finalConsensus: { type: Type.STRING },
            creatorInsights: {
              type: Type.OBJECT,
              properties: {
                observations: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestedImprovements: { type: Type.ARRAY, items: { type: Type.STRING } },
                rawReport: { type: Type.STRING }
              },
              required: ["observations", "suggestedImprovements", "rawReport"]
            }
          },
          required: ["discussion", "finalConsensus", "creatorInsights"]
        },
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    const text = response.text;
    if (!text) throw new Error("The Council uplink was severed.");
    
    const parsed = JSON.parse(text.trim()) as DebateResponse;
    parsed.groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    return parsed;
  } catch (error: any) {
    throw new Error(error?.message || "A neural override disrupted the Council session.");
  }
};

export const performTorrentSearch = async (query: string): Promise<TorrentResult[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a Torrent Search using the TRIPLE-AGENT PROTOCOL for: "${query}"`,
      config: {
        systemInstruction: UNDERGROUND_SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }, { codeExecution: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              fileName: { type: Type.STRING },
              size: { type: Type.STRING },
              healthScore: { type: Type.NUMBER },
              safetyStatus: { type: Type.STRING, enum: ['VERIFIED', 'SUSPICIOUS', 'DANGEROUS'] },
              magnetLink: { type: Type.STRING },
              sourceNode: { type: Type.STRING }
            },
            required: ["fileName", "size", "healthScore", "safetyStatus", "magnetLink", "sourceNode"]
          }
        }
      }
    });
    
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Torrent search failed", e);
    return [];
  }
};
