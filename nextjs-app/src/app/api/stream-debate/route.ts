import { NextRequest } from 'next/server';
import { DebateGenerator } from '@/lib/debate-generator';
import GrokClient from '@/lib/grok-client';
import { PersonaType } from '@/types/personas';

export async function POST(request: NextRequest) {
  const { topic, persona1Id, persona2Id, context, useTwitterSearch = true, biasLevels } = await request.json();

  if (!topic || !persona1Id || !persona2Id) {
    return new Response('Missing required fields', { status: 400 });
  }

  // Initialize Grok client with API key from environment
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return new Response('XAI API key not configured', { status: 500 });
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
    return new Response('Invalid persona combination', { status: 400 });
  }

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        // Send initial status
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'status',
            message: 'Starting debate generation...',
            progress: 0
          })}\n\n`)
        );

        // Generate the debate
        const debateResult = await debateGenerator.generateDebate({
          topic,
          persona1Id: PersonaType[persona1Id.toUpperCase() as keyof typeof PersonaType],
          persona2Id: PersonaType[persona2Id.toUpperCase() as keyof typeof PersonaType],
          context,
          useTwitterSearch,
          biasLevels
        });

        // Stream the first perspective
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'perspective',
            perspectiveType: 'persona1',
            data: debateResult.personas.persona1,
            progress: 50
          })}\n\n`)
        );

        // Stream the second perspective
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'perspective',
            perspectiveType: 'persona2',
            data: debateResult.personas.persona2,
            progress: 100
          })}\n\n`)
        );

        // Send final complete message
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'complete',
            debateResult,
            message: 'Debate generation completed successfully!'
          })}\n\n`)
        );

        controller.close();

      } catch (error) {
        console.error('Streaming debate generation error:', error);

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            error: 'Failed to generate debate',
            details: error instanceof Error ? error.message : 'Unknown error'
          })}\n\n`)
        );

        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}