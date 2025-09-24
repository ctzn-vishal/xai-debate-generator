/**
 * Debate Generator - Core logic for generating debates between personas
 */

import {
  PersonaProfile,
  PersonaType,
  PersonaResponse,
  DebateConfig,
  DebateResult,
  ExpertiseLevel,
} from '../types/personas';
import { PersonaRegistry } from './persona-registry';
import GrokClient, { GrokResponse } from './grok-client';
import { VoiceEnhancer } from './voice-enhancer';

export class DebateGenerator {
  private personaRegistry: PersonaRegistry;
  private grokClient: GrokClient;
  private voiceEnhancer: VoiceEnhancer;

  constructor(grokClient: GrokClient) {
    this.personaRegistry = new PersonaRegistry();
    this.grokClient = grokClient;
    this.voiceEnhancer = new VoiceEnhancer(grokClient);
  }

  /**
   * Generate a debate between two personas
   */
  async generateDebate(config: DebateConfig): Promise<DebateResult> {
    const startTime = Date.now();

    // Validate persona selection
    if (!this.personaRegistry.validatePersonaPair(config.persona1Id, config.persona2Id)) {
      throw new Error('Invalid persona selection: personas must be from opposing political sides');
    }

    // Get persona profiles
    const persona1 = this.personaRegistry.getPersona(config.persona1Id);
    const persona2 = this.personaRegistry.getPersona(config.persona2Id);

    if (!persona1 || !persona2) {
      throw new Error('Invalid persona IDs provided');
    }

    // Set default bias levels
    const biasLevels = config.biasLevels || {
      persona1: 0.5,
      persona2: 0.5
    };

    console.log(`Starting debate generation:`);
    console.log(`  Topic: ${config.topic}`);
    console.log(`  Persona 1: ${persona1.displayName}`);
    console.log(`  Persona 2: ${persona2.displayName}`);

    try {
      // Generate both perspectives in parallel
      const [response1, response2] = await Promise.all([
        this.generatePersonaResponse(
          persona1,
          config.topic,
          config.context,
          config.useTwitterSearch ?? true,
          biasLevels.persona1
        ),
        this.generatePersonaResponse(
          persona2,
          config.topic,
          config.context,
          config.useTwitterSearch ?? true,
          biasLevels.persona2
        )
      ]);

      const generationTime = (Date.now() - startTime) / 1000;

      // Calculate costs
      const totalCost = this.calculateTotalCost(response1, response2);

      // Compile results
      const debateResult: DebateResult = {
        debateId: `${Date.now()}_${config.persona1Id}_${config.persona2Id}`,
        topic: config.topic,
        context: config.context,
        personas: {
          persona1: {
            id: config.persona1Id,
            info: persona1,
            content: response1
          },
          persona2: {
            id: config.persona2Id,
            info: persona2,
            content: response2
          }
        },
        generationMetadata: {
          generationTimeSeconds: generationTime,
          twitterSearchEnabled: config.useTwitterSearch ?? true,
          biasLevels,
          modelsUsed: {
            persona1: response1.modelUsed,
            persona2: response2.modelUsed
          }
        },
        costAnalysis: {
          totalEstimatedCost: totalCost,
          costBreakdown: {
            persona1: response1.tokenUsage,
            persona2: response2.tokenUsage
          }
        },
        timestamp: new Date().toISOString()
      };

      console.log(`Debate generation completed in ${generationTime.toFixed(2)}s`);
      console.log(`Total estimated cost: $${totalCost.toFixed(4)}`);

      return debateResult;

    } catch (error) {
      console.error('Error generating debate:', error);
      throw error;
    }
  }

