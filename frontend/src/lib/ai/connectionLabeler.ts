import type { ConversationNode, ConnectionLabel, ConnectionLabelType } from '../../types';

/**
 * Get last N messages from a conversation for context
 */
function getLastMessages(node: ConversationNode, count: number): string {
  const messages = node.messages.slice(-count);
  return messages.map((msg) => `${msg.role}: ${msg.content}`).join('\n\n');
}

/**
 * Generate a connection label using AI
 */
export async function generateConnectionLabel(
  parentNode: ConversationNode,
  childNode: ConversationNode,
  branchSelectedText?: string
): Promise<Omit<ConnectionLabel, 'id' | 'createdAt' | 'updatedAt'>> {
  const parentContext = parentNode.summary || getLastMessages(parentNode, 3);
  const childContext = childNode.summary || getLastMessages(childNode, 3);

  const prompt = `You are analyzing the relationship between two conversations in a branching chat application.

PARENT CONVERSATION SUMMARY:
${parentContext}

CHILD CONVERSATION (branched from parent):
${childContext}

${branchSelectedText ? `The user specifically branched from this text: "${branchSelectedText}"` : ''}

Analyze the semantic relationship between these conversations. Choose the most appropriate relationship type and provide a short label (2-4 words).

Relationship types:
- deepens: Child goes deeper into the same topic
- explores: Child explores a specific sub-concept mentioned in parent
- contrasts: Child examines an opposite or alternative perspective
- examples: Child looks at specific examples or case studies
- applies: Child applies a concept to a specific situation
- questions: Child questions or challenges something from parent
- extends: Child extends discussion to a related but different topic
- summarizes: Child consolidates or summarizes parent content

Respond in JSON format:
{
  "type": "<relationship_type>",
  "label": "<short 2-4 word label>"
}

Examples of good labels:
- "deepens → technical details"
- "explores → chunking strategies"
- "contrasts → alternative approach"
- "applies → healthcare use case"`;

  try {
    const response = await fetch('/api/ai/label-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate connection label');
    }

    const data = await response.json();

    return {
      connectionId: `${parentNode.id}-${childNode.id}`,
      treeId: '', // Will be set by caller
      type: data.type as ConnectionLabelType,
      text: data.label,
      aiGenerated: true,
      userEdited: false,
    };
  } catch (error) {
    console.error('Error generating connection label:', error);
    // Return default label on error
    return {
      connectionId: `${parentNode.id}-${childNode.id}`,
      treeId: '',
      type: 'extends',
      text: 'branch',
      aiGenerated: false,
      userEdited: false,
    };
  }
}

/**
 * Get a human-readable description of a connection label type
 */
export function getConnectionTypeDescription(type: ConnectionLabelType): string {
  const descriptions: Record<ConnectionLabelType, string> = {
    deepens: 'Goes deeper into the topic',
    explores: 'Explores a specific sub-concept',
    contrasts: 'Examines opposite perspective',
    examples: 'Provides specific examples',
    applies: 'Applies concept to situation',
    questions: 'Questions or challenges idea',
    extends: 'Extends to related topic',
    summarizes: 'Summarizes discussion',
    custom: 'Custom relationship',
  };

  return descriptions[type] || 'Related conversation';
}
