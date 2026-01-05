import { db } from "../db";
import type { ChatTree, ChatNode } from "../../types";

export class TreeManager {
  async createTree(
    name: string,
    platform: "chatgpt" | "gemini" | "perplexity"
  ): Promise<ChatTree> {
    const treeId = `tree-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const rootNodeId = `node-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const rootNode: ChatNode = {
      id: rootNodeId,
      title: name,
      url: window.location.href,
      platform,
      parentId: null,
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const tree: ChatTree = {
      id: treeId,
      name,
      rootNodeId,
      nodes: {
        [rootNodeId]: rootNode,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.saveTree(tree);
    await db.saveNode(rootNode, treeId);

    return tree;
  }

  async deleteTree(
    treeId: string,
    trees: Record<string, ChatTree>
  ): Promise<string | null> {
    const tree = trees[treeId];
    if (!tree) return null;

    // Delete all nodes
    for (const nodeId of Object.keys(tree.nodes)) {
      await db.deleteNode(nodeId);
    }

    await db.deleteTree(treeId);
    delete trees[treeId];

    // Return next tree ID if available
    const remainingTrees = Object.keys(trees);
    return remainingTrees.length > 0 ? remainingTrees[0] : null;
  }

  async renameTree(
    treeId: string,
    newName: string,
    trees: Record<string, ChatTree>
  ): Promise<void> {
    const tree = trees[treeId];
    if (!tree) return;

    tree.name = newName;
    tree.updatedAt = new Date().toISOString();
    await db.saveTree(tree);
  }
}
