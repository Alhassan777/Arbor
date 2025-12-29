import { useEffect } from 'react';
import { useConversationStore } from './store/conversationStore';
import GraphSidebar from './components/GraphSidebar';
import ChatArea from './components/ChatArea';

function App() {
  const { initializeNewTree, tree } = useConversationStore();

  useEffect(() => {
    // Initialize a new conversation tree on mount if none exists
    if (!tree) {
      initializeNewTree();
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <GraphSidebar />
      <ChatArea />
    </div>
  );
}

export default App;
