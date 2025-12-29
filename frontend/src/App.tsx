import { useEffect, useState } from 'react';
import { useConversationStore } from './store/conversationStore';
import { useToastStore } from './store/toastStore';
import { useSettingsStore } from './store/settingsStore';
import AppLayout from './components/layout/AppLayout';
import ConversationTree from './components/sidebar/ConversationTree';
import ChatContainer from './components/chat/ChatContainer';
import GraphView from './components/graph/GraphView';
import Settings from './components/Settings';
import Toast from './components/Toast';
import { TooltipProvider } from './components/ui/Tooltip';

function App() {
  const { initializeNewTree, tree } = useConversationStore();
  const { toasts, removeToast } = useToastStore();
  const { apiKey } = useSettingsStore();
  const [showSettings, setShowSettings] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  useEffect(() => {
    // Initialize a new conversation tree on mount if none exists
    if (!tree) {
      initializeNewTree();
    }
  }, []);

  useEffect(() => {
    // Apply dark mode (always on for new design)
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    // Show settings if no API key
    if (!apiKey && !showSettings) {
      setShowSettings(true);
    }
  }, [apiKey]);

  useEffect(() => {
    // Global keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to toggle settings
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSettings((prev) => !prev);
      }

      // Cmd/Ctrl + N for new conversation
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        initializeNewTree();
      }

      // Cmd/Ctrl + [ to toggle left sidebar (tree)
      if ((e.metaKey || e.ctrlKey) && e.key === '[') {
        e.preventDefault();
        setIsLeftSidebarOpen((prev) => !prev);
      }

      // Cmd/Ctrl + ] to toggle right sidebar (graph)
      if ((e.metaKey || e.ctrlKey) && e.key === ']') {
        e.preventDefault();
        setIsRightSidebarOpen((prev) => !prev);
      }

      // Cmd/Ctrl + \ to toggle chat panel (center)
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setIsChatPanelOpen((prev) => !prev);
      }

      // Cmd/Ctrl + Shift + G for full graph mode (collapse tree + chat)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        setIsLeftSidebarOpen(false);
        setIsChatPanelOpen(false);
        setIsRightSidebarOpen(true);
      }

      // Escape to reset to default layout
      if (e.key === 'Escape' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsLeftSidebarOpen(true);
        setIsChatPanelOpen(true);
        setIsRightSidebarOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [initializeNewTree]);

  // Check if we're in full graph mode (only graph visible)
  const isFullGraphMode = !isLeftSidebarOpen && !isChatPanelOpen && isRightSidebarOpen;

  const handleToggleFullGraphMode = () => {
    if (isFullGraphMode) {
      // Restore to default layout
      setIsLeftSidebarOpen(true);
      setIsChatPanelOpen(true);
      setIsRightSidebarOpen(true);
    } else {
      // Enter full graph mode
      setIsLeftSidebarOpen(false);
      setIsChatPanelOpen(false);
      setIsRightSidebarOpen(true);
    }
  };

  return (
    <TooltipProvider>
      <AppLayout
        leftSidebar={<ConversationTree onToggle={() => setIsLeftSidebarOpen(false)} />}
        leftSidebarOpen={isLeftSidebarOpen}
        onToggleLeftSidebar={() => setIsLeftSidebarOpen((prev) => !prev)}
        chatPanel={<ChatContainer />}
        chatPanelOpen={isChatPanelOpen}
        onToggleChatPanel={() => setIsChatPanelOpen((prev) => !prev)}
        rightSidebar={<GraphView onToggle={() => setIsRightSidebarOpen(false)} />}
        rightSidebarOpen={isRightSidebarOpen}
        onToggleRightSidebar={() => setIsRightSidebarOpen((prev) => !prev)}
        isFullGraphMode={isFullGraphMode}
        onToggleFullGraphMode={handleToggleFullGraphMode}
      />

      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </TooltipProvider>
  );
}

export default App;
