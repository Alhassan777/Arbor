/**
 * Perplexity AI Service
 * Uses OpenAI-compatible API with Perplexity's endpoint
 * Supports both online (web search) and chat models
 */

import OpenAI from 'openai';
import type { Message } from '../types';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai';
const DEFAULT_MODEL = 'llama-3.1-sonar-large-128k-online';
const FAST_MODEL = 'llama-3.1-sonar-small-128k-online'; // For titles/summaries

function getClient(apiKey?: string): OpenAI {
  const finalApiKey = apiKey || process.env.PERPLEXITY_API_KEY;

  if (!finalApiKey) {
    throw new Error(
      "Perplexity API key is required. Set PERPLEXITY_API_KEY environment variable or provide it via x-api-key header."
    );
  }

  return new OpenAI({
    apiKey: finalApiKey,
    baseURL: PERPLEXITY_API_URL,
  });
}

export async function generateResponse(
  messages: Message[],
  systemPrompt?: string,
  apiKey?: string,
  model: string = DEFAULT_MODEL
): Promise<string> {
  const client = getClient(apiKey);

  // Format messages for OpenAI-compatible API
  const formattedMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

  // Add system prompt if provided
  if (systemPrompt) {
    formattedMessages.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  // Add conversation messages
  messages.forEach(msg => {
    formattedMessages.push({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    });
  });

  const completion = await client.chat.completions.create({
    model,
    messages: formattedMessages,
    temperature: 0.7,
    max_tokens: 4096,
  });

  return completion.choices[0]?.message?.content || '';
}

export async function generateTitle(
  messages: Message[],
  apiKey?: string
): Promise<string> {
  const client = getClient(apiKey);
  const conversationText = messages
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');

  const completion = await client.chat.completions.create({
    model: FAST_MODEL, // Use fast model for titles
    messages: [{
      role: 'user',
      content: `Generate a short, concise title (3-6 words) for this conversation:\n\n${conversationText}\n\nRespond with ONLY the title, nothing else.`,
    }],
    temperature: 0.7,
    max_tokens: 100,
  });

  return completion.choices[0]?.message?.content?.trim() || 'New Conversation';
}

export async function generateSummary(
  messages: Message[],
  apiKey?: string
): Promise<string> {
  const client = getClient(apiKey);
  const conversationText = messages
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');

  const completion = await client.chat.completions.create({
    model: FAST_MODEL, // Use fast model for summaries
    messages: [{
      role: 'user',
      content: `Summarize the key points and context of this conversation in 2-3 sentences:\n\n${conversationText}`,
    }],
    temperature: 0.7,
    max_tokens: 500,
  });

  return completion.choices[0]?.message?.content || '';
}

export async function generateConnectionLabel(
  prompt: string,
  apiKey?: string
): Promise<{ type: string; label: string }> {
  const client = getClient(apiKey);

  const completion = await client.chat.completions.create({
    model: FAST_MODEL, // Use fast model for labels
    messages: [{
      role: 'user',
      content: prompt,
    }],
    temperature: 0.7,
    max_tokens: 100,
  });

  const responseText = completion.choices[0]?.message?.content;

  if (responseText) {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(responseText);
      return {
        type: parsed.type || 'extends',
        label: parsed.label || 'branch',
      };
    } catch (error) {
      // If parsing fails, return default
      return {
        type: 'extends',
        label: 'branch',
      };
    }
  }

  return {
    type: 'extends',
    label: 'branch',
  };
}
