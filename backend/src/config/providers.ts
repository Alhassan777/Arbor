/**
 * Provider-specific configurations
 * Each provider has customized settings for API keys, models, and capabilities
 */

import { AIProvider, ProviderConfig } from '../types/providers';

export const PROVIDER_CONFIGS: Record<AIProvider, ProviderConfig> = {
  [AIProvider.GEMINI]: {
    name: AIProvider.GEMINI,
    apiKeyPrefix: 'AIza',           // Google API keys start with "AIza"
    envVarName: 'GEMINI_API_KEY',
    defaultModel: 'gemini-2.5-flash',
    models: [
      'gemini-2.5-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-2.0-flash-exp'
    ],
    supportsStreaming: true,
    maxTokens: 8192
  },

  [AIProvider.CLAUDE]: {
    name: AIProvider.CLAUDE,
    apiKeyPrefix: 'sk-ant-',        // Anthropic keys start with "sk-ant-"
    envVarName: 'ANTHROPIC_API_KEY',
    defaultModel: 'claude-3-5-sonnet-20241022',
    models: [
      'claude-sonnet-4-5-20250929',   // Latest Sonnet 4.5
      'claude-3-5-sonnet-20241022',   // Sonnet 3.5
      'claude-3-5-haiku-20241022',    // Fast Haiku
      'claude-3-opus-20240229'        // Most capable Opus
    ],
    supportsStreaming: true,
    maxTokens: 8192
  },

  [AIProvider.PERPLEXITY]: {
    name: AIProvider.PERPLEXITY,
    apiKeyPrefix: 'pplx-',          // Perplexity keys start with "pplx-"
    envVarName: 'PERPLEXITY_API_KEY',
    defaultModel: 'llama-3.1-sonar-large-128k-online',
    models: [
      'llama-3.1-sonar-small-128k-online',  // Fast with web search
      'llama-3.1-sonar-large-128k-online',  // Balanced with web search
      'llama-3.1-sonar-huge-128k-online',   // Most capable with web search
      'llama-3.1-sonar-small-128k-chat',    // Fast chat only
      'llama-3.1-sonar-large-128k-chat'     // Large chat only
    ],
    supportsStreaming: true,
    maxTokens: 4096
  }
};

/**
 * Get configuration for a specific provider
 */
export function getProviderConfig(provider: AIProvider): ProviderConfig {
  const config = PROVIDER_CONFIGS[provider];
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`);
  }
  return config;
}

/**
 * Get all available providers
 */
export function getAllProviders(): AIProvider[] {
  return Object.values(AIProvider);
}

/**
 * Validate if a model belongs to a provider
 */
export function isValidModelForProvider(model: string, provider: AIProvider): boolean {
  const config = getProviderConfig(provider);
  return config.models.includes(model);
}

/**
 * Get environment variable name for a provider
 */
export function getProviderEnvVar(provider: AIProvider): string {
  return getProviderConfig(provider).envVarName;
}
