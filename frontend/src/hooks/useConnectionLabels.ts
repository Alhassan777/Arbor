import { useState, useEffect, useCallback } from 'react';
import type { ConnectionLabel } from '../types';

export function useConnectionLabels(treeId: string | null) {
  const [connectionLabels, setConnectionLabels] = useState<Map<string, ConnectionLabel>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch connection labels for the tree
  useEffect(() => {
    if (!treeId) return;

    const fetchLabels = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/tree/${treeId}/connection-labels`);
        if (!response.ok) {
          throw new Error('Failed to fetch connection labels');
        }
        const labels: ConnectionLabel[] = await response.json();

        const labelsMap = new Map<string, ConnectionLabel>();
        labels.forEach(label => {
          labelsMap.set(label.connectionId, label);
        });

        setConnectionLabels(labelsMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabels();
  }, [treeId]);

  // Update a connection label
  const updateConnectionLabel = useCallback(async (
    connectionId: string,
    updates: Partial<Omit<ConnectionLabel, 'id' | 'connectionId' | 'createdAt' | 'updatedAt'>>
  ) => {
    if (!treeId) return;

    try {
      const currentLabel = connectionLabels.get(connectionId);
      const labelData = {
        connectionId,
        treeId,
        type: updates.type || currentLabel?.type || 'extends',
        text: updates.text || currentLabel?.text || 'branch',
        aiGenerated: updates.aiGenerated ?? currentLabel?.aiGenerated ?? false,
        userEdited: updates.userEdited ?? true,
      };

      const response = await fetch('/api/connection-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(labelData),
      });

      if (!response.ok) {
        throw new Error('Failed to update connection label');
      }

      const updatedLabel: ConnectionLabel = await response.json();

      setConnectionLabels(prev => {
        const next = new Map(prev);
        next.set(connectionId, updatedLabel);
        return next;
      });

      return updatedLabel;
    } catch (err) {
      console.error('Error updating connection label:', err);
      throw err;
    }
  }, [treeId, connectionLabels]);

  // Get a connection label by connection ID
  const getConnectionLabel = useCallback((connectionId: string) => {
    return connectionLabels.get(connectionId);
  }, [connectionLabels]);

  return {
    connectionLabels,
    isLoading,
    error,
    updateConnectionLabel,
    getConnectionLabel,
  };
}
