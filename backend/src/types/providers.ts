/**
 * Multi-provider support types and interfaces
 * Supports Gemini, Claude, and Perplexity with provider-specific configurations
 */

export enum AIProvider {
  GEMINI = 'gemini',
  CLAUDE = 'claude',
  PERPLEXITY = 'perplexity'
}

export interface ProviderConfig {
  name: AIProvider;
  apiKeyPrefix: string;      // For validation (e.g., "AIza", "sk-ant-", "pplx-")
  envVarName: string;         // Environment variable name
  defaultModel: string;       // Default model for this provider
  models: string[];           // Available models
  supportsStreaming: boolean; // Whether provider supports streaming
  maxTokens: number;          // Maximum tokens for responses
}

/**
 * Unified interface that all AI providers must implement
 * Ensures consistent API across different providers
 */
export interface AIService {
  /**
   * Generate a conversational response
   */
  generateResponse(
    messages: Array<{ role: string; content: string }>,
    systemPrompt: string,
    apiKey?: string,
    model?: string
  ): Promise<string>;

  /**
   * Generate a concise title for a conversation
   */
  generateTitle(
    messages: Array<{ role: string; content: string }>,
    apiKey?: string
  ): Promise<string>;

  /**
   * Generate a summary of a conversation branch
   */
  generateSummary(
    messages: Array<{ role: string; content: string }>,
    apiKey?: string
  ): Promise<string>;

  /**
   * Generate a connection label for branching
   */
  generateConnectionLabel(
    prompt: string,
    apiKey?: string
  ): Promise<{ type: string; label: string }>;
}

/**
 * Provider detection result
 */
export interface ProviderDetection {
  provider: AIProvider;
  confidence: 'high' | 'medium' | 'low';
  source: 'header' | 'model' | 'apiKey' | 'default';
}
