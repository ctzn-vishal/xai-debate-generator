# XAI Debate Generator - TypeScript Edition

A TypeScript implementation of the multi-persona debate generation system using XAI's Grok 4 Fast API. Designed for seamless integration with Next.js and Vercel deployment.

## Features

- **4 Distinct Personas**: 2 liberal (grassroots + expert) and 2 conservative (grassroots + expert)
- **Type-Safe**: Full TypeScript with comprehensive type definitions
- **Next.js Ready**: Example API routes for both Pages and App Router
- **Voice Enhancement**: Post-processing for authentic persona voices
- **Parallel Generation**: Generate both sides of debate simultaneously
- **Cost Tracking**: Built-in token usage and cost estimation

## Installation

```bash
npm install
# or
yarn install
```

## Configuration

Create a `.env` file with your XAI API key:

```env
XAI_API_KEY=your_api_key_here
# or for Next.js
NEXT_PUBLIC_XAI_API_KEY=your_api_key_here
```

## Quick Start

```typescript
import { createDebateGenerator, PersonaType } from './src';

// Create generator instance
const generator = createDebateGenerator();

// Generate a debate
const result = await generator.generateDebate({
  topic: "AI regulation and Big Tech monopolies",
  persona1Id: PersonaType.LIBERAL_EXPERT,
  persona2Id: PersonaType.CONSERVATIVE_PATRIOT,
  biasLevels: {
    persona1: 0.7,
    persona2: 0.6
  }
});

console.log(`Generated in ${result.generationMetadata.generationTimeSeconds}s`);
console.log(`Cost: $${result.costAnalysis?.totalEstimatedCost}`);
```

## Available Personas

### Liberal
- **Alex Rivera** (`liberal_grassroots`) - Progressive activist and community organizer
- **Dr. Maya Chen** (`liberal_expert`) - Policy professor and MSNBC contributor

### Conservative
- **Jordan Hale** (`conservative_patriot`) - Veteran entrepreneur and podcast host
- **Michael Sterling** (`conservative_expert`) - Former federal judge and Fox News host

## Next.js Integration

### App Router (app/api/debate/generate/route.ts)

```typescript
import { createDebateGenerator, PersonaType } from 'xai-debate-generator';

export async function POST(request: Request) {
  const body = await request.json();
  const generator = createDebateGenerator();

  const result = await generator.generateDebate({
    topic: body.topic,
    persona1Id: PersonaType[body.persona1Id],
    persona2Id: PersonaType[body.persona2Id],
    biasLevels: body.biasLevels
  });

  return Response.json(result);
}
```

### Frontend Usage

```typescript
const response = await fetch('/api/debate/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'Climate change policy',
    persona1Id: 'liberal_expert',
    persona2Id: 'conservative_expert',
    biasLevels: { persona1: 0.6, persona2: 0.7 }
  })
});

const debate = await response.json();
```

## API Reference

### `createDebateGenerator(apiKey?: string)`
Creates a new debate generator instance.

### `generator.generateDebate(config: DebateConfig)`
Generates a debate between two personas.

### `generator.getAvailablePersonas()`
Returns list of all available personas.

### `generator.getValidCombinations()`
Returns all valid persona combinations.

### `generator.validatePersonaSelection(persona1Id, persona2Id)`
Validates if two personas can debate (opposite sides).

## Types

```typescript
interface DebateConfig {
  topic: string;
  persona1Id: PersonaType;
  persona2Id: PersonaType;
  context?: string;
  useTwitterSearch?: boolean;
  biasLevels?: {
    persona1: number; // 0.0 - 1.0
    persona2: number; // 0.0 - 1.0
  };
}

interface DebateResult {
  debateId: string;
  topic: string;
  personas: {
    persona1: PersonaData;
    persona2: PersonaData;
  };
  generationMetadata: GenerationMetadata;
  costAnalysis: CostAnalysis;
  timestamp: string;
}
```

## Development

```bash
# Build TypeScript
npm run build

# Watch mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Deployment on Vercel

1. Push this code to your repository
2. Import project to Vercel
3. Set environment variable: `XAI_API_KEY`
4. Deploy!

The TypeScript implementation is optimized for Vercel's serverless functions with:
- No cold start issues (pure JS)
- Efficient parallel processing
- Proper timeout handling
- Error resilience

## Performance

- **Generation Time**: ~20-30s per debate
- **Cost**: ~$0.003-0.005 per debate
- **Token Usage**: ~2000-3000 tokens per persona
- **Parallel Processing**: Both personas generate simultaneously

## License

MIT