'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Users, MessageSquare } from 'lucide-react';
import PersonaSelector from '@/components/PersonaSelector';
import DebateDisplay from '@/components/DebateDisplay';

interface PersonaInfo {
  id: string;
  displayName: string;
  characterName: string;
  politicalLeaning: string;
  expertiseLevel: string;
  description: string;
  socialMediaHandle: string;
  keyInfluences: string[];
}

interface DebateResult {
  debateId: string;
  topic: string;
  personas: {
    persona1: any;
    persona2: any;
  };
  generationMetadata: any;
  costAnalysis: any;
  timestamp: string;
}

export default function Home() {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [selectedPersona1, setSelectedPersona1] = useState<string>('');
  const [selectedPersona2, setSelectedPersona2] = useState<string>('');
  const [personas, setPersonas] = useState<PersonaInfo[]>([]);
  const [validCombinations, setValidCombinations] = useState<string[][]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [debateResult, setDebateResult] = useState<DebateResult | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');

  // Sample trending topics
  const trendingTopics = [
    'AI regulation and Big Tech monopolies',
    'Climate change policy and economic impact',
    'Healthcare reform in America',
    'Social media content moderation',
    'Immigration policy and border security',
    'Cryptocurrency regulation',
    'Remote work vs office mandates',
    'Universal Basic Income debate'
  ];

  // Load available personas on component mount
  useEffect(() => {
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    try {
      const response = await fetch('/api/personas');
      const data = await response.json();
      setPersonas(data.personas);
      setValidCombinations(data.validCombinations);
    } catch (error) {
      console.error('Failed to fetch personas:', error);
    }
  };

  const handleTopicSelect = (selectedTopic: string) => {
    setTopic(selectedTopic);
  };

  const isValidCombination = (persona1: string, persona2: string) => {
    return validCombinations.some(combo =>
      (combo[0] === persona1 && combo[1] === persona2) ||
      (combo[0] === persona2 && combo[1] === persona1)
    );
  };

  const canGenerate = topic.trim() && selectedPersona1 && selectedPersona2 &&
    isValidCombination(selectedPersona1, selectedPersona2);

  const generateDebate = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus('Initializing debate generation...');
    setDebateResult(null);

    try {
      const response = await fetch('/api/stream-debate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          persona1Id: selectedPersona1,
          persona2Id: selectedPersona2,
          context: context.trim() || undefined,
          useTwitterSearch: true,
        }),
      });

      if (!response.body) {
        throw new Error('No response stream available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              switch (data.type) {
                case 'status':
                  setGenerationStatus(data.message);
                  setGenerationProgress(data.progress);
                  break;

                case 'perspective':
                  setGenerationStatus(`Generated ${data.perspectiveType} perspective`);
                  setGenerationProgress(data.progress);
                  break;

                case 'complete':
                  setGenerationStatus('Debate completed successfully!');
                  setGenerationProgress(100);
                  setDebateResult(data.debateResult);
                  break;

                case 'error':
                  throw new Error(data.details || 'Unknown error occurred');
              }
            } catch (parseError) {
              console.error('Failed to parse stream data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Debate generation failed:', error);
      setGenerationStatus('Failed to generate debate');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Debate Generator
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Generate balanced political debates using advanced AI personas. Explore different perspectives
            on contemporary issues with authentic liberal and conservative viewpoints.
          </p>
        </div>

        {!debateResult ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Topic Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Choose Your Debate Topic
                </CardTitle>
                <CardDescription>
                  Select from trending topics or enter your own custom debate topic
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="topic">Debate Topic</Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter a debate topic..."
                    className="mt-1"
                  />
                </div>

                {/* Trending Topics */}
                <div>
                  <Label className="text-sm font-medium">Trending Topics</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {trendingTopics.map((trendingTopic, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950"
                        onClick={() => handleTopicSelect(trendingTopic)}
                      >
                        {trendingTopic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="context">Additional Context (Optional)</Label>
                  <Textarea
                    id="context"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Provide additional context, specific angles, or constraints for the debate..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Persona Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Select Debate Personas
                </CardTitle>
                <CardDescription>
                  Choose two personas from opposing political sides to represent different perspectives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PersonaSelector
                  personas={personas}
                  validCombinations={validCombinations}
                  selectedPersona1={selectedPersona1}
                  selectedPersona2={selectedPersona2}
                  onPersona1Change={setSelectedPersona1}
                  onPersona2Change={setSelectedPersona2}
                />
              </CardContent>
            </Card>

            {/* Generation Button */}
            <div className="text-center">
              <Button
                onClick={generateDebate}
                disabled={!canGenerate || isGenerating}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating... ({generationProgress}%)
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Debate
                  </>
                )}
              </Button>
              {isGenerating && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {generationStatus}
                </p>
              )}
            </div>
          </div>
        ) : (
          <DebateDisplay
            debateResult={debateResult}
            onNewDebate={() => {
              setDebateResult(null);
              setTopic('');
              setContext('');
              setSelectedPersona1('');
              setSelectedPersona2('');
            }}
          />
        )}
      </div>
    </div>
  );
}
