import { useState, useRef, useEffect } from 'react';
import { useConversationStore } from '../store/conversationStore';
import { useToastStore } from '../store/toastStore';
import MessageBubble from './MessageBubble';
import ConfirmDialog from './ConfirmDialog';
import { exportAsJSON, exportAsMarkdown } from '../utils/export';

export default function ChatArea() {
  const [input, setInput] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    tree,
    currentNodeId,
    isLoading,
    sendMessage,
    updateNodeTitle,
    deleteNode,
  } = useConversationStore();

  const { addToast } = useToastStore();

  const currentNode = tree && currentNodeId ? tree.nodes[currentNodeId] : null;

  // Pre-fill input with selected text if this is a new branch with no messages
  useEffect(() => {
    if (currentNode?.branchSelectedText && currentNode.messages.length === 0) {
      setInput(currentNode.branchSelectedText);
    }
  }, [currentNodeId, currentNode?.branchSelectedText, currentNode?.messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentNode?.messages]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageContent = input;
    setInput('');
    await sendMessage(messageContent);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e as any);
      }
    }
  };

  const handleTitleEdit = () => {
    if (currentNode) {
      setEditedTitle(currentNode.title);
      setIsEditingTitle(true);
    }
  };

  const handleTitleSave = async () => {
    if (currentNodeId && editedTitle.trim() && editedTitle !== currentNode?.title) {
      await updateNodeTitle(currentNodeId, editedTitle.trim());
      addToast('Title updated', 'success');
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };

  const handleInsertText = (text: string) => {
    setInput((prev) => prev + text);
    // Focus the input field after inserting text
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleDeleteConfirm = async () => {
    if (currentNodeId && tree) {
      const isRootNode = currentNodeId === tree.rootNodeId;

      if (isRootNode) {
        addToast('Cannot delete root conversation', 'error');
        setShowDeleteConfirm(false);
        return;
      }

      await deleteNode(currentNodeId);
      addToast('Conversation deleted', 'success');
      setShowDeleteConfirm(false);
    }
  };

  const handleExportJSON = () => {
    if (tree) {
      exportAsJSON(tree);
      addToast('Exported as JSON', 'success');
      setShowExportMenu(false);
    }
  };

  const handleExportMarkdown = () => {
    if (tree && currentNodeId) {
      exportAsMarkdown(tree, currentNodeId);
      addToast('Exported as Markdown', 'success');
      setShowExportMenu(false);
    }
  };

  if (!tree || !currentNode) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 md:px-6 py-3 md:py-4 flex items-center justify-between">
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleTitleKeyDown}
            className="flex-1 text-lg md:text-xl font-semibold text-gray-800 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none"
          />
        ) : (
          <h1
            onClick={handleTitleEdit}
            className="flex-1 text-lg md:text-xl font-semibold text-gray-800 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors group flex items-center"
            title="Click to edit title"
          >
            {currentNode.title}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </h1>
        )}

        {/* Action buttons */}
        {!isEditingTitle && (
          <div className="flex items-center space-x-1 md:space-x-2">
            {/* Export button with dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-2 md:p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation"
                title="Export conversation"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>

              {/* Export dropdown menu */}
              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                    <button
                      onClick={handleExportJSON}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg transition-colors"
                    >
                      Export as JSON
                    </button>
                    <button
                      onClick={handleExportMarkdown}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg transition-colors"
                    >
                      Export as Markdown
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Delete button */}
            {tree && currentNodeId !== tree.rootNodeId && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 md:p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors touch-manipulation"
                title="Delete conversation"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 md:px-6 py-3 md:py-4 space-y-3 md:space-y-4 bg-gray-50 dark:bg-gray-900">
        {currentNode.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg">Start a conversation</p>
              <p className="text-sm">Type a message below to begin</p>
            </div>
          </div>
        ) : (
          currentNode.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onInsertText={handleInsertText}
            />
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-3 max-w-[70%]">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-3 md:px-6 py-3 md:py-4">
        <form onSubmit={handleSubmit} className="flex space-x-2 md:space-x-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-3 md:px-4 py-2 md:py-2 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 touch-manipulation"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 md:px-6 py-2 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors touch-manipulation whitespace-nowrap text-sm md:text-base"
          >
            Send
          </button>
        </form>
      </div>

      {/* Delete Confirmation Dialog */}
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
