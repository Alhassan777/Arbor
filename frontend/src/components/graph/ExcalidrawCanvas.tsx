import { useCallback, useEffect, useRef, useMemo } from 'react';
import { Excalidraw, convertToExcalidrawElements } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import type { ConversationTree } from '../../types';
import { calculateTreeLayout } from '../../lib/excalidraw/treeLayout';
import '../../styles/excalidraw-overrides.css';

interface ExcalidrawCanvasProps {
  tree: ConversationTree;
  currentNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
}

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

export function ExcalidrawCanvas({ tree, currentNodeId }: ExcalidrawCanvasProps) {
  const excalidrawRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const lastTreeUpdateRef = useRef<string>('');

  // Generate simple shape definitions from conversation tree
  const graphElements = useMemo(() => {
    if (!tree || !tree.nodes) return [];

    const positions = calculateTreeLayout(tree, new Map());
    const elements: any[] = [];

    // Create nodes as rectangles
    Object.values(tree.nodes).forEach((node) => {
      const pos = positions.get(node.id);
      if (!pos) return;

      const isActive = node.id === currentNodeId;

      // Rectangle for node
      elements.push({
        type: 'rectangle',
        x: pos.x,
        y: pos.y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        strokeColor: isActive ? '#2dd4a7' : '#2a3530',
        backgroundColor: isActive ? 'rgba(45, 212, 167, 0.15)' : '#131917',
        fillStyle: 'solid',
        strokeWidth: 2,
        roughness: 0,
        roundness: { type: 3 },
        customData: {
          nodeId: node.id,
          type: 'conversation-node',
        },
      });

      // Text label for node
      elements.push({
        type: 'text',
        x: pos.x + 10,
        y: pos.y + NODE_HEIGHT / 2 - 10,
        width: NODE_WIDTH - 20,
        height: 20,
        text: node.title.substring(0, 25) + (node.title.length > 25 ? '...' : ''),
        fontSize: 14,
        fontFamily: 1,
        textAlign: 'center',
        strokeColor: '#e8efe9',
        customData: {
          nodeId: node.id,
          type: 'conversation-node-text',
        },
      });
    });

    // Create arrows for connections
    Object.values(tree.nodes).forEach((node) => {
      if (!node.parentId) return;

      const parentPos = positions.get(node.parentId);
      const childPos = positions.get(node.id);
      if (!parentPos || !childPos) return;

      const startX = parentPos.x + parentPos.width / 2;
      const startY = parentPos.y + parentPos.height;
      const endX = childPos.x + childPos.width / 2;
      const endY = childPos.y;

      elements.push({
        type: 'arrow',
        x: startX,
        y: startY,
        width: endX - startX,
        height: endY - startY,
        points: [
          [0, 0],
          [endX - startX, endY - startY],
        ],
        strokeColor: '#2dd4a7',
        strokeWidth: 2,
        roughness: 0,
        startArrowhead: null,
        endArrowhead: 'arrow',
        customData: {
          connectionId: `${node.parentId}-${node.id}`,
          type: 'connection',
        },
      });
    });

    return elements;
  }, [tree, currentNodeId]);

  // Handle Excalidraw API ready
  const handleExcalidrawAPI = useCallback((api: ExcalidrawImperativeAPI) => {
    excalidrawRef.current = api;
  }, []);

  // Update scene when tree changes
  useEffect(() => {
    if (!excalidrawRef.current || !tree) return;

    const treeSignature = JSON.stringify({
      nodes: Object.keys(tree.nodes).sort(),
      currentNodeId,
    });

    if (treeSignature === lastTreeUpdateRef.current) return;
    lastTreeUpdateRef.current = treeSignature;

    try {
      // Convert to Excalidraw elements
      const excalidrawElements = convertToExcalidrawElements(graphElements);

      excalidrawRef.current.updateScene({
        elements: excalidrawElements,
      });
    } catch (error) {
      console.error('Error updating Excalidraw scene:', error);
    }
  }, [graphElements, tree, currentNodeId]);

  return (
    <div className="h-full w-full">
      <Excalidraw
        excalidrawAPI={handleExcalidrawAPI}
        initialData={{
          appState: {
            theme: 'dark',
            viewBackgroundColor: '#0c0f0e',
            currentItemStrokeColor: '#9caba3',
            currentItemBackgroundColor: '#131917',
            currentItemFontFamily: 1,
            zenModeEnabled: false,
            viewModeEnabled: false,
          },
        }}
        UIOptions={{
          canvasActions: {
            clearCanvas: true,
            export: { saveFileToDisk: true },
            loadScene: false,
            saveToActiveFile: false,
            toggleTheme: false,
            changeViewBackgroundColor: false,
          },
        }}
        theme="dark"
      />
    </div>
  );
}
