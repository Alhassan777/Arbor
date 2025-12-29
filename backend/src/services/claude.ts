import Anthropic from '@anthropic-ai/sdk';
import type { Message } from '../types';

function getClient(apiKey?: string): Anthropic {
  return new Anthropic({
    apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
  });
}

export async function generateResponse(
  messages: Message[],
  systemPrompt?: string,
  apiKey?: string,
  model: string = 'claude-3-5-sonnet-20241022'
): Promise<string> {
  const client = getClient(apiKey);
  const formattedMessages = messages.map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: formattedMessages,
  });

  const content = response.content[0];
  if (content.type === 'text') {
    return content.text;
  }

  return '';
}

export async function generateTitle(
  messages: Message[],
  apiKey?: string
): Promise<string> {
  const client = getClient(apiKey);
  const conversationText = messages
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');

  const response = await client.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 100,
    messages: [{
      role: 'user',
      content: `Generate a short, concise title (3-6 words) for this conversation:\n\n${conversationText}\n\nRespond with ONLY the title, nothing else.`,
    }],
  });

  const content = response.content[0];
  if (content.type === 'text') {
    return content.text.trim();
  }

  return 'New Conversation';
}

export async function generateSummary(
  messages: Message[],
  apiKey?: string
): Promise<string> {
  const client = getClient(apiKey);
  const conversationText = messages
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');

  const response = await client.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Summarize the key points and context of this conversation in 2-3 sentences:\n\n${conversationText}`,
    }],
  });

  const content = response.content[0];
  if (content.type === 'text') {
    return content.text;
  }

  return '';
}
