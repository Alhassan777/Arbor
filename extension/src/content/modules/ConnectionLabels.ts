import type { ChatTree, ChatNode, ConnectionType } from "../../types";
import { db } from "../db";

export class ConnectionLabelsManager {
  async editConnectionLabel(
    childNodeId: string,
    parentNodeId: string,
    tree: ChatTree,
    treeId: string,
    onSuccess: (parentTitle: string, childTitle: string) => void
  ): Promise<void> {
    const childNode = tree.nodes[childNodeId];
    const parentNode = tree.nodes[parentNodeId];

    if (!childNode || !parentNode) return;

    const currentLabel = childNode.connectionLabel || "none";

    // Show clear dialog with parent → child context
    const message =
      `🏷️ Label Connection\n\n` +
      `From: "${parentNode.title}"\n` +
      `  ↓\n` +
      `To: "${childNode.title}"\n\n` +
      `Options: deepens, explores, contrasts, examples, applies, questions, extends, summarizes, custom\n\n` +
      `Current label: ${currentLabel}\n\n` +
      `Enter new label:`;

    const label = prompt(message, currentLabel);

    if (!label) return;

    childNode.connectionLabel = label as ConnectionType;
    await db.saveTree(tree);
    await db.saveNode(childNode, treeId);

    onSuccess(parentNode.title, childNode.title);
  }
}
