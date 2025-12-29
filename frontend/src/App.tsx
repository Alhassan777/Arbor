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

      // Cmd/Ctrl + [ to toggle left sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === '[') {
        e.preventDefault();
        setIsLeftSidebarOpen((prev) => !prev);
      }

      // Cmd/Ctrl + ] to toggle right sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === ']') {
        e.preventDefault();
        setIsRightSidebarOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [initializeNewTree]);

  return (
    <TooltipProvider>
      <AppLayout
        leftSidebar={<ConversationTree onToggle={() => setIsLeftSidebarOpen(false)} />}
        leftSidebarOpen={isLeftSidebarOpen}
        onToggleLeftSidebar={() => setIsLeftSidebarOpen((prev) => !prev)}
        rightSidebar={<GraphView onToggle={() => setIsRightSidebarOpen(false)} />}
        rightSidebarOpen={isRightSidebarOpen}
        onToggleRightSidebar={() => setIsRightSidebarOpen((prev) => !prev)}
      >
        <ChatContainer />
      </AppLayout>

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
