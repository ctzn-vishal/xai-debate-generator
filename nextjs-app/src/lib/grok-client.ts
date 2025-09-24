/**
 * Grok 4 API Client for TypeScript
 * Handles all interactions with XAI's Grok API
 */

export interface GrokApiConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface GrokGenerateOptions {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  useSearch?: boolean;
}

export interface GrokResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  sources?: Array<{
    url: string;
    title: string;
    snippet: string;
  }>;
  searchCost?: number;
}

export interface GrokError {
  error: string;
  code?: string;
  statusCode?: number;
}

class GrokClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  private maxRetries: number;

  constructor(config: GrokApiConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.x.ai/v1';
    this.timeout = config.timeout || 60000; // 60 seconds default
    this.maxRetries = config.maxRetries || 3;

    if (!this.apiKey) {
      throw new Error('XAI_API_KEY is required');
    }
  }

  /**
   * Generate content using Grok 4 API
   */
  async generate(options: GrokGenerateOptions): Promise<GrokResponse> {
    const {
      prompt,
      systemPrompt = '',
      model = 'grok-4-fast',
      temperature = 0.7,
      maxTokens = 2000,
      topP = 1,
      stop = [],
      useSearch = false
    } = options;

    // Use standard endpoint for both regular and search requests
    const endpoint = '/chat/completions';

    const messages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: prompt }
    ];

    const requestBody = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      ...(stop.length > 0 && { stop }),
      // Add X/Twitter search parameters when search is enabled
      ...(useSearch && {
        search_parameters: {
          domains: ['x.com', 'twitter.com'],
          post_favorite_count: 10,  // Only posts with 10+ favorites
          post_view_count: 100,     // Only posts with 100+ views
          time_range: 'week',       // Posts from last week
          max_sources: 20           // Limit to 20 sources to control costs
        }
      })
    };

    let lastError: any;
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await this.makeRequest(endpoint, requestBody);
        return this.parseResponse(response, model, useSearch);
      } catch (error) {
        lastError = error;

        // Check if it's a rate limit error
        if ((error as any).statusCode === 429) {
          const waitTime = this.getRetryDelay(attempt);
          console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
          await this.sleep(waitTime);
          continue;
        }

        // For other errors, throw immediately
        throw error;
      }
    }

    throw lastError;
  }

  /**
   * Generate with automatic search integration
   */
  async generateWithSearch(options: GrokGenerateOptions): Promise<GrokResponse> {
    return this.generate({ ...options, useSearch: true });
  }

  /**
   * Make HTTP request to Grok API
   */
  private async makeRequest(endpoint: string, body: any): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Request-ID': this.generateRequestId()
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        throw {
          error: `API request failed: ${response.statusText}`,
          statusCode: response.status,
          body: errorBody
        };
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw { error: 'Request timeout', code: 'TIMEOUT' };
      }

      throw error;
    }
  }

  /**
   * Parse API response into standardized format
   */
  private parseResponse(response: any, model: string, useSearch: boolean): GrokResponse {
    const choice = response.choices?.[0];

    if (!choice) {
      throw { error: 'Invalid response: no choices returned' };
    }

    const content = choice.message?.content || '';

    const result: GrokResponse = {
      content,
      model,
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens
      } : undefined
    };

    // Handle X/Twitter search results
    if (useSearch && (response.search_results || response.sources)) {
      const searchResults = response.search_results || response.sources || [];
      result.sources = searchResults.map((source: any) => ({
        url: source.url || source.link,
        title: source.title || source.name,
        snippet: source.snippet || source.description || source.text
      }));
      // Cost calculation: $25 per 1,000 sources according to XAI pricing
      result.searchCost = searchResults.length * 0.025;
    }

    return result;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private getRetryDelay(attempt: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    const jitter = Math.random() * 0.3 * delay; // Add up to 30% jitter
    return Math.floor(delay + jitter);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate unique request ID for tracking
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Estimate cost for a generation
   */
  estimateCost(usage?: GrokResponse['usage'], searchSources: number = 0): number {
    if (!usage) return 0;

    const inputCostPerToken = 0.20 / 1_000_000;  // $0.20 per 1M input tokens
    const outputCostPerToken = 0.50 / 1_000_000; // $0.50 per 1M output tokens
    const searchCostPerSource = 0.025;           // $0.025 per source

    const inputCost = usage.promptTokens * inputCostPerToken;
    const outputCost = usage.completionTokens * outputCostPerToken;
    const searchCost = searchSources * searchCostPerSource;

    return inputCost + outputCost + searchCost;
  }

  /**
   * Select model based on query complexity
   */
  selectModel(topic: string, context?: string): string {
    const combinedText = `${topic} ${context || ''}`.toLowerCase();

    const reasoningKeywords = [
      'analyze', 'complex', 'systematic', 'constitutional',
      'policy', 'economic', 'historical', 'legal', 'impact',
      'comprehensive', 'evaluate', 'compare', 'explain'
    ];

    const needsReasoning =
      reasoningKeywords.some(keyword => combinedText.includes(keyword)) ||
      combinedText.length > 100;

    return needsReasoning ? 'grok-4-fast-reasoning' : 'grok-4-fast';
  }
}

// Export factory function for easy initialization
export function createGrokClient(apiKey?: string): GrokClient {
  const key = apiKey || process.env.XAI_API_KEY || process.env.NEXT_PUBLIC_XAI_API_KEY;

  if (!key) {
    throw new Error('XAI API key not found. Set XAI_API_KEY or NEXT_PUBLIC_XAI_API_KEY environment variable.');
  }

  return new GrokClient({ apiKey: key });
}

export default GrokClient;