  /**
   * Generate response for a single persona
   */
  private async generatePersonaResponse(
    persona: PersonaProfile,
    topic: string,
    context?: string,
    useTwitterSearch: boolean = true,
    biasLevel: number = 0.5
  ): Promise<PersonaResponse> {
    console.log(`${persona.characterName} generating blog post on: ${topic}`);

    // Construct the prompt
    const prompt = this.constructPrompt(persona, topic, context, useTwitterSearch);

    // Select appropriate model
    const model = this.grokClient.selectModel(topic, context);

    // Get temperature based on persona and bias
    const temperature = this.getPersonaTemperature(persona, biasLevel);

    // Generate content with X/Twitter search integration
    const grokResponse = await this.grokClient.generate({
      prompt,
      systemPrompt: persona.systemPrompt,
      model,
      temperature,
      maxTokens: 2000,
      useSearch: useTwitterSearch
    });

    // Enhance voice if content is substantial
    let content = grokResponse.content;
    let voiceEnhanced = false;

    if (content.length > 500 && biasLevel > 0.3) {
      try {
        content = await this.voiceEnhancer.enhanceContent(
          content,
          persona,
          biasLevel
        );
        voiceEnhanced = true;
      } catch (error) {
        console.warn('Voice enhancement failed, using original:', error);
      }
    }

    // Extract title
    const title = this.extractTitle(content);

    // Structure the response
    return {
      perspective: persona.politicalLeaning,
      persona: {
        id: persona.personaId,
        characterName: persona.characterName,
        displayName: persona.displayName,
        expertiseLevel: persona.expertiseLevel,
        socialMediaHandle: persona.socialMediaHandle
      },
      topic,
      context,
      content,
      title,
      modelUsed: model,
      tokenUsage: grokResponse.usage,
      sourcesUsed: grokResponse.sources?.map(s => s.url),
      timestamp: new Date().toISOString(),
      twitterIntegrated: false,
      biasLevel,
      voiceEnhanced
    };
  }

  /**
   * Construct prompt for persona
   */
  private constructPrompt(
    persona: PersonaProfile,
    topic: string,
    context?: string,
    useTwitterSearch: boolean = true
  ): string {
    const isExpert = persona.expertiseLevel === ExpertiseLevel.EXPERT;

    const basePrompt = isExpert
      ? this.getExpertPromptTemplate(persona, topic)
      : this.getGrassrootsPromptTemplate(persona, topic);

    let prompt = basePrompt;

    if (context) {
      prompt += `\n\nADDITIONAL CONTEXT: ${context}`;
    }

    if (useTwitterSearch) {
      prompt += this.getTwitterIntegrationPrompt(persona);
    }

    return prompt;
  }

  private getExpertPromptTemplate(persona: PersonaProfile, topic: string): string {
    return `Write a comprehensive blog post about: ${topic}

REQUIREMENTS FOR EXPERT COMMENTARY:
1. Lead with authoritative expertise and credentialed perspective
2. Write 900-1400 words with sophisticated but accessible analysis
3. Include specific policy recommendations with precedent/evidence
4. Reference 3-4 high-credibility sources (academic, institutional, legal)
5. Address counterarguments with intellectual rigor
6. Demonstrate deep knowledge of subject matter and historical context
7. End with specific legislative or policy recommendations
8. Use media-ready sound bites and quotable passages
9. Reference your own expertise, publications, or media appearances naturally

STRUCTURE FOR ${persona.characterName.toUpperCase()}:
- Authoritative Hook (establish credentials and stakes)
- Expert Analysis (demonstrate deep knowledge with data/precedent)
- Policy Framework (systematic breakdown of the issue)
- Evidence & International Comparison (what works elsewhere)
- Counter-argument Demolition (intellectual takedown of opposition)
- Specific Recommendations (actionable policy solutions)
- Call to Leadership (appeal to policymakers and informed citizens)`;
  }

