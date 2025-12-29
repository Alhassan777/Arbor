import { useEffect, useState } from 'react';
import { useConversationStore } from './store/conversationStore';
import { useToastStore } from './store/toastStore';
import { useSettingsStore } from './store/settingsStore';
import GraphSidebar from './components/GraphSidebar';
import ChatHistorySidebar from './components/ChatHistorySidebar';
import ChatArea from './components/ChatArea';
import Settings from './components/Settings';
import Toast from './components/Toast';

function App() {
  const { initializeNewTree, tree } = useConversationStore();
  const { toasts, removeToast } = useToastStore();
  const { apiKey, theme } = useSettingsStore();
  const [showSettings, setShowSettings] = useState(false);
  const [isChatHistoryCollapsed, setIsChatHistoryCollapsed] = useState(false);
  const [isGraphCollapsed, setIsGraphCollapsed] = useState(true);

  useEffect(() => {
    // Initialize a new conversation tree on mount if none exists
    if (!tree) {
      initializeNewTree();
    }
  }, []);

  useEffect(() => {
    // Apply theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <ChatHistorySidebar
        isCollapsed={isChatHistoryCollapsed}
        onToggle={() => setIsChatHistoryCollapsed(!isChatHistoryCollapsed)}
      />
      <ChatArea />
      <GraphSidebar
        isCollapsed={isGraphCollapsed}
        onToggle={() => setIsGraphCollapsed(!isGraphCollapsed)}
        onOpenSettings={() => setShowSettings(true)}
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
    </div>
  );
}

export default App;
