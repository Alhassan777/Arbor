import { useState } from 'react';
import { useConversationStore } from '../store/conversationStore';
import { useToastStore } from '../store/toastStore';
import MarkdownMessage from './MarkdownMessage';
import { formatRelativeTime, formatFullDate } from '../utils/time';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showBranchButton, setShowBranchButton] = useState(false);

  const { createBranch } = useConversationStore();
  const { addToast } = useToastStore();

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString() || '';
    setSelectedText(text);
    setShowBranchButton(text.length > 0);
  };

  const handleBranchFromSelection = async () => {
    if (selectedText) {
      await createBranch(message.id, selectedText);
      window.getSelection()?.removeAllRanges();
      setShowBranchButton(false);
      setSelectedText('');
      addToast('Branch created with focused context', 'success');
    }
  };

  const handleBranch = async () => {
    await createBranch(message.id);
    addToast('Branch created', 'success');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      addToast('Message copied to clipboard', 'success');
    } catch (error) {
      addToast('Failed to copy message', 'error');
    }
  };

  const isUser = message.role === 'user';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
    >
      <div className={`relative max-w-[85%] md:max-w-[70%]`}>
        <div
          className={`rounded-lg px-3 md:px-4 py-2 md:py-3 ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
          }`}
          onMouseUp={handleTextSelection}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownMessage content={message.content} />
          )}

          {/* Timestamp */}
          <div className="mt-1">
            <span
              className={`text-xs ${
                isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
              }`}
              title={formatFullDate(message.timestamp)}
            >
              {formatRelativeTime(message.timestamp)}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        {isHovered && (
          <div className={`absolute ${isUser ? '-left-16 md:-left-24' : '-right-16 md:-right-24'} top-2 flex space-x-1`}>
            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-manipulation"
              title="Copy message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-600 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>

            {/* Branch button for assistant messages */}
            {!isUser && (
              <button
                onClick={handleBranch}
                className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-manipulation"
                title="Create a new branch from here"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-600 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Branch from selection button */}
        {!isUser && showBranchButton && (
          <div className="absolute -bottom-12 left-0 right-0 flex justify-center">
            <button
              onClick={handleBranchFromSelection}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
              title="Create a branch focused on the selected text"
            >
              Branch with this context
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
