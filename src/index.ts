/**
 * XAI Debate Generator - TypeScript Edition
 * Main entry point and exports
 */

// Export all types
export * from './types/personas';

// Export core modules
export { PersonaRegistry, personaRegistry } from './lib/persona-registry';
export { default as GrokClient, createGrokClient } from './lib/grok-client';
export { default as DebateGenerator } from './lib/debate-generator';
export { default as VoiceEnhancer } from './lib/voice-enhancer';

// Re-export commonly used items for convenience
export { PersonaType, PoliticalLeaning, ExpertiseLevel } from './types/personas';

// Export a convenience function to create a fully configured debate generator
import GrokClient from './lib/grok-client';
import DebateGenerator from './lib/debate-generator';

export function createDebateGenerator(apiKey?: string): DebateGenerator {
  const grokClient = new GrokClient({
    apiKey: apiKey || process.env.XAI_API_KEY || process.env.NEXT_PUBLIC_XAI_API_KEY || ''
  });

  return new DebateGenerator(grokClient);
}

// Export default configuration
export const defaultConfig = {
  models: {
    standard: 'grok-4-fast',
    reasoning: 'grok-4-fast-reasoning'
  },
  pricing: {
    inputTokensPerMillion: 0.20,
    outputTokensPerMillion: 0.50,
    searchPerSource: 0.025
  },
  limits: {
    maxTokens: 2000,
    timeout: 60000,
    maxRetries: 3
  }
};