// Simplified types for browser extension
export interface ChatNode {
  id: string;
  title: string;
  url: string;
  platform: 'chatgpt' | 'gemini' | 'perplexity';
  parentId: string | null;
  children: string[]; // array of child IDs
  createdAt: string;
  updatedAt: string;

  // Optional context
  summary?: string;
  tags?: string[];
  connectionLabel?: ConnectionType;
}

export type ConnectionType =
  | 'deepens'
  | 'explores'
  | 'contrasts'
  | 'examples'
  | 'applies'
  | 'questions'
  | 'extends'
  | 'summarizes'
  | 'custom';

export interface ChatTree {
  id: string;
  rootNodeId: string;
  title: string;
  nodes: Record<string, ChatNode>; // nodeId -> ChatNode
  createdAt: string;
  updatedAt: string;
}

export interface ExtensionState {
  trees: Record<string, ChatTree>; // treeId -> ChatTree
  currentTreeId: string | null;
  currentNodeId: string | null;
  sidebarVisible: boolean;
}

export interface Platform {
  name: string;
  isActive(): boolean;
  getChatId(): string | null;
  detectCurrentChatUrl(): string | null;
  detectChatTitle(): string | null;
  isInConversation(): boolean;
  getSelectedText(): string | null;
  openNewChat(): void;
  navigateToChat(chatId: string): void;
  generateBranchContext(params: {
    parentTitle: string;
    summary?: string;
    selectedText?: string;
    connectionType?: string;
  }): string;
  copyToClipboard(text: string): Promise<boolean>;
  onNavigationChange(callback: (chatId: string | null) => void): void;
  extractMessages(): Array<{ role: 'user' | 'assistant'; content: string }>;
  getRecentMessages(count?: number): Array<{ role: 'user' | 'assistant'; content: string }>;
}
