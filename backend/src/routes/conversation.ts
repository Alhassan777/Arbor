import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import {
  getProviderService,
  detectProvider,
  validateApiKey,
  getDefaultModel,
} from "../services/providerFactory";
import { AIProvider } from "../types/providers";
import type { CreateBranchRequest, SendMessageRequest } from "../types";

const router = Router();
const prisma = new PrismaClient();

/**
 * Helper to normalize API key - treat empty strings as undefined to use .env fallback
 * Validates API key format for the specified provider
 */
function getApiKey(
  headerValue: string | undefined,
  provider: AIProvider
): string | undefined {
  if (!headerValue) return undefined;

  const trimmed = headerValue.trim();

  // If empty or too short, ignore it
  if (!trimmed || trimmed.length < 20) {
    return undefined;
  }

  // Validate against provider-specific format
  if (!validateApiKey(trimmed, provider)) {
    return undefined;
  }

  return trimmed;
}


// Create new root conversation
router.post("/conversation", async (req, res) => {
  try {
    const { name } = req.body;

    // Use transaction to handle circular dependency between tree and node
    const result = await prisma.$transaction(async (tx) => {
      // First create the tree with a temporary rootNodeId (will be updated)
      const treeId = randomUUID();
      const tempRootNodeId = randomUUID();

      // Create the tree
      await tx.conversationTree.create({
        data: {
          id: treeId,
          name: name || "New Tree",
          rootNodeId: tempRootNodeId, // Temporary, will be updated
        },
      });

      // Create the root node
      const rootNode = await tx.conversationNode.create({
        data: {
          id: tempRootNodeId,
          title: "New Conversation",
          treeId: treeId,
        },
      });

      // Update the tree with the actual rootNodeId
      await tx.conversationTree.update({
        where: { id: treeId },
        data: { rootNodeId: rootNode.id },
      });

      // Fetch the complete tree with all relations
      return await tx.conversationTree.findUnique({
        where: { id: treeId },
        include: {
          nodes: {
            include: {
              messages: true,
            },
          },
        },
      });
    });

    if (!result) {
      throw new Error("Failed to create conversation tree");
    }

    // Format response
    const formattedTree = {
      id: result.id,
      name: result.name,
      rootNodeId: result.rootNodeId,
      nodes: result.nodes.reduce((acc, node) => {
        acc[node.id] = {
          ...node,
          messages: node.messages,
        };
        return acc;
      }, {} as Record<string, any>),
    };

    res.json(formattedTree);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// Send message and get AI response
router.post("/conversation/:id/message", async (req, res) => {
  let userMessage: any = null;

  try {
    const { id } = req.params;
    const { content } = req.body as SendMessageRequest;

    // Detect provider from headers/model
    const providerHeader = req.headers["x-provider"] as string | undefined;
    const model = req.headers["x-model"] as string | undefined;
    const apiKeyHeader = req.headers["x-api-key"] as string | undefined;

    const detection = detectProvider(providerHeader, model, apiKeyHeader);
    const provider = detection.provider;
    const apiKey = getApiKey(apiKeyHeader, provider);

    // Get the appropriate AI service
    const aiService = getProviderService(provider);

    // Get the conversation node
    const node = await prisma.conversationNode.findUnique({
      where: { id },
      include: { messages: true },
    });

    if (!node) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Create user message
    userMessage = await prisma.message.create({
      data: {
        role: "user",
        content,
        conversationId: id,
      },
    });

    // Get AI response - include branch context if this is a branched conversation
    const allMessages = [...node.messages, userMessage];
    const aiResponse = await aiService.generateResponse(
      allMessages,
      node.summary || undefined,
      apiKey,
      model
    );

    // Create assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        role: "assistant",
        content: aiResponse,
        conversationId: id,
      },
    });

    // Auto-generate title after first exchange (2 messages: user + assistant)
    const messageCount = await prisma.message.count({
      where: { conversationId: id },
    });

    let updatedTitle = node.title;
    if (
      messageCount === 2 &&
      (node.title === "New Conversation" || node.title === "New Branch")
    ) {
      const title = await aiService.generateTitle(
        [...allMessages, assistantMessage],
        apiKey
      );
      await prisma.conversationNode.update({
        where: { id },
        data: { title },
      });
      updatedTitle = title;
    }

    // Return both messages and updated title
    res.json({
      userMessage,
      assistantMessage,
      updatedTitle,
    });
  } catch (error) {
    console.error("Error sending message:", error);

    // Check if error has a status code from Gemini API
    const statusCode = (error as any)?.status || 500;
    const errorMessage = (error as any)?.message || "Failed to send message";

    // Use appropriate status code (preserve 429, 401, 403, etc. from Gemini API)
    // Include userMessage if it was created, so frontend can replace optimistic message
    const errorResponse: any = { error: errorMessage };
    if (userMessage) {
      errorResponse.userMessage = userMessage;
    }

    res
      .status(statusCode >= 400 && statusCode < 600 ? statusCode : 500)
      .json(errorResponse);
  }
});

