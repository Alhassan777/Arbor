import type {
  ConversationTree,
  ConversationNode,
  Message,
  CreateBranchRequest,
  SendMessageRequest
} from '../types';

const API_BASE = '/api';

export const api = {
  // Create a new root conversation
  async createConversation(): Promise<ConversationTree> {
    const response = await fetch(`${API_BASE}/conversation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to create conversation');
    return response.json();
  },

  // Send a message and get AI response
  async sendMessage(conversationId: string, content: string): Promise<Message> {
    const response = await fetch(`${API_BASE}/conversation/${conversationId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  // Create a branch from a message
  async createBranch(
    conversationId: string,
    data: CreateBranchRequest
  ): Promise<ConversationNode> {
    const response = await fetch(`${API_BASE}/conversation/${conversationId}/branch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

  // Delete conversation and children
  async deleteConversation(conversationId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/conversation/${conversationId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete conversation');
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
