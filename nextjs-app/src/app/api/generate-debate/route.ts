import { NextRequest, NextResponse } from 'next/server';
import { DebateGenerator } from '@/lib/debate-generator';
import GrokClient from '@/lib/grok-client';
import { PersonaType } from '@/types/personas';

export async function POST(request: NextRequest) {
  try {
    const { topic, persona1Id, persona2Id, context, useTwitterSearch = true, biasLevels } = await request.json();

    if (!topic || !persona1Id || !persona2Id) {
      return NextResponse.json(
        { error: 'Missing required fields: topic, persona1Id, persona2Id' },
        { status: 400 }
      );
    }

    // Initialize Grok client with API key from environment
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'XAI API key not configured' },
        { status: 500 }
      );
    }

    const grokClient = new GrokClient({
      apiKey,
      baseUrl: process.env.XAI_BASE_URL || 'https://api.x.ai/v1',
      timeout: 60000,
      maxRetries: 3
    });

    // Initialize debate generator
    const debateGenerator = new DebateGenerator(grokClient);

    // Validate persona selection
    if (!debateGenerator.validatePersonaSelection(persona1Id, persona2Id)) {
      return NextResponse.json(
        { error: 'Invalid persona combination. Personas must be from opposing political sides.' },
        { status: 400 }
      );
    }

    // Generate the debate
    const debateResult = await debateGenerator.generateDebate({
      topic,
      persona1Id: PersonaType[persona1Id.toUpperCase() as keyof typeof PersonaType],
      persona2Id: PersonaType[persona2Id.toUpperCase() as keyof typeof PersonaType],
      context,
      useTwitterSearch,
      biasLevels
    });

    return NextResponse.json(debateResult);

  } catch (error) {
    console.error('Debate generation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate debate',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}