// Create branch from a message
router.post("/conversation/:id/branch", async (req, res) => {
  try {
    const { id } = req.params;
    const { sourceMessageId, selectedText } = req.body as CreateBranchRequest;

    // Detect provider from headers
    const providerHeader = req.headers["x-provider"] as string | undefined;
    const model = req.headers["x-model"] as string | undefined;
    const apiKeyHeader = req.headers["x-api-key"] as string | undefined;

    const detection = detectProvider(providerHeader, model, apiKeyHeader);
    const provider = detection.provider;
    const apiKey = getApiKey(apiKeyHeader, provider);

    // Get the appropriate AI service
    const aiService = getProviderService(provider);

    // Get parent conversation
    const parentNode = await prisma.conversationNode.findUnique({
      where: { id },
      include: { messages: true },
    });

    if (!parentNode) {
      return res.status(404).json({ error: "Parent conversation not found" });
    }

    // Generate summary of parent conversation
    let summary = null;
    if (parentNode.messages.length > 0) {
      summary = await aiService.generateSummary(parentNode.messages, apiKey);
    }

    // Create system prompt with context
    let contextPrompt = "";
    if (summary) {
      contextPrompt += `Previous conversation summary: ${summary}\n\n`;
    }

    // Include last 5 message pairs from parent
    const recentMessages = parentNode.messages.slice(-10);
    if (recentMessages.length > 0) {
      contextPrompt += "Recent context:\n";
      recentMessages.forEach((msg) => {
        contextPrompt += `${msg.role}: ${msg.content}\n`;
      });
      contextPrompt += "\n";
    }

    if (selectedText) {
      contextPrompt += `The user wants to focus on: "${selectedText}"\n`;
    }

    // All branches start with a clean title
    // The title will be auto-generated after messages are sent
    const branchTitle = "New Branch";

    // Create new branch node
    const newNode = await prisma.conversationNode.create({
      data: {
        title: branchTitle,
        parentId: id,
        branchSourceMessageId: sourceMessageId || null,
        branchSelectedText: selectedText || null,
        summary: contextPrompt,
        treeId: parentNode.treeId,
      },
      include: {
        messages: true,
      },
    });

    res.json(newNode);
  } catch (error) {
    console.error("Error creating branch:", error);
    res.status(500).json({ error: "Failed to create branch" });
  }
});

// Get full conversation tree
router.get("/tree/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const tree = await prisma.conversationTree.findUnique({
      where: { id },
      include: {
        nodes: {
          include: {
            messages: true,
          },
        },
      },
    });

    if (!tree) {
      return res.status(404).json({ error: "Tree not found" });
    }

    // Format response
    const formattedTree = {
      id: tree.id,
      name: tree.name,
      rootNodeId: tree.rootNodeId,
      nodes: tree.nodes.reduce((acc, node) => {
        acc[node.id] = {
          ...node,
          messages: node.messages,
        };
        return acc;
      }, {} as Record<string, any>),
    };

    res.json(formattedTree);
  } catch (error) {
    console.error("Error fetching tree:", error);
    res.status(500).json({ error: "Failed to fetch tree" });
  }
});

// Update conversation (e.g., title)
router.put("/conversation/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedNode = await prisma.conversationNode.update({
      where: { id },
      data: updates,
      include: { messages: true },
    });

    res.json(updatedNode);
  } catch (error) {
    console.error("Error updating conversation:", error);
    res.status(500).json({ error: "Failed to update conversation" });
  }
});

// Update tree (e.g., name)
router.put("/tree/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: "Invalid tree name" });
    }

    const updatedTree = await prisma.conversationTree.update({
      where: { id },
      data: { name: name.trim() },
    });

    res.json(updatedTree);
  } catch (error) {
    console.error("Error updating tree:", error);
    res.status(500).json({ error: "Failed to update tree" });
  }
});

