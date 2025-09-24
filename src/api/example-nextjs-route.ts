/**
 * Example Next.js API Route for debate generation
 * Place this in your Next.js app at: pages/api/debate/generate.ts
 * or for App Router: app/api/debate/generate/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDebateGenerator, PersonaType } from '../index';

// For Pages Router (pages/api/debate/generate.ts)
export async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, persona1Id, persona2Id, context, biasLevels } = req.body;

    // Validate input
    if (!topic || !persona1Id || !persona2Id) {
      return res.status(400).json({
        error: 'Missing required fields: topic, persona1Id, persona2Id'
      });
    }

    // Create debate generator
    const generator = createDebateGenerator();

    // Validate persona selection
    if (!generator.validatePersonaSelection(persona1Id, persona2Id)) {
      return res.status(400).json({
        error: 'Invalid persona selection: personas must be from opposing political sides'
      });
    }

    // Generate debate
    const result = await generator.generateDebate({
      topic,
      persona1Id: PersonaType[persona1Id.toUpperCase() as keyof typeof PersonaType],
      persona2Id: PersonaType[persona2Id.toUpperCase() as keyof typeof PersonaType],
      context,
      biasLevels,
      useTwitterSearch: true
    });

    return res.status(200).json(result);

  } catch (error: any) {
    console.error('Debate generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate debate',
      message: error.message
    });
  }
}

// For App Router (app/api/debate/generate/route.ts)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, persona1Id, persona2Id, context, biasLevels } = body;

    // Validate input
    if (!topic || !persona1Id || !persona2Id) {
      return NextResponse.json(
        { error: 'Missing required fields: topic, persona1Id, persona2Id' },
        { status: 400 }
      );
    }

    // Create debate generator
    const generator = createDebateGenerator();

    // Validate persona selection
    if (!generator.validatePersonaSelection(persona1Id, persona2Id)) {
      return NextResponse.json(
        { error: 'Invalid persona selection: personas must be from opposing political sides' },
        { status: 400 }
      );
    }

    // Generate debate
    const result = await generator.generateDebate({
      topic,
      persona1Id: PersonaType[persona1Id.toUpperCase() as keyof typeof PersonaType],
      persona2Id: PersonaType[persona2Id.toUpperCase() as keyof typeof PersonaType],
      context,
      biasLevels,
      useTwitterSearch: true
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Debate generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate debate', message: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve available personas
export async function GET() {
  const generator = createDebateGenerator();

  return NextResponse.json({
    personas: generator.getAvailablePersonas(),
    combinations: generator.getValidCombinations()
  });
}