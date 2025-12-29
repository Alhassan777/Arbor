import { useRef, useEffect, useMemo, useCallback } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import type { AppState } from '@excalidraw/excalidraw/types/types';
import type { ConversationTree } from '../../types';
import { createNodeElements, createConnectionElements, getUserAnnotations } from '../../lib/excalidraw/elementGenerator';
import { calculateTreeLayout } from '../../lib/excalidraw/treeLayout';
import { useConnectionLabels } from '../../hooks/useConnectionLabels';
import { useCanvasState } from '../../hooks/useCanvasState';
import '../../styles/excalidraw-overrides.css';

interface ExcalidrawCanvasProps {
  tree: ConversationTree;
  currentNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
}

export function ExcalidrawCanvas({
  tree,
  currentNodeId,
  onNodeSelect,
}: ExcalidrawCanvasProps) {
  const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null);
  const lastTreeUpdateRef = useRef<string>('');

  // Hooks for managing connection labels and canvas state
  const { connectionLabels, updateConnectionLabel } = useConnectionLabels(tree?.id || null);
  const { getUserAnnotations: getSavedAnnotations, getNodePositionOverrides, saveCanvasState } = useCanvasState(tree?.id || null);

  // Generate Excalidraw elements from conversation tree
  const elements = useMemo(() => {
    if (!tree || !tree.nodes) return [];

    const generatedElements: ExcalidrawElement[] = [];

    // Get custom positions from canvas state
    const customPositions = getNodePositionOverrides();

    // Calculate layout
    const positions = calculateTreeLayout(tree, customPositions);

    // Create node elements
    Object.values(tree.nodes).forEach((node) => {
      const pos = positions.get(node.id);
      if (!pos) return;

      const isActive = node.id === currentNodeId;
      const nodeElements = createNodeElements(
        node,
        { x: pos.x, y: pos.y },
        isActive
      );
      generatedElements.push(...nodeElements);
    });

    // Create connection elements
    Object.values(tree.nodes).forEach((node) => {
      if (!node.parentId) return;

      const parentPos = positions.get(node.parentId);
      const childPos = positions.get(node.id);
      if (!parentPos || !childPos) return;

      const connectionId = `${node.parentId}-${node.id}`;
      const label = connectionLabels.get(connectionId);
      const labelText = label?.text || 'branch';

      const connectionElements = createConnectionElements(
        parentPos,
        childPos,
        labelText,
        connectionId
      );
      generatedElements.push(...connectionElements);
    });

    return generatedElements;
  }, [tree, currentNodeId, connectionLabels, getNodePositionOverrides]);

  // Sync tree to canvas when tree changes
  useEffect(() => {
    if (!excalidrawRef.current || !tree) return;

    const treeSignature = JSON.stringify({
      nodes: Object.keys(tree.nodes).sort(),
      currentNodeId,
      labels: Array.from(connectionLabels.keys()).sort(),
    });

    // Only update if tree actually changed
    if (treeSignature === lastTreeUpdateRef.current) return;
    lastTreeUpdateRef.current = treeSignature;

    // Get current user annotations
    const currentElements = excalidrawRef.current.getSceneElements();
    const userAnnotations = getUserAnnotations(currentElements);

    // Combine generated elements with user annotations
    const allElements = [...elements, ...userAnnotations];

    excalidrawRef.current.updateScene({
      elements: allElements,
    });
  }, [elements, tree, currentNodeId, connectionLabels]);

  // Handle changes from Excalidraw
  const handleChange = useCallback(
    (
      changedElements: readonly ExcalidrawElement[],
      appState: AppState
    ) => {
      if (!tree) return;

      // Check for edited node titles
      changedElements.forEach((element) => {
        if (!element.customData) return;

        const metadata = element.customData as any;

        // Handle node title edits
        if (
          metadata.type === 'conversation-node' &&
          element.type === 'text' &&
          'text' in element
        ) {
          const conversationId = metadata.conversationId;
          const newTitle = element.text;
          const currentNode = tree.nodes[conversationId];

          if (currentNode && currentNode.title !== newTitle) {
            // Update node title (will be handled by parent component)
            // For now, we just log it
            console.log('Node title changed:', conversationId, newTitle);
          }
        }

        // Handle connection label edits
        if (
          metadata.type === 'connection-label' &&
          element.type === 'text' &&
          'text' in element
        ) {
          const connectionId = metadata.connectionId;
          const newLabel = element.text;
          const currentLabel = connectionLabels.get(connectionId);

          if (currentLabel && currentLabel.text !== newLabel) {
            updateConnectionLabel(connectionId, {
              text: newLabel,
              userEdited: true,
            });
          }
        }
      });

      // Periodically save canvas state (debounced in practice)
      // This would ideally be debounced
      const userAnnotations = getUserAnnotations(changedElements);
      const nodePositionOverrides: Record<string, { x: number; y: number }> = {};

      // Extract position overrides from moved nodes
      changedElements.forEach((element) => {
        if (
          element.customData &&
          (element.customData as any).type === 'conversation-node' &&
          element.type === 'rectangle'
        ) {
          const nodeId = (element.customData as any).conversationId;
          nodePositionOverrides[nodeId] = { x: element.x, y: element.y };
        }
      });

      // Save periodically (this should be debounced in production)
      // saveCanvasState(userAnnotations, nodePositionOverrides);
    },
    [tree, connectionLabels, updateConnectionLabel]
  );

  // Handle node selection
  const handlePointerDown = useCallback(
    (activeTool: AppState['activeTool'], event: any) => {
      if (!excalidrawRef.current) return;

      const elements = excalidrawRef.current.getSceneElements();

      // Find clicked element
      const clickedElement = elements.find((el) => {
        // This is a simplified check - Excalidraw's internal hit detection is more sophisticated
        return el.id === event?.element?.id;
      });

      if (!clickedElement?.customData) return;

      const metadata = clickedElement.customData as any;

      // If clicked on a conversation node, navigate to it
      if (metadata.type === 'conversation-node') {
        const conversationId = metadata.conversationId;
        onNodeSelect(conversationId);
      }
    },
    [onNodeSelect]
  );

  return (
    <div className="h-full w-full">
      <Excalidraw
        ref={excalidrawRef}
        initialData={{
          elements: elements,
          appState: {
            theme: 'dark',
            viewBackgroundColor: '#0c0f0e',
            currentItemStrokeColor: '#9caba3', // birch
            currentItemBackgroundColor: '#131917', // forest-floor
            currentItemFontFamily: 1,
            zenModeEnabled: false, // Ensure zen mode is disabled
            viewModeEnabled: false, // Ensure view mode is disabled - this allows editing
          },
        }}
        onChange={handleChange}
        // @ts-ignore - Type mismatch in Excalidraw types
        onPointerDown={handlePointerDown}
        UIOptions={{
          canvasActions: {
            clearCanvas: true,
            export: { saveFileToDisk: true },
            loadScene: false,
            saveToActiveFile: false,
            toggleTheme: false,
            changeViewBackgroundColor: false,
          },
          // Don't restrict any tools - let all default tools be available
        }}
        theme="dark"
      />
    </div>
  );
}