// Delete conversation and children
router.delete("/conversation/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Prisma will cascade delete children automatically
    await prisma.conversationNode.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

// Move conversation node to a new parent
router.put("/conversation/:id/move", async (req, res) => {
  try {
    const { id } = req.params;
    const { newParentId, newTreeId } = req.body;

    // Validate the node exists
    const node = await prisma.conversationNode.findUnique({
      where: { id },
      include: { tree: true },
    });

    if (!node) {
      return res.status(404).json({ error: "Node not found" });
    }

    // Prevent moving root node
    if (node.id === node.tree.rootNodeId) {
      return res.status(400).json({ error: "Cannot move root node" });
    }

    // If newParentId is provided, validate it exists
    if (newParentId) {
      const newParent = await prisma.conversationNode.findUnique({
        where: { id: newParentId },
      });

      if (!newParent) {
        return res.status(404).json({ error: "New parent node not found" });
      }

      // Prevent circular reference - check if newParent is a descendant of node
      let checkNode = newParent;
      while (checkNode.parentId) {
        if (checkNode.parentId === id) {
          return res.status(400).json({
            error: "Cannot move node to its own descendant"
          });
        }
        const parent = await prisma.conversationNode.findUnique({
          where: { id: checkNode.parentId },
        });
        if (!parent) break;
        checkNode = parent;
      }
    }

    // Determine the target treeId
    const targetTreeId = newTreeId || (newParentId ?
      (await prisma.conversationNode.findUnique({ where: { id: newParentId } }))?.treeId :
      node.treeId);

    if (!targetTreeId) {
      return res.status(400).json({ error: "Invalid tree configuration" });
    }

    // Move the node (and all descendants will move with it due to the tree structure)
    const updatedNode = await prisma.conversationNode.update({
      where: { id },
      data: {
        parentId: newParentId,
        treeId: targetTreeId,
      },
      include: {
        messages: true,
      },
    });

    // Update all descendants to the new treeId if tree changed
    if (node.treeId !== targetTreeId) {
      const updateDescendantsTreeId = async (nodeId: string) => {
        const children = await prisma.conversationNode.findMany({
          where: { parentId: nodeId },
        });

        for (const child of children) {
          await prisma.conversationNode.update({
            where: { id: child.id },
            data: { treeId: targetTreeId },
          });
          await updateDescendantsTreeId(child.id);
        }
      };

      await updateDescendantsTreeId(id);
    }

    res.json(updatedNode);
  } catch (error) {
    console.error("Error moving conversation:", error);
    res.status(500).json({ error: "Failed to move conversation" });
  }
});

// Generate summary for a conversation
router.post("/conversation/:id/summarize", async (req, res) => {
  try {
    const { id } = req.params;

    // Detect provider from headers
    const providerHeader = req.headers["x-provider"] as string | undefined;
    const model = req.headers["x-model"] as string | undefined;
    const apiKeyHeader = req.headers["x-api-key"] as string | undefined;

    const detection = detectProvider(providerHeader, model, apiKeyHeader);
    const provider = detection.provider;
    const apiKey = getApiKey(apiKeyHeader, provider);

    // Get the appropriate AI service
    const aiService = getProviderService(provider);

    const node = await prisma.conversationNode.findUnique({
      where: { id },
      include: { messages: true },
    });

    if (!node) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const summary = await aiService.generateSummary(node.messages, apiKey);

    await prisma.conversationNode.update({
      where: { id },
      data: { summary },
    });

    res.json({ summary });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

// Generate connection label using AI
router.post("/ai/label-connection", async (req, res) => {
  try {
    const { prompt } = req.body;

    // Detect provider from headers
    const providerHeader = req.headers["x-provider"] as string | undefined;
    const model = req.headers["x-model"] as string | undefined;
    const apiKeyHeader = req.headers["x-api-key"] as string | undefined;

    const detection = detectProvider(providerHeader, model, apiKeyHeader);
    const provider = detection.provider;
    const apiKey = getApiKey(apiKeyHeader, provider);

    // Get the appropriate AI service
    const aiService = getProviderService(provider);

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const result = await aiService.generateConnectionLabel(prompt, apiKey);
    res.json(result);
  } catch (error) {
    console.error("Error generating connection label:", error);
    res.status(500).json({ error: "Failed to generate connection label" });
  }
});

// Get connection labels for a tree
router.get("/tree/:id/connection-labels", async (req, res) => {
  try {
    const { id } = req.params;

    const labels = await prisma.connectionLabel.findMany({
      where: { treeId: id },
    });

    res.json(labels);
  } catch (error) {
    console.error("Error fetching connection labels:", error);
    res.status(500).json({ error: "Failed to fetch connection labels" });
  }
});

// Create or update connection label
router.post("/connection-label", async (req, res) => {
  try {
    const { connectionId, treeId, type, text, aiGenerated, userEdited } =
      req.body;

    const label = await prisma.connectionLabel.upsert({
      where: { connectionId },
      create: {
        connectionId,
        treeId,
        type,
        text,
        aiGenerated: aiGenerated ?? true,
        userEdited: userEdited ?? false,
      },
      update: {
        type,
        text,
        userEdited: userEdited ?? true,
      },
    });

    res.json(label);
  } catch (error) {
    console.error("Error saving connection label:", error);
    res.status(500).json({ error: "Failed to save connection label" });
  }
});

// Get canvas state for a tree
router.get("/tree/:id/canvas-state", async (req, res) => {
  try {
    const { id } = req.params;

    const canvasState = await prisma.canvasState.findUnique({
      where: { treeId: id },
    });

    res.json(canvasState);
  } catch (error) {
    console.error("Error fetching canvas state:", error);
    res.status(500).json({ error: "Failed to fetch canvas state" });
  }
});

// Save canvas state
router.post("/canvas-state", async (req, res) => {
  try {
    const { treeId, userAnnotations, nodePositionOverrides } = req.body;

    const canvasState = await prisma.canvasState.upsert({
      where: { treeId },
      create: {
        treeId,
        userAnnotations,
        nodePositionOverrides,
      },
      update: {
        userAnnotations,
        nodePositionOverrides,
      },
    });

    res.json(canvasState);
  } catch (error) {
    console.error("Error saving canvas state:", error);
    res.status(500).json({ error: "Failed to save canvas state" });
  }
});

export default router;
