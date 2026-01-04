// Aligned with backend multi-provider system
export type PlatformName = 'chatgpt' | 'gemini' | 'perplexity' | 'claude';
export type AIProvider = 'gemini' | 'claude' | 'perplexity';

// Map platform names to backend providers
export const PLATFORM_TO_PROVIDER: Record<PlatformName, AIProvider> = {
  chatgpt: 'claude', // ChatGPT can use Claude or any provider via Arbor backend
  gemini: 'gemini',
  perplexity: 'perplexity',
  claude: 'claude',
};

// Provider information for backend integration
export interface ProviderConfig {
  name: AIProvider;
  defaultModel: string;
  apiKeyPrefix: string;
}

export const PROVIDER_CONFIGS: Record<AIProvider, ProviderConfig> = {
  gemini: {
    name: 'gemini',
    defaultModel: 'gemini-2.5-flash',
    apiKeyPrefix: 'AIza',
  },
  claude: {
    name: 'claude',
    defaultModel: 'claude-sonnet-4-5-20250929',
    apiKeyPrefix: 'sk-ant-',
  },
  perplexity: {
    name: 'perplexity',
    defaultModel: 'llama-3.1-sonar-large-128k-online',
    apiKeyPrefix: 'pplx-',
  },
};

// Simplified types for browser extension
export interface ChatNode {
  id: string;
  title: string;
  url: string;
  platform: PlatformName; // UI platform (ChatGPT, Gemini, Perplexity, Claude)
  provider?: AIProvider; // Backend AI provider (for API calls to Arbor)
  model?: string; // Specific model being used
  parentId: string | null;
  children: string[]; // array of child IDs
  createdAt: string;
  updatedAt: string;

  // Optional context
  summary?: string;
  tags?: string[];
  connectionLabel?: ConnectionType;

  // Visual customization
  customPosition?: { x: number; y: number }; // Custom position on canvas
  color?: string; // Hex color code
  shape?: 'rectangle' | 'circle' | 'rounded' | 'diamond';
}

export interface Connection {
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  type?: ConnectionType;
  style?: 'solid' | 'dashed' | 'dotted' | 'curved';
  color?: string;
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
  name: string; // Tree name (independent from node titles)
  rootNodeId: string;
  nodes: Record<string, ChatNode>; // nodeId -> ChatNode
  connections?: Connection[]; // Custom connections
  createdAt: string;
  updatedAt: string;
}

export interface ExtensionState {
  trees: Record<string, ChatTree>; // treeId -> ChatTree
  currentTreeId: string | null;
  currentNodeId: string | null;
  sidebarVisible: boolean;
  graphSidebarVisible: boolean;

  // Backend integration settings
  backendUrl?: string; // Optional Arbor backend URL
  apiKey?: string; // Optional API key for backend
  provider?: AIProvider; // Default provider for new conversations
  model?: string; // Default model
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
  renameChat(chatUrl: string, newTitle: string): Promise<boolean>;

  // Get provider info for backend integration
  getProviderInfo(): { platform: PlatformName; provider: AIProvider };
}

// Backend API integration types
export interface ArborBackendAPI {
  baseUrl: string;
  provider: AIProvider;
  apiKey?: string;
  model?: string;
}

export interface BackendMessage {
  userMessage: {
    id: string;
    role: 'user';
    content: string;
    timestamp: string;
  };
  assistantMessage: {
    id: string;
    role: 'assistant';
    content: string;
    timestamp: string;
  };
  updatedTitle: string;
}
