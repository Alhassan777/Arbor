import type {
  ConversationTree,
  ConversationNode,
  Message,
  CreateBranchRequest
} from '../types';

const API_BASE = '/api';

function getHeaders(apiKey?: string, model?: string): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (apiKey) headers['X-API-Key'] = apiKey;
  if (model) headers['X-Model'] = model;
  return headers;
}

export const api = {
  // Create a new root conversation
  async createConversation(apiKey?: string, model?: string, name?: string): Promise<ConversationTree> {
    const response = await fetch(`${API_BASE}/conversation`, {
      method: 'POST',
      headers: getHeaders(apiKey, model),
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to create conversation');
    return response.json();
  },

  // Send a message and get AI response
  async sendMessage(conversationId: string, content: string, apiKey?: string, model?: string): Promise<{ userMessage: Message; assistantMessage: Message; updatedTitle: string }> {
    const response = await fetch(`${API_BASE}/conversation/${conversationId}/message`, {
      method: 'POST',
      headers: getHeaders(apiKey, model),
      body: JSON.stringify({ content }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to send message' }));
      throw new Error(error.error || 'Failed to send message');
    }
    return response.json();
  },

  // Create a branch from a message
  async createBranch(
    conversationId: string,
    data: CreateBranchRequest,
    apiKey?: string,
    model?: string
  ): Promise<ConversationNode> {
    const response = await fetch(`${API_BASE}/conversation/${conversationId}/branch`, {
      method: 'POST',
      headers: getHeaders(apiKey, model),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create branch');
    return response.json();
  },

  // Get the full conversation tree
  async getTree(treeId: string): Promise<ConversationTree> {
    const response = await fetch(`${API_BASE}/tree/${treeId}`);
    if (!response.ok) throw new Error('Failed to fetch tree');
    return response.json();
  },

  // Update conversation (e.g., title)
  async updateConversation(
    conversationId: string,
    updates: Partial<ConversationNode>
  ): Promise<ConversationNode> {
    const response = await fetch(`${API_BASE}/conversation/${conversationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update conversation');
    return response.json();
  },

  // Update tree (e.g., name)
  async updateTree(
    treeId: string,
    name: string
  ): Promise<{ id: string; name: string }> {
    const response = await fetch(`${API_BASE}/tree/${treeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to update tree');
    return response.json();
  },

  // Delete conversation and children
  async deleteConversation(conversationId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/conversation/${conversationId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete conversation');
  },

  // Move conversation node to a new parent
  async moveNode(
    conversationId: string,
    newParentId: string | null,
    newTreeId?: string
  ): Promise<ConversationNode> {
    const response = await fetch(`${API_BASE}/conversation/${conversationId}/move`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newParentId, newTreeId }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to move node' }));
      throw new Error(error.error || 'Failed to move node');
    }
    return response.json();
  },

  // Generate summary for a conversation
  async summarizeConversation(conversationId: string): Promise<string> {
    const response = await fetch(`${API_BASE}/conversation/${conversationId}/summarize`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to summarize conversation');
    const data = await response.json();
    return data.summary;
  },
};
