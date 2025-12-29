import { useState, useEffect, useCallback } from 'react';
import type { CanvasState } from '../types';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';

export function useCanvasState(treeId: string | null) {
  const [canvasState, setCanvasState] = useState<CanvasState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch canvas state for the tree
  useEffect(() => {
    if (!treeId) return;

    const fetchCanvasState = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/tree/${treeId}/canvas-state`);
        if (!response.ok) {
          if (response.status === 404) {
            // No canvas state exists yet, that's fine
            setCanvasState(null);
            return;
          }
          throw new Error('Failed to fetch canvas state');
        }
        const state: CanvasState = await response.json();
        setCanvasState(state);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCanvasState();
  }, [treeId]);

  // Save canvas state
  const saveCanvasState = useCallback(async (
    userAnnotations: ExcalidrawElement[],
    nodePositionOverrides: Record<string, { x: number; y: number }>
  ) => {
    if (!treeId) return;

    try {
      const response = await fetch('/api/canvas-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treeId,
          userAnnotations: JSON.stringify(userAnnotations),
          nodePositionOverrides: JSON.stringify(nodePositionOverrides),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save canvas state');
      }

      const savedState: CanvasState = await response.json();
      setCanvasState(savedState);

      return savedState;
    } catch (err) {
      console.error('Error saving canvas state:', err);
      throw err;
    }
  }, [treeId]);

  // Get user annotations
  const getUserAnnotations = useCallback((): ExcalidrawElement[] => {
    if (!canvasState) return [];
    try {
      return typeof canvasState.userAnnotations === 'string'
        ? JSON.parse(canvasState.userAnnotations)
        : canvasState.userAnnotations;
    } catch (err) {
      console.error('Error parsing user annotations:', err);
      return [];
    }
  }, [canvasState]);

  // Get node position overrides
  const getNodePositionOverrides = useCallback((): Map<string, { x: number; y: number }> => {
    if (!canvasState) return new Map();
    try {
      const overrides = typeof canvasState.nodePositionOverrides === 'string'
        ? JSON.parse(canvasState.nodePositionOverrides)
        : canvasState.nodePositionOverrides;
      return new Map(Object.entries(overrides));
    } catch (err) {
      console.error('Error parsing node position overrides:', err);
      return new Map();
    }
  }, [canvasState]);

  return {
    canvasState,
    isLoading,
    error,
    saveCanvasState,
    getUserAnnotations,
    getNodePositionOverrides,
  };
}
