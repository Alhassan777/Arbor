import { useCallback } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import type { ConversationTree } from '../../types';
import '../../styles/excalidraw-overrides.css';

interface ExcalidrawCanvasProps {
  tree: ConversationTree;
  currentNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
}

export function ExcalidrawCanvas({}: ExcalidrawCanvasProps) {
  // Handle Excalidraw API ready
  const handleExcalidrawAPI = useCallback((_api: ExcalidrawImperativeAPI) => {
    // API ready - for now just blank canvas
    // We'll implement graph rendering once we figure out the right approach
  }, []);

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
            clearCanvas: false,
            export: false,
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
