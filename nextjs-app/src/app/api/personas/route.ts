import { NextResponse } from 'next/server';
import { PersonaRegistry } from '@/lib/persona-registry';
import GrokClient from '@/lib/grok-client';
import { DebateGenerator } from '@/lib/debate-generator';

export async function GET() {
  try {
    // We need to initialize the debate generator to access persona methods
    // Using a dummy API key since we're only accessing persona metadata
    const grokClient = new GrokClient({
      apiKey: 'dummy',
    });

    const debateGenerator = new DebateGenerator(grokClient);

    const personas = debateGenerator.getAvailablePersonas();
    const combinations = debateGenerator.getValidCombinations();

    // Convert complex PersonaCombination objects to simple arrays of persona IDs
    const validCombinations = combinations.map(combo => [
      combo.persona1.personaId,
      combo.persona2.personaId
    ]);


    return NextResponse.json({
      personas,
      validCombinations
    });

  } catch (error) {
    console.error('Error fetching personas:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch personas',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}