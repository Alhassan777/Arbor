import { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Copy, AlertTriangle, RotateCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/Tooltip';
import MarkdownMessage from '../MarkdownMessage';
import SelectionBranchButton from './SelectionBranchButton';
import { formatRelativeTime } from '../../utils/time';
import type { Message } from '../../types';

interface NewMessageBubbleProps {
  message: Message;
  onBranch: (messageId: string, selectedText?: string) => void;
  onCopy: (content: string) => void;
  onRetry?: (messageId: string) => void;
}

export default function NewMessageBubble({ message, onBranch, onCopy, onRetry }: NewMessageBubbleProps) {
  const [selectedText, setSelectedText] = useState('');
  const [showSelectionPopup, setShowSelectionPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const isUser = message.role === 'user';
  const isError = message.id.startsWith('error-');

  const handleTextSelection = () => {
    if (isUser) return; // Only allow selection in AI messages

    const selection = window.getSelection();
    const text = selection?.toString().trim() || '';

    if (text.length > 0) {
      setSelectedText(text);
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();

      if (rect) {
        setPopupPosition({
          x: rect.left + rect.width / 2,
          y: rect.bottom + 10,
        });
        setShowSelectionPopup(true);
      }
    } else {
      setShowSelectionPopup(false);
      setSelectedText('');
    }
  };

  const handleBranchFromSelection = () => {
    onBranch(message.id, selectedText);
    window.getSelection()?.removeAllRanges();
    setShowSelectionPopup(false);
    setSelectedText('');
  };

  const handleCloseSelectionPopup = () => {
    setShowSelectionPopup(false);
    setSelectedText('');
    window.getSelection()?.removeAllRanges();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex group', isUser ? 'justify-end' : 'justify-start')}
    >
      <div className="relative max-w-[70%]">
        {/* Message Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 transition-all duration-200',
            isUser
              ? 'bg-primary text-white rounded-br-md'
              : isError
              ? 'bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-800 rounded-bl-md'
              : 'bg-surface border border-border rounded-bl-md'
          )}
          onMouseUp={handleTextSelection}
        >
          {!isUser && isError && (
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span className="text-sm font-medium text-red-800 dark:text-red-300">Error</span>
            </div>
          )}
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
          ) : (
            <div className={cn(isError && 'text-red-900 dark:text-red-200')}>
              <MarkdownMessage content={message.content} />
            </div>
          )}

          {/* Timestamp */}
          <div className="mt-2">
            <span className={cn(
              'text-xs',
              isUser ? 'text-white/70' : isError ? 'text-red-600 dark:text-red-400' : 'text-text-muted'
            )}>
              {formatRelativeTime(message.timestamp)}
            </span>
          </div>
        </div>

        {/* Retry Button for Error Messages */}
        {isError && onRetry && (
          <div className="mt-2 flex justify-start">
            <button
              onClick={() => onRetry(message.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg',
                'bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/70',
                'text-red-700 dark:text-red-300 text-sm font-medium',
                'transition-colors border border-red-300 dark:border-red-700'
              )}
            >
              <RotateCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        )}

        {/* Branch Button (AI messages only, appears on hover) */}
        {!isUser && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onBranch(message.id)}
                className={cn(
                  'absolute -top-2 -right-2 p-1.5 rounded-md bg-surface-hover hover:bg-primary-muted transition-all',
                  'opacity-0 group-hover:opacity-100 border border-border shadow-md'
                )}
              >
                <GitBranch className="h-4 w-4 text-text-primary" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Branch from here (Cmd+B)</TooltipContent>
          </Tooltip>
        )}

        {/* Copy Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onCopy(message.content)}
              className={cn(
                'absolute -top-2',
                isUser ? '-left-2' : '-right-12',
                'p-1.5 rounded-md bg-surface-hover hover:bg-primary-muted transition-all',
                'opacity-0 group-hover:opacity-100 border border-border shadow-md'
              )}
            >
              <Copy className="h-4 w-4 text-text-primary" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Copy message</TooltipContent>
        </Tooltip>

        {/* Text Selection Popup */}
        {!isUser && showSelectionPopup && (
          <SelectionBranchButton
            position={popupPosition}
            onBranch={handleBranchFromSelection}
            onClose={handleCloseSelectionPopup}
          />
        )}
      </div>
    </motion.div>
  );
}
