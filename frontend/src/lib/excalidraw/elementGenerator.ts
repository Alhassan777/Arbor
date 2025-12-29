import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import type { ConversationNode, ConversationTree } from '../../types';

// Custom metadata we attach to elements
export interface NodeElementMetadata {
  type: 'conversation-node';
  conversationId: string;
}

export interface ConnectionElementMetadata {
  type: 'connection-arrow';
  connectionId: string;
  fromNodeId: string;
  toNodeId: string;
}

export interface ConnectionLabelMetadata {
  type: 'connection-label';
  connectionId: string;
}

export interface UserAnnotationMetadata {
  type: 'user-annotation';
}

// Position tracking for layout
export interface NodePosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

/**
 * Truncate title to fit in node
 */
function truncateTitle(title: string, maxLength: number): string {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength - 3) + '...';
}

/**
 * Generate random seed for Excalidraw element
 */
function generateSeed(): number {
  return Math.floor(Math.random() * 100000);
}

/**
 * Create Excalidraw elements for a conversation node (rectangle + text)
 */
export function createNodeElements(
  node: ConversationNode,
  position: { x: number; y: number },
  isActive: boolean
): ExcalidrawElement[] {
  const seed = generateSeed();

  // Create rectangle for node
  const rectangle: ExcalidrawElement = {
    id: `node-rect-${node.id}`,
    type: 'rectangle',
    x: position.x,
    y: position.y,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    angle: 0,
    strokeColor: isActive ? '#6366f1' : '#3f3f46',
    backgroundColor: isActive ? 'rgba(99, 102, 241, 0.1)' : '#18181b',
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 0, // 0 = clean lines, 1+ = hand-drawn look
    opacity: 100,
    roundness: { type: 3, value: 12 }, // rounded corners
    seed,
    version: 1,
    versionNonce: generateSeed(),
    isDeleted: false,
    boundElements: [{ id: `node-text-${node.id}`, type: 'text' }],
    locked: false,
    customData: {
      type: 'conversation-node',
      conversationId: node.id,
    } as NodeElementMetadata,
  } as ExcalidrawElement;

  // Create text label for node title
  const textLabel: ExcalidrawElement = {
    id: `node-text-${node.id}`,
    type: 'text',
    x: position.x + 16,
    y: position.y + NODE_HEIGHT / 2 - 10,
    width: NODE_WIDTH - 32,
    height: 20,
    angle: 0,
    strokeColor: '#f1f1f4',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 1,
    strokeStyle: 'solid',
    roughness: 0,
    opacity: 100,
    seed: generateSeed(),
    version: 1,
    versionNonce: generateSeed(),
    isDeleted: false,
    boundElements: null,
    locked: false,
    text: truncateTitle(node.title, 25),
    fontSize: 16,
    fontFamily: 1, // 1 = Helvetica, 2 = Virgil (hand-drawn), 3 = Cascadia (mono)
    textAlign: 'center',
    verticalAlign: 'middle',
    containerId: `node-rect-${node.id}`,
    originalText: node.title,
    customData: {
      type: 'conversation-node',
      conversationId: node.id,
    } as NodeElementMetadata,
  } as ExcalidrawElement;

  return [rectangle, textLabel];
}

/**
 * Create Excalidraw elements for a connection arrow and label
 */
export function createConnectionElements(
  fromNode: NodePosition,
  toNode: NodePosition,
  connectionLabel: string,
  connectionId: string
): ExcalidrawElement[] {
  // Calculate arrow start and end points
  const startX = fromNode.x + fromNode.width / 2;
  const startY = fromNode.y + fromNode.height;
  const endX = toNode.x + toNode.width / 2;
  const endY = toNode.y;

  // Create arrow
  const arrow: ExcalidrawElement = {
    id: `connection-arrow-${connectionId}`,
    type: 'arrow',
    x: startX,
    y: startY,
    width: endX - startX,
    height: endY - startY,
    angle: 0,
    strokeColor: '#6366f1',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 0,
    opacity: 70,
    seed: generateSeed(),
    version: 1,
    versionNonce: generateSeed(),
    isDeleted: false,
    boundElements: null,
    locked: false,
    points: [
      [0, 0],
      [endX - startX, endY - startY],
    ],
    startBinding: {
      elementId: `node-rect-${fromNode.id}`,
      focus: 0,
      gap: 4,
    },
    endBinding: {
      elementId: `node-rect-${toNode.id}`,
      focus: 0,
      gap: 4,
    },
    startArrowhead: null,
    endArrowhead: 'arrow',
    customData: {
      type: 'connection-arrow',
      connectionId,
      fromNodeId: fromNode.id,
      toNodeId: toNode.id,
    } as ConnectionElementMetadata,
  } as ExcalidrawElement;

  // Create label for connection (positioned at midpoint)
  const labelX = startX + (endX - startX) / 2 - 40;
  const labelY = startY + (endY - startY) / 2 - 10;

  const label: ExcalidrawElement = {
    id: `connection-label-${connectionId}`,
    type: 'text',
    x: labelX,
    y: labelY,
    width: 80,
    height: 20,
    angle: 0,
    strokeColor: '#a1a1aa',
    backgroundColor: '#0a0a0f',
    fillStyle: 'solid',
    strokeWidth: 1,
    strokeStyle: 'solid',
    roughness: 0,
    opacity: 100,
    seed: generateSeed(),
    version: 1,
    versionNonce: generateSeed(),
    isDeleted: false,
    boundElements: null,
    locked: false,
    text: connectionLabel,
    fontSize: 12,
    fontFamily: 1,
    textAlign: 'center',
    verticalAlign: 'middle',
    containerId: null,
    originalText: connectionLabel,
    customData: {
      type: 'connection-label',
      connectionId,
    } as ConnectionLabelMetadata,
  } as ExcalidrawElement;

  return [arrow, label];
}

/**
 * Check if an element is user-created (not generated by the app)
 */
export function isUserAnnotation(element: ExcalidrawElement): boolean {
  if (!element.customData) return true; // No metadata = user created

  const metadata = element.customData as any;
  return metadata.type === 'user-annotation' ||
         (metadata.type !== 'conversation-node' &&
          metadata.type !== 'connection-arrow' &&
          metadata.type !== 'connection-label');
}

/**
 * Filter elements to get only user annotations
 */
export function getUserAnnotations(elements: readonly ExcalidrawElement[]): ExcalidrawElement[] {
  return elements.filter(isUserAnnotation);
}
