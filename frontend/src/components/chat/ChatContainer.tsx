import { useState } from 'react';
import { useConversationStore } from '../../store/conversationStore';
import { useToastStore } from '../../store/toastStore';
import { exportAsJSON, exportAsMarkdown } from '../../utils/export';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ConfirmDialog from '../ConfirmDialog';

export default function ChatContainer() {
  const [input, setInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    tree,
    currentNodeId,
    isLoading,
    sendMessage,
    updateNodeTitle,
    deleteNode,
    createBranch,
  } = useConversationStore();

  const { addToast } = useToastStore();

  const currentNode = tree && currentNodeId ? tree.nodes[currentNodeId] : null;

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const messageContent = input;
    setInput('');
    await sendMessage(messageContent);
  };

  const handleBranch = async (messageId: string, selectedText?: string) => {
    await createBranch(messageId, selectedText);
    addToast(selectedText ? 'Branch created with selection' : 'Branch created', 'success');
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      addToast('Copied to clipboard', 'success');
    } catch (error) {
      addToast('Failed to copy', 'error');
    }
  };

  const handleTitleUpdate = async (newTitle: string) => {
    if (currentNodeId) {
      await updateNodeTitle(currentNodeId, newTitle);
      addToast('Title updated', 'success');
    }
  };

  const handleExportJSON = () => {
    if (tree) {
      exportAsJSON(tree);
      addToast('Exported as JSON', 'success');
    }
  };

  const handleExportMarkdown = () => {
    if (tree && currentNodeId) {
      exportAsMarkdown(tree, currentNodeId);
      addToast('Exported as Markdown', 'success');
    }
  };

  const handleDeleteConfirm = async () => {
    if (currentNodeId) {
      await deleteNode(currentNodeId);
      addToast('Conversation deleted', 'success');
      setShowDeleteConfirm(false);
    }
  };

  if (!tree || !currentNode) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  // Build breadcrumb (simplified - just show current for now)
  const breadcrumb: string[] = [];

  return (
    <div className="flex-1 flex flex-col bg-background">
      <ChatHeader
        title={currentNode.title}
        breadcrumb={breadcrumb}
        onTitleUpdate={handleTitleUpdate}
        onExportJSON={handleExportJSON}
        onExportMarkdown={handleExportMarkdown}
        onDelete={() => setShowDeleteConfirm(true)}
        canDelete={currentNodeId !== tree.rootNodeId}
      />

      <MessageList
        messages={currentNode.messages}
        isLoading={isLoading}
        onBranch={handleBranch}
        onCopy={handleCopy}
      />

      <div className="bg-surface border-t border-border px-6 py-4">
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSendMessage}
          disabled={isLoading}
        />
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This will also delete all child conversations. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
