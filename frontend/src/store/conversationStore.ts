import { create } from 'zustand';
import type { ConversationTree } from '../types';
import { api } from '../api/client';
import { useSettingsStore } from './settingsStore';
import { generateConnectionLabel } from '../lib/ai/connectionLabeler';

// Helper function to generate and save connection label
async function generateAndSaveConnectionLabel(
  parentNode: ConversationNode,
  childNode: ConversationNode,
  treeId: string,
  selectedText?: string
): Promise<void> {
  try {
    // Generate label using AI
    const labelData = await generateConnectionLabel(parentNode, childNode, selectedText);
    labelData.treeId = treeId;

    // Save to backend
    await fetch('/api/connection-label', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(labelData),
    });
  } catch (error) {
    console.error('Error generating/saving connection label:', error);
  }
}

interface ConversationState {
  tree: ConversationTree | null;
  currentNodeId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeNewTree: () => Promise<void>;
  loadTree: (treeId: string) => Promise<void>;
  setCurrentNode: (nodeId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  createBranch: (sourceMessageId?: string, selectedText?: string) => Promise<string>;
  updateNodeTitle: (nodeId: string, title: string) => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  tree: null,
  currentNodeId: null,
  isLoading: false,
  error: null,

  initializeNewTree: async () => {
    set({ isLoading: true, error: null });
    try {
      const { apiKey, model } = useSettingsStore.getState();
      const tree = await api.createConversation(apiKey, model);
      set({
        tree,
        currentNodeId: tree.rootNodeId,
        isLoading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      });
    }
  },

  loadTree: async (treeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const tree = await api.getTree(treeId);
      set({
        tree,
        currentNodeId: tree.rootNodeId,
        isLoading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      });
    }
  },

  setCurrentNode: (nodeId: string) => {
    set({ currentNodeId: nodeId });
  },

  sendMessage: async (content: string) => {
    const { currentNodeId, tree } = get();
    if (!currentNodeId || !tree) return;

    set({ isLoading: true, error: null });
    try {
      const { apiKey, model } = useSettingsStore.getState();
      const { userMessage, assistantMessage, updatedTitle } = await api.sendMessage(currentNodeId, content, apiKey, model);

      // Update the tree with both messages and updated title
      const updatedNodes = { ...tree.nodes };
      const currentNode = updatedNodes[currentNodeId];
      if (currentNode) {
        updatedNodes[currentNodeId] = {
          ...currentNode,
          messages: [...currentNode.messages, userMessage, assistantMessage],
          title: updatedTitle,
        };
      }

      set({
        tree: { ...tree, nodes: updatedNodes },
        isLoading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      });
    }
  },

  createBranch: async (sourceMessageId?: string, selectedText?: string) => {
    const { currentNodeId, tree } = get();
    if (!currentNodeId || !tree) return '';

    set({ isLoading: true, error: null });
    try {
      const { apiKey, model } = useSettingsStore.getState();
      const newNode = await api.createBranch(currentNodeId, {
        sourceMessageId,
        selectedText,
      }, apiKey, model);

      // Add the new node to the tree
      const updatedNodes = { ...tree.nodes, [newNode.id]: newNode };

      set({
        tree: { ...tree, nodes: updatedNodes },
        currentNodeId: newNode.id,
        isLoading: false
      });

      // Generate connection label in the background (non-blocking)
      if (tree.id) {
        const parentNode = tree.nodes[currentNodeId];
        generateAndSaveConnectionLabel(parentNode, newNode, tree.id, selectedText).catch(
          (err) => console.error('Failed to generate connection label:', err)
        );
      }

      return newNode.id;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      });
      return '';
    }
  },

  updateNodeTitle: async (nodeId: string, title: string) => {
    const { tree } = get();
    if (!tree) return;

    try {
      const updatedNode = await api.updateConversation(nodeId, { title });

      const updatedNodes = { ...tree.nodes, [nodeId]: updatedNode };
      set({ tree: { ...tree, nodes: updatedNodes } });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  deleteNode: async (nodeId: string) => {
    const { tree, currentNodeId } = get();
    if (!tree) return;

    try {
      await api.deleteConversation(nodeId);

      // Remove node and its children from the tree
      const updatedNodes = { ...tree.nodes };
      const removeNodeAndChildren = (id: string) => {
        delete updatedNodes[id];
        Object.values(updatedNodes).forEach(node => {
          if (node.parentId === id) {
            removeNodeAndChildren(node.id);
          }
        });
      };
      removeNodeAndChildren(nodeId);

      // If we deleted the current node, switch to root
      const newCurrentId = currentNodeId === nodeId ? tree.rootNodeId : currentNodeId;

      set({
        tree: { ...tree, nodes: updatedNodes },
        currentNodeId: newCurrentId
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },
}));
