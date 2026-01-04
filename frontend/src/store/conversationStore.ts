import { create } from "zustand";
import type { ConversationTree, ConversationNode, Message } from "../types";
import { api } from "../api/client";
import { useSettingsStore } from "./settingsStore";
import { generateConnectionLabel } from "../lib/ai/connectionLabeler";
import { getUserFriendlyErrorMessage } from "../utils/errorMessages";

// Helper function to extract and translate error messages
function handleError(error: unknown): string {
  const statusCode = (error as any)?.statusCode || 500;
  const errorMessage =
    (error as any)?.message ||
    (error instanceof Error ? error.message : "Unknown error");
  return getUserFriendlyErrorMessage(statusCode, errorMessage);
}

// Helper function to generate and save connection label
async function generateAndSaveConnectionLabel(
  parentNode: ConversationNode,
  childNode: ConversationNode,
  treeId: string,
  selectedText?: string
): Promise<void> {
  try {
    // Generate label using AI
    const labelData = await generateConnectionLabel(
      parentNode,
      childNode,
      selectedText
    );
    labelData.treeId = treeId;

    // Save to backend
    await fetch("/api/connection-label", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(labelData),
    });
  } catch (error) {
    console.error("Error generating/saving connection label:", error);
  }
}

interface ConversationState {
  tree: ConversationTree | null;
  currentNodeId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeNewTree: (name?: string) => Promise<void>;
  loadTree: (treeId: string) => Promise<void>;
  setCurrentNode: (nodeId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  retryMessage: (errorMessageId: string) => Promise<void>;
  createBranch: (
    sourceMessageId?: string,
    selectedText?: string
  ) => Promise<string>;
  updateNodeTitle: (nodeId: string, title: string) => Promise<void>;
  updateTreeName: (name: string) => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
  moveNode: (nodeId: string, newParentId: string | null) => Promise<void>;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  tree: null,
  currentNodeId: null,
  isLoading: false,
  error: null,

  initializeNewTree: async (name?: string) => {
    set({ isLoading: true, error: null });
    try {
      const { provider, apiKey, model } = useSettingsStore.getState();
      const tree = await api.createConversation(provider, apiKey, model, name);
      set({
        tree,
        currentNodeId: tree.rootNodeId,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: handleError(error),
        isLoading: false,
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
        isLoading: false,
      });
    } catch (error) {
      set({
        error: handleError(error),
        isLoading: false,
      });
    }
  },

  setCurrentNode: (nodeId: string) => {
    set({ currentNodeId: nodeId });
  },

  sendMessage: async (content: string) => {
    const { currentNodeId, tree } = get();
    if (!currentNodeId || !tree) return;

    // Create optimistic user message
    const optimisticUserMessage: Message = {
      id: `temp-${Date.now()}-${Math.random()}`,
      role: "user",
      content: content,
      timestamp: new Date(),
    };

    // Immediately add the user message to the UI (optimistic update)
    const updatedNodes = { ...tree.nodes };
    const currentNode = updatedNodes[currentNodeId];
    if (currentNode) {
      updatedNodes[currentNodeId] = {
        ...currentNode,
        messages: [...currentNode.messages, optimisticUserMessage],
      };
    }

    set({
      tree: { ...tree, nodes: updatedNodes },
      isLoading: true,
      error: null,
    });

    try {
      const { provider, apiKey, model } = useSettingsStore.getState();
      const { userMessage, assistantMessage, updatedTitle } =
        await api.sendMessage(currentNodeId, content, provider, apiKey, model);

      // Replace optimistic message with real messages from backend
      const currentState = get();
      const finalNodes = { ...currentState.tree!.nodes };
      const finalNode = finalNodes[currentNodeId];
      if (finalNode) {
        // Remove the optimistic message and add the real ones
        const messagesWithoutOptimistic = finalNode.messages.filter(
          (msg) => msg.id !== optimisticUserMessage.id
        );
        finalNodes[currentNodeId] = {
          ...finalNode,
          messages: [
            ...messagesWithoutOptimistic,
            userMessage,
            assistantMessage,
          ],
          title: updatedTitle,
        };
      }

      set({
        tree: { ...currentState.tree!, nodes: finalNodes },
        isLoading: false,
      });
    } catch (error: any) {
      const userFriendlyMessage = handleError(error);

      // Check if backend returned a saved userMessage (happens when error occurs after message is saved)
      const savedUserMessage = error?.userMessage;

      // Create an error assistant message
      const errorAssistantMessage: Message = {
        id: `error-${Date.now()}-${Math.random()}`,
        role: "assistant",
        content: userFriendlyMessage,
        timestamp: new Date(),
      };

      // Keep the optimistic user message and add error as assistant message
      const currentState = get();
      const errorNodes = { ...currentState.tree!.nodes };
      const errorNode = errorNodes[currentNodeId];
      if (errorNode) {
        // If backend returned a saved userMessage, replace optimistic with real one
        const messagesWithoutOptimistic = errorNode.messages.filter(
          (msg) => msg.id !== optimisticUserMessage.id
        );

        const finalMessages = savedUserMessage
          ? [
              ...messagesWithoutOptimistic,
              savedUserMessage,
              errorAssistantMessage,
            ]
          : [...errorNode.messages, errorAssistantMessage];

        errorNodes[currentNodeId] = {
          ...errorNode,
          messages: finalMessages,
        };
      }

      set({
        tree: { ...currentState.tree!, nodes: errorNodes },
        error: userFriendlyMessage,
        isLoading: false,
      });
    }
  },

  retryMessage: async (errorMessageId: string) => {
    const { currentNodeId, tree } = get();
    if (!currentNodeId || !tree) return;

    const currentNode = tree.nodes[currentNodeId];
    if (!currentNode) return;

    // Find the error message index
    const errorIndex = currentNode.messages.findIndex(
      (msg) => msg.id === errorMessageId
    );
    if (errorIndex === -1) return;

    // Find the last user message before the error
    let userMessage: Message | null = null;
    for (let i = errorIndex - 1; i >= 0; i--) {
      if (currentNode.messages[i].role === "user") {
        userMessage = currentNode.messages[i];
        break;
      }
    }

    if (!userMessage) return;

    // Remove the error message from the conversation
    const updatedMessages = currentNode.messages.filter(
      (msg) => msg.id !== errorMessageId
    );
    const updatedNodes = {
      ...tree.nodes,
      [currentNodeId]: {
        ...currentNode,
        messages: updatedMessages,
      },
    };

    set({
      tree: { ...tree, nodes: updatedNodes },
      isLoading: true,
      error: null,
    });

    try {
      const { provider, apiKey, model } = useSettingsStore.getState();
      const {
        userMessage: backendUserMessage,
        assistantMessage,
        updatedTitle,
      } = await api.sendMessage(
        currentNodeId,
        userMessage.content,
        provider,
        apiKey,
        model
      );

      // Keep the original user message instead of the backend's new one to avoid duplicates
      const currentState = get();
      const finalNodes = { ...currentState.tree!.nodes };
      const finalNode = finalNodes[currentNodeId];
      if (finalNode) {
        // Remove the backend's userMessage and keep our original one
        const messagesWithoutBackendUser = finalNode.messages.filter(
          (msg) => msg.id !== backendUserMessage.id
        );

        finalNodes[currentNodeId] = {
          ...finalNode,
          messages: [
            ...messagesWithoutBackendUser.filter(
              (msg) => msg.id !== userMessage.id
            ),
            userMessage, // Keep the original user message
            assistantMessage,
          ],
          title: updatedTitle,
        };
      }

      set({
        tree: { ...currentState.tree!, nodes: finalNodes },
        isLoading: false,
      });
    } catch (error: any) {
      const userFriendlyMessage = handleError(error);

      // Create an error assistant message
      const errorAssistantMessage: Message = {
        id: `error-${Date.now()}-${Math.random()}`,
        role: "assistant",
        content: userFriendlyMessage,
        timestamp: new Date(),
      };

      // Add error message back, keeping the original user message
      const currentState = get();
      const errorNodes = { ...currentState.tree!.nodes };
      const errorNode = errorNodes[currentNodeId];
      if (errorNode) {
        errorNodes[currentNodeId] = {
          ...errorNode,
          messages: [...errorNode.messages, errorAssistantMessage],
        };
      }

      set({
        tree: { ...currentState.tree!, nodes: errorNodes },
        error: userFriendlyMessage,
        isLoading: false,
      });
    }
  },

  createBranch: async (sourceMessageId?: string, selectedText?: string) => {
    const { currentNodeId, tree } = get();
    if (!currentNodeId || !tree) return "";

    set({ isLoading: true, error: null });
    try {
      const { provider, apiKey, model } = useSettingsStore.getState();
      const newNode = await api.createBranch(
        currentNodeId,
        {
          sourceMessageId,
          selectedText,
        },
        provider,
        apiKey,
        model
      );

      // Add the new node to the tree
      const updatedNodes = { ...tree.nodes, [newNode.id]: newNode };

      set({
        tree: { ...tree, nodes: updatedNodes },
        currentNodeId: newNode.id,
        isLoading: false,
      });

      // Generate connection label in the background (non-blocking)
      if (tree.id) {
        const parentNode = tree.nodes[currentNodeId];
        generateAndSaveConnectionLabel(
          parentNode,
          newNode,
          tree.id,
          selectedText
        ).catch((err) =>
          console.error("Failed to generate connection label:", err)
        );
      }

      return newNode.id;
    } catch (error) {
      set({
        error: handleError(error),
        isLoading: false,
      });
      return "";
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
        error: handleError(error),
      });
    }
  },

  updateTreeName: async (name: string) => {
    const { tree } = get();
    if (!tree) return;

    try {
      await api.updateTree(tree.id, name);
      set({ tree: { ...tree, name } });
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
        Object.values(updatedNodes).forEach((node) => {
          if (node.parentId === id) {
            removeNodeAndChildren(node.id);
          }
        });
      };
      removeNodeAndChildren(nodeId);

      // If we deleted the current node, switch to root
      const newCurrentId =
        currentNodeId === nodeId ? tree.rootNodeId : currentNodeId;

      set({
        tree: { ...tree, nodes: updatedNodes },
        currentNodeId: newCurrentId,
      });
    } catch (error) {
      set({
        error: handleError(error),
      });
    }
  },

  moveNode: async (nodeId: string, newParentId: string | null) => {
    const { tree } = get();
    if (!tree) return;

    // Prevent moving root node
    if (nodeId === tree.rootNodeId) {
      set({ error: 'Cannot move root node' });
      return;
    }

    // Prevent moving to self
    if (nodeId === newParentId) {
      set({ error: 'Cannot move node to itself' });
      return;
    }

    // Prevent circular reference - check if newParentId is a descendant of nodeId
    if (newParentId) {
      let checkId: string | null = newParentId;
      while (checkId) {
        if (checkId === nodeId) {
          set({ error: 'Cannot move node to its own descendant' });
          return;
        }
        checkId = tree.nodes[checkId]?.parentId || null;
      }
    }

    try {
      const updatedNode = await api.moveNode(nodeId, newParentId);

      // Update the node in the tree
      const updatedNodes = { ...tree.nodes, [nodeId]: updatedNode };
      set({ tree: { ...tree, nodes: updatedNodes } });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },
}));
