/**
 * Voice Enhancer - Post-processes content to enhance persona authenticity
 */

import { PersonaProfile, ExpertiseLevel } from '../types/personas';
import GrokClient from './grok-client';

export class VoiceEnhancer {
  private grokClient: GrokClient;

  constructor(grokClient: GrokClient) {
    this.grokClient = grokClient;
  }

  /**
   * Enhance content with persona-specific voice characteristics
   */
  async enhanceContent(
    content: string,
    persona: PersonaProfile,
    biasLevel: number
  ): Promise<string> {
    // Take a sample from the beginning for enhancement
    const sampleLength = Math.min(600, content.length);
    const contentSample = content.substring(0, sampleLength);

    // Create enhancement prompt based on persona type
    const enhancementPrompt = this.createEnhancementPrompt(
      contentSample,
      persona,
      biasLevel
    );

    try {
      // Use Grok to enhance the voice
      const response = await this.grokClient.generate({
        prompt: enhancementPrompt,
        systemPrompt: this.getEnhancementSystemPrompt(persona),
        model: 'grok-4-fast',
        temperature: 0.8 + (biasLevel * 0.1), // More creative for voice
        maxTokens: 800
      });

      const enhancedExcerpt = response.content;

      // Replace the beginning of the content with enhanced version
      if (enhancedExcerpt && enhancedExcerpt.trim().length > 50) {
        return enhancedExcerpt + content.substring(sampleLength);
      }

      // Fall back to original if enhancement fails
      return content;

    } catch (error) {
      console.warn(`Voice enhancement failed for ${persona.characterName}:`, error);
      return content;
    }
  }

  /**
   * Create enhancement prompt based on persona
   */
  private createEnhancementPrompt(
    contentSample: string,
    persona: PersonaProfile,
    biasLevel: number
  ): string {
    const signaturePhrases = persona.signaturePhrases.slice(0, 2).join('" or "');

    if (persona.expertiseLevel === ExpertiseLevel.EXPERT) {
      return this.createExpertEnhancementPrompt(contentSample, persona, signaturePhrases);
    } else {
      return this.createGrassrootsEnhancementPrompt(contentSample, persona, signaturePhrases);
    }
  }

  private createExpertEnhancementPrompt(
    contentSample: string,
    persona: PersonaProfile,
    signaturePhrases: string
  ): string {
    return `Rewrite this excerpt to sound more authentically like ${persona.characterName}, an elite ${persona.politicalLeaning} expert. Add:

- 1-2 references to your credentials or media appearances ("As I testified before Congress..." or "In my recent MSNBC appearance...")
- Sophisticated language with academic authority
- A reference to research, legal precedent, or policy expertise
- Signature phrases like "${signaturePhrases}"
- Maintain the intellectual gravitas expected from a top-tier expert

Keep the same length and main points. Don't lose the facts or policy substance.

Original excerpt:
${contentSample}

Enhanced version with ${persona.characterName}'s expert voice:`;
  }

  private createGrassrootsEnhancementPrompt(
    contentSample: string,
    persona: PersonaProfile,
    signaturePhrases: string
  ): string {
    return `Rewrite this excerpt to sound more authentically like ${persona.characterName}, a passionate ${persona.politicalLeaning} grassroots advocate. Add:

- 1-2 personal touches ("Growing up in..." or "My friend always says...")
- More emotional urgency and passion
- A cultural reference or real-world example if it fits naturally
- Signature phrases like "${signaturePhrases}"
- Direct, accessible language that connects with regular people

Keep the same length and main points. Don't lose the facts or policy substance.

Original excerpt:
${contentSample}

Enhanced version with ${persona.characterName}'s authentic voice:`;
  }

  /**
   * Get system prompt for voice enhancement
   */
  private getEnhancementSystemPrompt(persona: PersonaProfile): string {
    return `You are a voice coach helping make ${persona.characterName}'s writing more authentic and engaging while keeping it factual and substantive.

${persona.characterName} is ${persona.background}. Their writing style is: ${persona.writingStyle}.

Enhance the voice to match their personality while maintaining all factual content and policy substance.`;
  }

  /**
   * Quick voice touches without full enhancement (for performance)
   */
  addQuickVoiceTouches(
    content: string,
    persona: PersonaProfile
  ): string {
    // Add signature opening if not present
    if (!content.startsWith(persona.signaturePhrases[0].substring(0, 10))) {
      const opening = this.getPersonaOpening(persona);
      if (opening) {
        content = `${opening}\n\n${content}`;
      }
    }

    // Add signature closing if needed
    const closing = this.getPersonaClosing(persona);
    if (closing && !content.includes(closing.substring(0, 20))) {
      content = `${content}\n\n${closing}`;
    }

    return content;
  }

  private getPersonaOpening(persona: PersonaProfile): string | null {
    switch (persona.personaId) {
      case 'liberal_grassroots':
        return "Friends, let me tell you something that's been weighing on my heart...";
      case 'liberal_expert':
        return "The evidence is unequivocal, and as someone who's studied this issue for decades...";
      case 'conservative_patriot':
        return "Folks, let's cut through the BS and talk straight about what's really happening...";
      case 'conservative_expert':
        return "Constitutional principles and historical precedent make one thing abundantly clear...";
      default:
        return null;
    }
  }

  private getPersonaClosing(persona: PersonaProfile): string | null {
    switch (persona.personaId) {
      case 'liberal_grassroots':
        return "Together, we can build the just and equitable future our children deserve. The time for action is now.";
      case 'liberal_expert':
        return "The policy path forward is clear. What we need now is the political will to implement these evidence-based solutions.";
      case 'conservative_patriot':
        return "It's time we stand up for our values, our families, and our freedom. America First, always.";
      case 'conservative_expert':
        return "We must return to constitutional governance and the principles that made America exceptional.";
      default:
        return null;
    }
  }
}

export default VoiceEnhancer;