import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

interface AppLayoutProps {
  leftSidebar: React.ReactNode;
  leftSidebarOpen: boolean;
  onToggleLeftSidebar: () => void;
  chatPanel: React.ReactNode;
  chatPanelOpen: boolean;
  onToggleChatPanel: () => void;
  rightSidebar: React.ReactNode;
  rightSidebarOpen: boolean;
  onToggleRightSidebar: () => void;
  isAnnotateMode?: boolean;
  onToggleAnnotateMode?: () => void;
  excalidrawOverlay?: React.ReactNode;
}

export default function AppLayout({
  leftSidebar,
  leftSidebarOpen,
  onToggleLeftSidebar,
  chatPanel,
  chatPanelOpen,
  onToggleChatPanel,
  rightSidebar,
  rightSidebarOpen,
  onToggleRightSidebar,
  isAnnotateMode,
  onToggleAnnotateMode,
  excalidrawOverlay,
}: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-midnight-soil overflow-hidden relative">
      {/* Left Sidebar - Tree */}
      <AnimatePresence initial={false}>
        {leftSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="bg-forest-floor border-r border-branch overflow-hidden flex flex-col"
          >
            <div className="w-[280px] h-full flex flex-col">
              {leftSidebar}
              <button
                onClick={onToggleLeftSidebar}
                className="p-2 m-2 rounded-organic text-lichen hover:bg-undergrowth hover:text-parchment transition-all self-end"
                title="Collapse tree (⌘[)"
                aria-label="Collapse tree sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Left Toggle */}
      {!leftSidebarOpen && (
        <button
          onClick={onToggleLeftSidebar}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-organic bg-forest-floor border border-branch text-lichen hover:bg-undergrowth hover:text-parchment transition-all shadow-lg"
          title="Expand tree (⌘[)"
          aria-label="Expand tree sidebar"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}

      {/* Center Panel - Chat */}
      <AnimatePresence initial={false}>
        {chatPanelOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1, flex: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="flex-1 flex flex-col overflow-hidden bg-midnight-soil relative"
          >
            {/* Chat collapse button (top-right of chat panel) */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button
                onClick={onToggleChatPanel}
                className="p-1.5 rounded-organic bg-forest-floor/80 backdrop-blur border border-branch text-lichen hover:bg-undergrowth hover:text-parchment transition-all"
                title="Collapse chat (⌘\)"
                aria-label="Collapse chat panel"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            {chatPanel}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Sidebar - Graph */}
      <AnimatePresence initial={false}>
        {rightSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: chatPanelOpen ? 'auto' : '100%', opacity: 1, flex: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="flex-1 bg-forest-floor border-l border-branch overflow-hidden flex flex-col relative"
          >
            {/* Graph header with controls */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              {/* Expand chat back if collapsed */}
              {!chatPanelOpen && (
                <button
                  onClick={onToggleChatPanel}
                  className="p-1.5 rounded-organic bg-forest-floor/80 backdrop-blur border border-branch text-lichen hover:bg-undergrowth hover:text-parchment transition-all"
                  title="Show chat (⌘\)"
                  aria-label="Show chat panel"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}

              {/* Annotate mode toggle button */}
              {onToggleAnnotateMode && (
                <button
                  onClick={onToggleAnnotateMode}
                  className="p-1.5 rounded-organic bg-forest-floor/80 backdrop-blur border border-branch text-lichen hover:bg-canopy hover:text-midnight-soil transition-all flex items-center gap-1.5"
                  title={isAnnotateMode ? "Exit annotate mode" : "Enter annotate mode"}
                  aria-label={isAnnotateMode ? "Exit annotate mode" : "Enter annotate mode"}
                >
                  {isAnnotateMode ? (
                    <>
                      <Minimize2 className="h-4 w-4" />
                      <span className="text-xs font-medium">Exit</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-4 w-4" />
                      <span className="text-xs font-medium">Annotate</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={onToggleRightSidebar}
                className="p-1.5 rounded-organic bg-forest-floor/80 backdrop-blur border border-branch text-lichen hover:bg-undergrowth hover:text-parchment transition-all"
                title="Collapse graph (⌘])"
                aria-label="Collapse graph panel"
              >
                <PanelRightClose className="h-4 w-4" />
              </button>
            </div>

            <div className="w-full h-full relative">
              {rightSidebar}
              {/* Excalidraw overlay - positioned absolutely on top of GraphView */}
              {/* {excalidrawOverlay && (
                <div className="absolute inset-0 z-20 pointer-events-auto">
                  {excalidrawOverlay}
                </div>
              )} */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Right Toggle */}
      {!rightSidebarOpen && (
        <button
          onClick={onToggleRightSidebar}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-organic bg-forest-floor border border-branch text-lichen hover:bg-undergrowth hover:text-parchment transition-all shadow-lg"
          title="Expand graph (⌘])"
          aria-label="Expand graph panel"
        >
          <PanelRightOpen className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
