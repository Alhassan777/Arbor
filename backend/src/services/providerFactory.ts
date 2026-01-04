/**
 * Provider Factory
 * Handles provider detection and service instantiation
 */

import * as gemini from './gemini';
import * as claude from './claude';
import * as perplexity from './perplexity';
import { AIProvider, AIService, ProviderDetection } from '../types/providers';
import { PROVIDER_CONFIGS } from '../config/providers';

/**
 * Get the AI service for a specific provider
 */
export function getProviderService(provider: AIProvider): AIService {
  switch (provider) {
    case AIProvider.GEMINI:
      return gemini;
    case AIProvider.CLAUDE:
      return claude;
    case AIProvider.PERPLEXITY:
      return perplexity;
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Detect provider from model name
 * Different providers use distinct model naming patterns
 */
export function detectProviderFromModel(model: string): AIProvider | null {
  const lowerModel = model.toLowerCase();

  // Gemini models start with "gemini-"
  if (lowerModel.startsWith('gemini-')) {
    return AIProvider.GEMINI;
  }

  // Claude models start with "claude-"
  if (lowerModel.startsWith('claude-')) {
    return AIProvider.CLAUDE;
  }

  // Perplexity models contain "sonar" or "llama"
  if (lowerModel.includes('sonar') || lowerModel.includes('llama')) {
    return AIProvider.PERPLEXITY;
  }

  return null;
}

/**
 * Detect provider from API key prefix
 * Each provider uses a distinct key format
 */
export function detectProviderFromApiKey(apiKey: string): AIProvider | null {
  if (!apiKey) return null;

  // Check against known prefixes
  for (const provider of Object.values(AIProvider)) {
    const config = PROVIDER_CONFIGS[provider];
    if (apiKey.startsWith(config.apiKeyPrefix)) {
      return provider;
    }
  }

  return null;
}

/**
 * Smart provider detection using multiple signals
 * Priority: explicit header > model name > API key > default
 */
export function detectProvider(
  providerHeader?: string,
  model?: string,
  apiKey?: string
): ProviderDetection {
  // 1. Explicit provider header (highest priority)
  if (providerHeader && Object.values(AIProvider).includes(providerHeader as AIProvider)) {
    return {
      provider: providerHeader as AIProvider,
      confidence: 'high',
      source: 'header',
    };
  }

  // 2. Detect from model name (high confidence)
  if (model) {
    const providerFromModel = detectProviderFromModel(model);
    if (providerFromModel) {
      return {
        provider: providerFromModel,
        confidence: 'high',
        source: 'model',
      };
    }
  }

  // 3. Detect from API key (medium confidence)
  if (apiKey) {
    const providerFromKey = detectProviderFromApiKey(apiKey);
    if (providerFromKey) {
      return {
        provider: providerFromKey,
        confidence: 'medium',
        source: 'apiKey',
      };
    }
  }

  // 4. Default to Gemini (low confidence, for backwards compatibility)
  return {
    provider: AIProvider.GEMINI,
    confidence: 'low',
    source: 'default',
  };
}

/**
 * Validate API key format for a specific provider
 */
export function validateApiKey(apiKey: string, provider: AIProvider): boolean {
  if (!apiKey || apiKey.length < 20) {
    return false;
  }

  const config = PROVIDER_CONFIGS[provider];
  return apiKey.startsWith(config.apiKeyPrefix);
}

/**
 * Get default model for a provider
 */
export function getDefaultModel(provider: AIProvider): string {
  const config = PROVIDER_CONFIGS[provider];
  return config.defaultModel;
}

/**
 * Validate if a model is supported by a provider
 */
export function isValidModel(model: string, provider: AIProvider): boolean {
  const config = PROVIDER_CONFIGS[provider];
  return config.models.includes(model);
}
