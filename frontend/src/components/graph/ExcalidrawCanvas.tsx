import { useCallback } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import '../../styles/excalidraw-overrides.css';

interface ExcalidrawCanvasProps {
  tree: any;
  currentNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
}

export function ExcalidrawCanvas({}: ExcalidrawCanvasProps) {
  // Handle excalidraw API ready
  const handleExcalidrawAPI = useCallback((_api: ExcalidrawImperativeAPI) => {
    // API ready - could be used for advanced features
  }, []);

  return (
    <div className="h-full w-full">
      <Excalidraw
        excalidrawAPI={handleExcalidrawAPI}
        initialData={{
          appState: {
            theme: 'dark',
            viewBackgroundColor: 'transparent', // Make background transparent to see graph underneath
            currentItemStrokeColor: '#9caba3', // birch
            currentItemBackgroundColor: '#131917', // forest-floor
            currentItemFontFamily: 1,
            zenModeEnabled: false, // Ensure zen mode is disabled
            viewModeEnabled: false, // Ensure view mode is disabled - this allows editing
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
          // Don't restrict any tools - let all default tools be available
        }}
        theme="dark"
      />
    </div>
  );
}
