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

// Connection label types
export type ConnectionLabelType =
  | 'deepens'      // Child goes deeper into parent topic
  | 'explores'     // Child explores a sub-concept
  | 'contrasts'    // Child examines opposite perspective
  | 'examples'     // Child provides examples of parent concept
  | 'applies'      // Child applies parent concept to specific case
  | 'questions'    // Child questions or challenges parent
  | 'extends'      // Child extends to related topic
  | 'summarizes'   // Child summarizes parent
  | 'custom';      // User-defined label

export interface ConnectionLabel {
  id: string;
  connectionId: string; // Format: "parentId-childId"
  treeId: string;
  type: ConnectionLabelType;
  text: string; // The actual display text
  aiGenerated: boolean;
  userEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Canvas state for user annotations and custom positions
export interface CanvasState {
  id: string;
  treeId: string;
  userAnnotations: any[]; // ExcalidrawElement[] serialized
  nodePositionOverrides: Record<string, { x: number; y: number }>;
  createdAt: Date;
  updatedAt: Date;
}
