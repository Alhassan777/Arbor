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
  detectCurrentChatUrl(): string | null;
  detectChatTitle(): string | null;
  getChatId(): string | null;
}