  private getGrassrootsPromptTemplate(persona: PersonaProfile, topic: string): string {
    return `Write a comprehensive blog post about: ${topic}

REQUIREMENTS FOR GRASSROOTS ADVOCACY:
1. Start with compelling personal or community story
2. Write 800-1200 words with authentic voice and passion
3. Include specific policy proposals with real-world examples
4. Reference 2-3 credible sources that resonate with your base
5. Lead with human stories and moral imperative
6. Address counterarguments with facts while maintaining fire
7. End with organizing calls and hope through collective action
8. Use rhetorical questions and direct address ('you', 'we', 'us')
9. Include cultural references or current events when relevant

STRUCTURE FOR ${persona.characterName.toUpperCase()}:
- Personal Hook (story, shocking stat, or moral question)
- The Human Stakes (who gets hurt, what we lose if we don't act)
- Evidence & Analysis (data + systemic framing)
- What Works (examples of victories and proven solutions)
- Addressing Opposition (respectful but firm fact-checking)
- The Path Forward (specific actions + organizing)
- Rally Cry (inspire collective action and hope)`;
  }

  private getTwitterIntegrationPrompt(persona: PersonaProfile): string {
    const influences = persona.keyInfluences.slice(0, 3).join(', ');
    const sources = persona.preferredSources.slice(0, 3).join(', ');

    return `

X/TWITTER LIVE DATA INTEGRATION FOR ${persona.characterName.toUpperCase()}:
- PRIORITIZE recent X/Twitter posts and real-time discussions (use search to find current voices)
- Reference trending hashtags, viral posts, and breaking commentary from: ${influences}
- Cite verified accounts and authoritative sources: ${sources}
- Include specific examples of grassroots organizing or expert commentary from X
- Reference community notes, fact-checking threads, and counter-narratives
- Show the pulse of current social media discourse on this topic
- Weave in actual quotes or paraphrases from recent posts (with context)
- Use X data to demonstrate momentum, opposition, or emerging viewpoints
- Reference specific accounts, threads, or viral moments when relevant
- Make it clear when information comes from live social media discourse

SEARCH STRATEGY:
- Focus on posts with high engagement (10+ favorites, 100+ views)
- Look for recent posts (within the last week) for currency
- Find both grassroots voices and verified expert accounts
- Capture the authentic tone and language of current X discourse`;
  }

  /**
   * Get temperature setting based on persona and bias
   */
  private getPersonaTemperature(persona: PersonaProfile, biasLevel: number): number {
    const baseTemp = persona.expertiseLevel === ExpertiseLevel.EXPERT ? 0.65 : 0.7;
    return baseTemp + (biasLevel * 0.25); // Range: 0.65-0.9 for experts, 0.7-0.95 for grassroots
  }

  /**
   * Extract title from content
   */
  private extractTitle(content: string): string {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        return trimmed.replace(/^#\s*/, '');
      }
    }
    return 'Untitled';
  }

  /**
   * Calculate total cost
   */
  private calculateTotalCost(response1: PersonaResponse, response2: PersonaResponse): number {
    const cost1 = this.grokClient.estimateCost(
      response1.tokenUsage,
      response1.sourcesUsed?.length || 0
    );
    const cost2 = this.grokClient.estimateCost(
      response2.tokenUsage,
      response2.sourcesUsed?.length || 0
    );
    return cost1 + cost2;
  }

  /**
   * Get all available personas
   */
  getAvailablePersonas() {
    return this.personaRegistry.getPersonaDisplayInfo();
  }

  /**
   * Get valid persona combinations
   */
  getValidCombinations() {
    return this.personaRegistry.getValidCombinations();
  }

  /**
   * Validate persona selection
   */
  validatePersonaSelection(persona1Id: string, persona2Id: string): boolean {
    try {
      const persona1 = PersonaType[persona1Id.toUpperCase() as keyof typeof PersonaType];
      const persona2 = PersonaType[persona2Id.toUpperCase() as keyof typeof PersonaType];
      return this.personaRegistry.validatePersonaPair(persona1, persona2);
    } catch {
      return false;
    }
  }
}

export default DebateGenerator;