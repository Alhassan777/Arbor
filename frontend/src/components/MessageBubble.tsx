import { useState } from 'react';
import { useConversationStore } from '../store/conversationStore';
import { useToastStore } from '../store/toastStore';
import MarkdownMessage from './MarkdownMessage';
import { formatRelativeTime, formatFullDate } from '../utils/time';
import TextSelectionPopup from './TextSelectionPopup';
import IconButton from './ui/IconButton';
import { Icons } from './ui/Icons';
import { cn } from '../lib/utils';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  onInsertText?: (text: string) => void;
}

export default function MessageBubble({ message, onInsertText }: MessageBubbleProps) {
  const [selectedText, setSelectedText] = useState('');
  const [showSelectionPopup, setShowSelectionPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const { createBranch } = useConversationStore();
  const { addToast } = useToastStore();

  const isUser = message.role === 'user';

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() || '';

    if (text.length > 0) {
      setSelectedText(text);
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();

      if (rect) {
        setPopupPosition({
          x: rect.left + rect.width / 2 - 120,
          y: rect.bottom + 10,
        });
        setShowSelectionPopup(true);
      }
    } else {
      setShowSelectionPopup(false);
      setSelectedText('');
    }
  };

  const handleBranchFromSelection = async () => {
    if (selectedText) {
      await createBranch(message.id, selectedText);
      window.getSelection()?.removeAllRanges();
      setShowSelectionPopup(false);
      setSelectedText('');
      addToast('Branch created with focused context', 'success');
    }
  };

  const handleContinueWithSelection = () => {
    if (selectedText && onInsertText) {
      onInsertText(`Regarding: "${selectedText}"\n\n`);
      window.getSelection()?.removeAllRanges();
      setShowSelectionPopup(false);
      setSelectedText('');
      addToast('Context added to input', 'success');
    }
  };

  const handleClosePopup = () => {
    setShowSelectionPopup(false);
    setSelectedText('');
    window.getSelection()?.removeAllRanges();
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

  return (
    <div
      className={cn('flex group', isUser ? 'justify-end' : 'justify-start')}
    >
      <div className="relative max-w-[85%] md:max-w-[70%]">
        {/* Message Content */}
        <div
          className={cn(
            'rounded-2xl px-4 md:px-5 py-3 md:py-4 transition-all duration-200',
            isUser
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 border border-gray-200 dark:border-gray-700 shadow-sm'
          )}
          onMouseUp={handleTextSelection}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <MarkdownMessage content={message.content} />
          )}

          {/* Timestamp */}
          <div className="mt-2">
            <span
              className={cn(
                'text-xs font-medium',
                isUser ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'
              )}
              title={formatFullDate(message.timestamp)}
            >
              {formatRelativeTime(message.timestamp)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={cn(
            'absolute top-3 flex gap-1.5',
            'opacity-40 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-200',
            isUser ? '-left-16 md:-left-20' : '-right-16 md:-right-20'
          )}
        >
          <IconButton
            icon={<Icons.Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
            label="Copy message"
            onClick={handleCopy}
            className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg"
          />

          {!isUser && (
            <IconButton
              icon={<Icons.Branch className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
              label="Create a new branch from here"
              onClick={handleBranch}
              className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg"
            />
          )}
        </div>

        {/* Text Selection Popup */}
        {!isUser && (
          <TextSelectionPopup
            isVisible={showSelectionPopup}
            position={popupPosition}
            onBranch={handleBranchFromSelection}
            onContinue={handleContinueWithSelection}
            onClose={handleClosePopup}
          />
        )}
      </div>
    </div>
  );
}
