/**
 * Arbor Backend API Integration
 * Connects the Chrome extension to the Arbor backend for AI-powered features
 */

import { AIProvider, BackendMessage } from '../types';

export class ArborBackendClient {
  private baseUrl: string;
  private provider: AIProvider;
  private apiKey?: string;
  private model?: string;

  constructor(config: {
    baseUrl: string;
    provider: AIProvider;
    apiKey?: string;
    model?: string;
  }) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.provider = config.provider;
    this.apiKey = config.apiKey;
    this.model = config.model;
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.provider) headers['X-Provider'] = this.provider;
    if (this.apiKey) headers['X-API-Key'] = this.apiKey;
    if (this.model) headers['X-Model'] = this.model;

    return headers;
  }

  /**
   * Send a message to a conversation and get AI response
   */
  async sendMessage(
    conversationId: string,
    content: string
  ): Promise<BackendMessage> {
    const response = await fetch(
      `${this.baseUrl}/api/conversation/${conversationId}/message`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ content }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Failed to send message',
      }));
      throw new Error(error.error || 'Failed to send message');
    }

    return response.json();
  }

  /**
   * Create a new conversation tree
   */
  async createConversation(name?: string): Promise<{
    id: string;
    name: string;
    rootNodeId: string;
    nodes: Record<string, any>;
  }> {
    const response = await fetch(`${this.baseUrl}/api/conversation`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error('Failed to create conversation');
    }

    return response.json();
  }

  /**
   * Create a branch from a conversation node
   */
  async createBranch(
    conversationId: string,
    data: {
      sourceMessageId?: string;
      selectedText?: string;
    }
  ): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/api/conversation/${conversationId}/branch`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create branch');
    }

    return response.json();
  }

  /**
   * Generate a summary for a conversation
   */
  async generateSummary(conversationId: string): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/api/conversation/${conversationId}/summarize`,
      {
        method: 'POST',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate summary');
    }

    const data = await response.json();
    return data.summary;
  }

  /**
   * Generate a connection label for branching
   */
  async generateConnectionLabel(prompt: string): Promise<{
    type: string;
    label: string;
  }> {
    const response = await fetch(`${this.baseUrl}/api/ai/label-connection`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate connection label');
    }

    return response.json();
  }

  /**
   * Update conversation title
   */
  async updateConversation(
    conversationId: string,
    updates: { title?: string }
  ): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/api/conversation/${conversationId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update conversation');
    }

    return response.json();
  }

  /**
   * Get the full conversation tree
   */
  async getTree(treeId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/tree/${treeId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch tree');
    }

    return response.json();
  }

  /**
   * Check if backend is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Create a backend client instance
 */
export function createBackendClient(config: {
  baseUrl?: string;
  provider: AIProvider;
  apiKey?: string;
  model?: string;
}): ArborBackendClient | null {
  if (!config.baseUrl) {
    return null; // Backend integration is optional
  }

  return new ArborBackendClient({
    baseUrl: config.baseUrl,
    provider: config.provider,
    apiKey: config.apiKey,
    model: config.model,
  });
}
