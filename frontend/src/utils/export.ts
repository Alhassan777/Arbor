import type { ConversationTree, ConversationNode } from '../types';

export function exportAsJSON(tree: ConversationTree): void {
  const jsonString = JSON.stringify(tree, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `conversation-${tree.id}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAsMarkdown(tree: ConversationTree, currentNodeId: string): void {
  const markdown = generateMarkdownFromTree(tree, currentNodeId);
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `conversation-${tree.id}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function generateMarkdownFromTree(tree: ConversationTree, currentNodeId: string): string {
  const currentNode = tree.nodes[currentNodeId];
  if (!currentNode) return '';

  // Build path from root to current node
  const path: ConversationNode[] = [];
  let nodeId: string | null = currentNodeId;

  while (nodeId) {
    const node: ConversationNode | undefined = tree.nodes[nodeId];
    if (!node) break;
    path.unshift(node);
    nodeId = node.parentId;
  }

  // Generate markdown
  let markdown = `# ${currentNode.title}\n\n`;
  markdown += `**Conversation ID:** ${tree.id}\n`;
  const rootNode = tree.nodes[tree.rootNodeId];
  if (rootNode) {
    markdown += `**Created:** ${new Date(rootNode.createdAt).toLocaleString()}\n\n`;
  }
  markdown += `---\n\n`;

  // Add conversation path if there are branches
  if (path.length > 1) {
    markdown += `## Conversation Path\n\n`;
    path.forEach((node, index) => {
      const indent = '  '.repeat(index);
      markdown += `${indent}${index + 1}. ${node.title}\n`;
    });
    markdown += `\n---\n\n`;
  }

  // Add all messages from the current conversation thread
  markdown += `## Messages\n\n`;

  for (const node of path) {
    if (node.messages.length > 0) {
      if (path.length > 1 && node.id !== currentNodeId) {
        markdown += `### From: ${node.title}\n\n`;
      }

      for (const message of node.messages) {
        const role = message.role === 'user' ? '👤 User' : '🤖 Assistant';
        const timestamp = new Date(message.timestamp).toLocaleString();

        markdown += `**${role}** *${timestamp}*\n\n`;
        markdown += `${message.content}\n\n`;
        markdown += `---\n\n`;
      }
    }
  }

  // Add summary if exists
  if (currentNode.summary) {
    markdown += `## Conversation Summary\n\n`;
    markdown += `${currentNode.summary}\n\n`;
  }

  // Add metadata about branches
  const childNodes = Object.values(tree.nodes).filter(n => n.parentId === currentNodeId);
  if (childNodes.length > 0) {
    markdown += `## Available Branches\n\n`;
    childNodes.forEach(child => {
      markdown += `- ${child.title}`;
      if (child.branchSelectedText) {
        markdown += ` (branched from selection: "${child.branchSelectedText.substring(0, 50)}...")`;
      }
      markdown += `\n`;
    });
  }

  return markdown;
}
