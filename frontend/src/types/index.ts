export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ConversationNode {
  id: string;
  title: string;
  parentId: string | null;
  branchSourceMessageId: string | null;
  branchSelectedText: string | null;
  messages: Message[];
  summary: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationTree {
  id: string;
  rootNodeId: string;
  nodes: Record<string, ConversationNode>;
}

export interface CreateBranchRequest {
  sourceMessageId?: string;
  selectedText?: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface SendMessageResponse {
  message: Message;
}
