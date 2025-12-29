import { useEffect, useState } from 'react';
import { useConversationStore } from './store/conversationStore';
import { useToastStore } from './store/toastStore';
import { useSettingsStore } from './store/settingsStore';
import GraphSidebar from './components/GraphSidebar';
import ChatArea from './components/ChatArea';
import Settings from './components/Settings';
import Toast from './components/Toast';

function App() {
  const { initializeNewTree, tree } = useConversationStore();
  const { toasts, removeToast } = useToastStore();
  const { apiKey, theme } = useSettingsStore();
  const [showSettings, setShowSettings] = useState(false);

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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <GraphSidebar onOpenSettings={() => setShowSettings(true)} />
      <ChatArea />

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
