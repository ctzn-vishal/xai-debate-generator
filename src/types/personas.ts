/**
 * Type definitions for the debate persona system
 */

export enum PersonaType {
  LIBERAL_GRASSROOTS = "liberal_grassroots",
  LIBERAL_EXPERT = "liberal_expert",
  CONSERVATIVE_PATRIOT = "conservative_patriot",
  CONSERVATIVE_EXPERT = "conservative_expert",
}

export enum PoliticalLeaning {
  LIBERAL = "liberal",
  CONSERVATIVE = "conservative",
}

export enum ExpertiseLevel {
  GRASSROOTS = "grassroots",
  EXPERT = "expert",
}

export interface PersonaProfile {
  personaId: string;
  displayName: string;
  description: string;
  politicalLeaning: PoliticalLeaning;
  expertiseLevel: ExpertiseLevel;
  characterName: string;
  background: string;
  writingStyle: string;
  keyInfluences: string[];
  signaturePhrases: string[];
  preferredSources: string[];
  socialMediaHandle: string;
  systemPrompt?: string;
}

export interface PersonaVoiceConfig {
  temperature: number;
  biasLevel: number;
  enhancementEnabled: boolean;
  modelPreference: "reasoning" | "standard" | "auto";
}

export interface DebateConfig {
  topic: string;
  persona1Id: PersonaType;
  persona2Id: PersonaType;
  context?: string;
  useTwitterSearch?: boolean;
  biasLevels?: {
    persona1: number;
    persona2: number;
  };
}

export interface PersonaResponse {
  perspective: PoliticalLeaning;
  persona: {
    id: string;
    characterName: string;
    displayName: string;
    expertiseLevel: string;
    socialMediaHandle: string;
  };
  topic: string;
  context?: string;
  content: string;
  title: string;
  modelUsed: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  sourcesUsed?: string[];
  timestamp: string;
  twitterIntegrated: boolean;
  biasLevel: number;
  voiceEnhanced: boolean;
}

export interface DebateResult {
  debateId: string;
  topic: string;
  context?: string;
  personas: {
    persona1: {
      id: string;
      info: PersonaProfile;
      content: PersonaResponse;
    };
    persona2: {
      id: string;
      info: PersonaProfile;
      content: PersonaResponse;
    };
  };
  generationMetadata: {
    generationTimeSeconds: number;
    twitterSearchEnabled: boolean;
    biasLevels: {
      persona1: number;
      persona2: number;
    };
    modelsUsed: {
      persona1: string;
      persona2: string;
    };
  };
  costAnalysis?: {
    totalEstimatedCost: number;
    costBreakdown: {
      persona1: any;
      persona2: any;
    };
  };
  timestamp: string;
}

export interface PersonaCombination {
  id: string;
  displayName: string;
  persona1: PersonaProfile;
  persona2: PersonaProfile;
  politicalMatchup: string;
}