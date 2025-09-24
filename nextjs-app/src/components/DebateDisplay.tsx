'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Download,
  Share2,
  Eye,
  Clock,
  DollarSign,
  FileText,
  Users2,
  BarChart3,
  Copy,
  CheckCircle,
  ExternalLink,
  Twitter,
} from 'lucide-react';

interface DebateResult {
  debateId: string;
  topic: string;
  personas: {
    persona1: {
      id: string;
      info: any;
      content: {
        perspective: string;
        persona: any;
        topic: string;
        content: string;
        title: string;
        modelUsed: string;
        tokenUsage: any;
        timestamp: string;
      };
    };
    persona2: {
      id: string;
      info: any;
      content: {
        perspective: string;
        persona: any;
        topic: string;
        content: string;
        title: string;
        modelUsed: string;
        tokenUsage: any;
        timestamp: string;
      };
    };
  };
  generationMetadata: any;
  costAnalysis: any;
  timestamp: string;
}

interface DebateDisplayProps {
  debateResult: DebateResult;
  onNewDebate: () => void;
}

export default function DebateDisplay({ debateResult, onNewDebate }: DebateDisplayProps) {
  const [activeTab, setActiveTab] = useState('side-by-side');
  const [copiedText, setCopiedText] = useState('');

  const getPersonaColor = (perspective: string) => {
    return perspective.toLowerCase().includes('liberal')
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
  };

  const formatCost = (cost: number) => {
    return cost < 0.01 ? `<$0.01` : `$${cost.toFixed(3)}`;
  };

  const formatTokens = (tokens: number) => {
    return tokens.toLocaleString();
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadAsMarkdown = () => {
    const content = `# Debate: ${debateResult.topic}

**Generated**: ${new Date(debateResult.timestamp).toLocaleString()}

---

## ${debateResult.personas.persona1.content.perspective} Perspective

${debateResult.personas.persona1.content.content}

---

## ${debateResult.personas.persona2.content.perspective} Perspective

${debateResult.personas.persona2.content.content}

---

**Generation Details:**
- Cost: ${formatCost(debateResult.costAnalysis.totalEstimatedCost)}
- Generation Time: ${debateResult.generationMetadata.generationTimeSeconds.toFixed(2)}s
- Models Used: ${debateResult.generationMetadata.modelsUsed.persona1}, ${debateResult.generationMetadata.modelsUsed.persona2}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${debateResult.topic.replace(/[^a-zA-Z0-9]/g, '_')}_debate.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareDebate = async () => {
    const shareData = {
      title: `AI Debate: ${debateResult.topic}`,
      text: `Check out this AI-generated debate on "${debateResult.topic}" featuring perspectives from ${debateResult.personas.persona1.content.persona.displayName} and ${debateResult.personas.persona2.content.persona.displayName}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Sharing cancelled or failed');
      }
    } else {
      // Fallback to copying URL
      await copyToClipboard(window.location.href, 'URL');
    }
  };

  // Enhanced markdown components for better formatting
  const MarkdownComponents = {
    h1: ({ children }: any) => (
      <h1 className="scroll-m-20 text-3xl font-bold tracking-tight lg:text-4xl mb-6 pb-3 border-b">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4 mt-8 pb-2 border-b">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3 mt-6">
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="scroll-m-20 text-lg font-semibold tracking-tight mb-2 mt-4">
        {children}
      </h4>
    ),
    p: ({ children }: any) => (
      <p className="leading-7 mb-4 text-slate-700 dark:text-slate-300">
        {children}
      </p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="mt-6 border-l-4 border-blue-500 pl-6 italic bg-blue-50 dark:bg-blue-950 p-4 rounded-r-lg">
        {children}
      </blockquote>
    ),
    ul: ({ children }: any) => (
      <ul className="my-4 ml-6 list-disc space-y-2 text-slate-700 dark:text-slate-300">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="my-4 ml-6 list-decimal space-y-2 text-slate-700 dark:text-slate-300">
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="leading-7">
        {children}
      </li>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-slate-900 dark:text-slate-100">
        {children}
      </strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-slate-600 dark:text-slate-400">
        {children}
      </em>
    ),
    code: ({ inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <div className="my-6 overflow-hidden rounded-lg border bg-zinc-950 dark:bg-zinc-900">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 dark:bg-zinc-800">
            <span className="text-sm font-mono text-zinc-400">
              {match[1]}
            </span>
          </div>
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            className="!m-0 !bg-transparent"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="relative rounded bg-slate-100 dark:bg-slate-800 px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
          {children}
        </code>
      );
    },
    table: ({ children }: any) => (
      <div className="my-6 w-full overflow-y-auto">
        <table className="w-full border-collapse border border-slate-300 dark:border-slate-700">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-slate-50 dark:bg-slate-800">
        {children}
      </thead>
    ),
    tbody: ({ children }: any) => (
      <tbody>
        {children}
      </tbody>
    ),
    tr: ({ children }: any) => (
      <tr className="border-b border-slate-200 dark:border-slate-700">
        {children}
      </tr>
    ),
    th: ({ children }: any) => (
      <th className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left font-semibold">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
        {children}
      </td>
    ),
    a: ({ children, href }: any) => (
      <a
        href={href}
        className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline underline-offset-4 decoration-blue-500/30 hover:decoration-blue-500/60 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button
            variant="outline"
            onClick={onNewDebate}
            className="mb-3"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            New Debate
          </Button>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {debateResult.topic}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generated on {new Date(debateResult.timestamp).toLocaleDateString()} at{' '}
            {new Date(debateResult.timestamp).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={downloadAsMarkdown} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button onClick={shareDebate} variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Generation Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5" />
            Generation Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-semibold">
                {debateResult.generationMetadata.generationTimeSeconds.toFixed(1)}s
              </div>
              <div className="text-xs text-muted-foreground">Generation Time</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-semibold">
                {formatCost(debateResult.costAnalysis.totalEstimatedCost)}
              </div>
              <div className="text-xs text-muted-foreground">Estimated Cost</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-semibold">
                {formatTokens(
                  (debateResult.costAnalysis.costBreakdown.persona1.totalTokens || 0) +
                  (debateResult.costAnalysis.costBreakdown.persona2.totalTokens || 0)
                )}
              </div>
              <div className="text-xs text-muted-foreground">Total Tokens</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-semibold">2</div>
              <div className="text-xs text-muted-foreground">AI Personas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* X/Twitter Sources */}
      {(debateResult.personas.persona1.content.sourcesUsed?.length > 0 ||
        debateResult.personas.persona2.content.sourcesUsed?.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Twitter className="h-5 w-5" />
              X/Twitter Sources
            </CardTitle>
            <CardDescription>
              Real-time social media posts and discussions that informed the debate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Liberal Perspective Sources */}
              {debateResult.personas.persona1.content.sourcesUsed?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-300">
                    Liberal Perspective Sources
                  </h4>
                  <div className="space-y-2">
                    {debateResult.personas.persona1.content.sourcesUsed.map((source, index) => (
                      <a
                        key={index}
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg border hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors text-sm"
                      >
                        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate text-blue-600 dark:text-blue-400">
                          {source.replace('https://', '').replace('www.', '')}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Conservative Perspective Sources */}
              {debateResult.personas.persona2.content.sourcesUsed?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-red-700 dark:text-red-300">
                    Conservative Perspective Sources
                  </h4>
                  <div className="space-y-2">
                    {debateResult.personas.persona2.content.sourcesUsed.map((source, index) => (
                      <a
                        key={index}
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg border hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-sm"
                      >
                        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate text-red-600 dark:text-red-400">
                          {source.replace('https://', '').replace('www.', '')}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debate Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Debate Content
          </CardTitle>
          <CardDescription>
            Explore different perspectives on {debateResult.topic}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
              <TabsTrigger value="liberal">Liberal View</TabsTrigger>
              <TabsTrigger value="conservative">Conservative View</TabsTrigger>
            </TabsList>

            <TabsContent value="side-by-side" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Liberal Perspective */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className={getPersonaColor(debateResult.personas.persona1.content.perspective)}>
                            {debateResult.personas.persona1.content.persona.characterName
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {debateResult.personas.persona1.content.persona.displayName}
                          </CardTitle>
                          <CardDescription>
                            {debateResult.personas.persona1.content.persona.characterName}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getPersonaColor(debateResult.personas.persona1.content.perspective)}>
                        {debateResult.personas.persona1.content.perspective}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="max-h-96 overflow-y-auto">
                      <div className="prose-custom max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw, rehypeHighlight]}
                          components={MarkdownComponents}
                        >
                          {debateResult.personas.persona1.content.content.substring(0, 1000) +
                           (debateResult.personas.persona1.content.content.length > 1000 ? '...' : '')}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          Read Full Perspective
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {debateResult.personas.persona1.content.persona.displayName} - Liberal Perspective
                          </DialogTitle>
                          <DialogDescription>
                            {debateResult.personas.persona1.content.title}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="prose-custom max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw, rehypeHighlight]}
                            components={MarkdownComponents}
                          >
                            {debateResult.personas.persona1.content.content}
                          </ReactMarkdown>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            onClick={() => copyToClipboard(
                              debateResult.personas.persona1.content.content,
                              'Liberal perspective'
                            )}
                            variant="outline"
                            size="sm"
                          >
                            {copiedText === 'Liberal perspective' ? (
                              <CheckCircle className="mr-2 h-4 w-4" />
                            ) : (
                              <Copy className="mr-2 h-4 w-4" />
                            )}
                            Copy Text
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>

                {/* Conservative Perspective */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className={getPersonaColor(debateResult.personas.persona2.content.perspective)}>
                            {debateResult.personas.persona2.content.persona.characterName
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {debateResult.personas.persona2.content.persona.displayName}
                          </CardTitle>
                          <CardDescription>
                            {debateResult.personas.persona2.content.persona.characterName}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getPersonaColor(debateResult.personas.persona2.content.perspective)}>
                        {debateResult.personas.persona2.content.perspective}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="max-h-96 overflow-y-auto">
                      <div className="prose-custom max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw, rehypeHighlight]}
                          components={MarkdownComponents}
                        >
                          {debateResult.personas.persona2.content.content.substring(0, 1000) +
                           (debateResult.personas.persona2.content.content.length > 1000 ? '...' : '')}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          Read Full Perspective
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {debateResult.personas.persona2.content.persona.displayName} - Conservative Perspective
                          </DialogTitle>
                          <DialogDescription>
                            {debateResult.personas.persona2.content.title}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="prose-custom max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw, rehypeHighlight]}
                            components={MarkdownComponents}
                          >
                            {debateResult.personas.persona2.content.content}
                          </ReactMarkdown>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            onClick={() => copyToClipboard(
                              debateResult.personas.persona2.content.content,
                              'Conservative perspective'
                            )}
                            variant="outline"
                            size="sm"
                          >
                            {copiedText === 'Conservative perspective' ? (
                              <CheckCircle className="mr-2 h-4 w-4" />
                            ) : (
                              <Copy className="mr-2 h-4 w-4" />
                            )}
                            Copy Text
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="liberal" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className={getPersonaColor(debateResult.personas.persona1.content.perspective)}>
                          {debateResult.personas.persona1.content.persona.characterName
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">
                          {debateResult.personas.persona1.content.persona.displayName}
                        </CardTitle>
                        <CardDescription>
                          {debateResult.personas.persona1.content.title}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getPersonaColor(debateResult.personas.persona1.content.perspective)}>
                      {debateResult.personas.persona1.content.perspective}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose-custom max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, rehypeHighlight]}
                      components={MarkdownComponents}
                    >
                      {debateResult.personas.persona1.content.content}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conservative" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className={getPersonaColor(debateResult.personas.persona2.content.perspective)}>
                          {debateResult.personas.persona2.content.persona.characterName
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">
                          {debateResult.personas.persona2.content.persona.displayName}
                        </CardTitle>
                        <CardDescription>
                          {debateResult.personas.persona2.content.title}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getPersonaColor(debateResult.personas.persona2.content.perspective)}>
                      {debateResult.personas.persona2.content.perspective}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose-custom max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, rehypeHighlight]}
                      components={MarkdownComponents}
                    >
                      {debateResult.personas.persona2.content.content}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {copiedText && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {copiedText} copied to clipboard!
          </div>
        </div>
      )}
    </div>
  );
}