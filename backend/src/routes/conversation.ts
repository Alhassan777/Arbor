import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateResponse, generateTitle, generateSummary } from '../services/claude';
import type { CreateBranchRequest, SendMessageRequest } from '../types';

const router = Router();
const prisma = new PrismaClient();

// Create new root conversation
router.post('/conversation', async (_req, res) => {
  try {
    const tree = await prisma.conversationTree.create({
      data: {
        nodes: {
          create: {
            title: 'New Conversation',
          },
        },
      },
      include: {
        nodes: {
          include: {
            messages: true,
          },
        },
      },
    });

    // Set the rootNodeId to the first node
    const rootNode = tree.nodes[0];
    await prisma.conversationTree.update({
      where: { id: tree.id },
      data: { rootNodeId: rootNode.id },
    });

    // Format response
    const formattedTree = {
      id: tree.id,
      rootNodeId: rootNode.id,
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
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Send message and get AI response
router.post('/conversation/:id/message', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body as SendMessageRequest;
    const apiKey = req.headers['x-api-key'] as string | undefined;
    const model = req.headers['x-model'] as string | undefined;

    // Get the conversation node
    const node = await prisma.conversationNode.findUnique({
      where: { id },
      include: { messages: true },
    });

    if (!node) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Create user message
    const userMessage = await prisma.message.create({
      data: {
        role: 'user',
        content,
        conversationId: id,
      },
    });

    // Get AI response
    const allMessages = [...node.messages, userMessage];
    const aiResponse = await generateResponse(allMessages, undefined, apiKey, model);

    // Create assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        role: 'assistant',
        content: aiResponse,
        conversationId: id,
      },
    });

    // Auto-generate title if this is the second exchange
    const messageCount = await prisma.message.count({
      where: { conversationId: id },
    });

    if (messageCount >= 4 && node.title === 'New Conversation') {
      const title = await generateTitle([...allMessages, assistantMessage], apiKey);
      await prisma.conversationNode.update({
        where: { id },
        data: { title },
      });
    }

    res.json(assistantMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Create branch from a message
router.post('/conversation/:id/branch', async (req, res) => {
  try {
    const { id } = req.params;
    const { sourceMessageId, selectedText } = req.body as CreateBranchRequest;
    const apiKey = req.headers['x-api-key'] as string | undefined;

    // Get parent conversation
    const parentNode = await prisma.conversationNode.findUnique({
      where: { id },
      include: { messages: true },
    });

    if (!parentNode) {
      return res.status(404).json({ error: 'Parent conversation not found' });
    }

    // Generate summary of parent conversation
    let summary = null;
    if (parentNode.messages.length > 0) {
      summary = await generateSummary(parentNode.messages, apiKey);
    }

    // Create system prompt with context
    let contextPrompt = '';
    if (summary) {
      contextPrompt += `Previous conversation summary: ${summary}\n\n`;
    }

    // Include last 5 message pairs from parent
    const recentMessages = parentNode.messages.slice(-10);
    if (recentMessages.length > 0) {
      contextPrompt += 'Recent context:\n';
      recentMessages.forEach(msg => {
        contextPrompt += `${msg.role}: ${msg.content}\n`;
      });
      contextPrompt += '\n';
    }

    if (selectedText) {
      contextPrompt += `The user wants to focus on: "${selectedText}"\n`;
    }

    // Create new branch node
    const newNode = await prisma.conversationNode.create({
      data: {
        title: selectedText
          ? `Branch: ${selectedText.substring(0, 30)}...`
          : 'New Branch',
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
    console.error('Error creating branch:', error);
    res.status(500).json({ error: 'Failed to create branch' });
  }
});

// Get full conversation tree
router.get('/tree/:id', async (req, res) => {
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
      return res.status(404).json({ error: 'Tree not found' });
    }

    // Format response
    const formattedTree = {
      id: tree.id,
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
    console.error('Error fetching tree:', error);
    res.status(500).json({ error: 'Failed to fetch tree' });
  }
});

// Update conversation (e.g., title)
router.put('/conversation/:id', async (req, res) => {
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
    console.error('Error updating conversation:', error);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});

// Delete conversation and children
router.delete('/conversation/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prisma will cascade delete children automatically
    await prisma.conversationNode.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// Generate summary for a conversation
router.post('/conversation/:id/summarize', async (req, res) => {
  try {
    const { id } = req.params;
    const apiKey = req.headers['x-api-key'] as string | undefined;

    const node = await prisma.conversationNode.findUnique({
      where: { id },
      include: { messages: true },
    });

    if (!node) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const summary = await generateSummary(node.messages, apiKey);

    await prisma.conversationNode.update({
      where: { id },
      data: { summary },
    });

    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

export default router;
