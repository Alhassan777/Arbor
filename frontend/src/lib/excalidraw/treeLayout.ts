import type { ConversationTree } from '../../types';

export interface NodePosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;
const HORIZONTAL_GAP = 60;
const VERTICAL_GAP = 120;

/**
 * Calculate tree layout using a simple hierarchical approach
 * Positions nodes level by level (depth-first)
 */
export function calculateTreeLayout(
  tree: ConversationTree,
  customPositions?: Map<string, { x: number; y: number }>
): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();

  if (!tree || !tree.nodes || !tree.rootNodeId) {
    return positions;
  }

  // Build adjacency list for children
  const childrenMap = new Map<string, string[]>();
  Object.values(tree.nodes).forEach((node) => {
    if (node.parentId) {
      if (!childrenMap.has(node.parentId)) {
        childrenMap.set(node.parentId, []);
      }
      childrenMap.get(node.parentId)!.push(node.id);
    }
  });

  // Calculate subtree widths for centering
  const subtreeWidths = new Map<string, number>();

  function calculateSubtreeWidth(nodeId: string): number {
    if (subtreeWidths.has(nodeId)) {
      return subtreeWidths.get(nodeId)!;
    }

    const children = childrenMap.get(nodeId) || [];
    if (children.length === 0) {
      subtreeWidths.set(nodeId, NODE_WIDTH);
      return NODE_WIDTH;
    }

    const childrenWidth = children.reduce((sum, childId) => {
      return sum + calculateSubtreeWidth(childId);
    }, 0);

    const totalWidth = childrenWidth + (children.length - 1) * HORIZONTAL_GAP;
    subtreeWidths.set(nodeId, Math.max(totalWidth, NODE_WIDTH));
    return totalWidth;
  }

  // Calculate all subtree widths starting from root
  calculateSubtreeWidth(tree.rootNodeId);

  // Position nodes recursively
  function positionNode(
    nodeId: string,
    x: number,
    y: number,
    availableWidth: number
  ): void {
    // Check if custom position exists
    if (customPositions?.has(nodeId)) {
      const custom = customPositions.get(nodeId)!;
      positions.set(nodeId, {
        id: nodeId,
        x: custom.x,
        y: custom.y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      });
    } else {
      // Center node in available width
      const nodeX = x + (availableWidth - NODE_WIDTH) / 2;
      positions.set(nodeId, {
        id: nodeId,
        x: nodeX,
        y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      });
    }

    // Position children
    const children = childrenMap.get(nodeId) || [];
    if (children.length === 0) return;

    const childY = y + NODE_HEIGHT + VERTICAL_GAP;
    let currentX = x;

    children.forEach((childId) => {
      const childWidth = subtreeWidths.get(childId) || NODE_WIDTH;
      positionNode(childId, currentX, childY, childWidth);
      currentX += childWidth + HORIZONTAL_GAP;
    });
  }

  // Start positioning from root
  const rootWidth = subtreeWidths.get(tree.rootNodeId) || NODE_WIDTH;
  positionNode(tree.rootNodeId, 0, 0, rootWidth);

  return positions;
}

/**
 * Calculate bounding box of all positions
 */
export function calculateBoundingBox(
  positions: Map<string, NodePosition>
): { minX: number; minY: number; maxX: number; maxY: number } {
  if (positions.size === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  positions.forEach((pos) => {
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x + pos.width);
    maxY = Math.max(maxY, pos.y + pos.height);
  });

  return { minX, minY, maxX, maxY };
}

/**
 * Center the tree layout
 */
export function centerLayout(
  positions: Map<string, NodePosition>,
  viewportWidth: number,
  viewportHeight: number
): Map<string, NodePosition> {
  const bbox = calculateBoundingBox(positions);
  const treeWidth = bbox.maxX - bbox.minX;
  const treeHeight = bbox.maxY - bbox.minY;

  const offsetX = (viewportWidth - treeWidth) / 2 - bbox.minX;
  const offsetY = (viewportHeight - treeHeight) / 2 - bbox.minY;

  const centeredPositions = new Map<string, NodePosition>();

  positions.forEach((pos, id) => {
    centeredPositions.set(id, {
      ...pos,
      x: pos.x + offsetX,
      y: pos.y + offsetY,
    });
  });

  return centeredPositions;
}
