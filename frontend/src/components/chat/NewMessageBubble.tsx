import { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Copy } from 'lucide-react';
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
}

export default function NewMessageBubble({ message, onBranch, onCopy }: NewMessageBubbleProps) {
  const [selectedText, setSelectedText] = useState('');
  const [showSelectionPopup, setShowSelectionPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const isUser = message.role === 'user';

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
              : 'bg-surface border border-border rounded-bl-md'
          )}
          onMouseUp={handleTextSelection}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
          ) : (
            <MarkdownMessage content={message.content} />
          )}

          {/* Timestamp */}
          <div className="mt-2">
            <span className={cn('text-xs', isUser ? 'text-white/70' : 'text-text-muted')}>
              {formatRelativeTime(message.timestamp)}
            </span>
          </div>
        </div>

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
