import { useRef, useEffect } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import NewMessageBubble from './NewMessageBubble';
import TypingIndicator from './TypingIndicator';
import type { Message } from '../../types';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onBranch: (messageId: string, selectedText?: string) => void;
  onCopy: (content: string) => void;
}

export default function MessageList({ messages, isLoading, onBranch, onCopy }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <MessageSquarePlus className="h-16 w-16 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">Start a conversation</h3>
          <p className="text-sm text-text-secondary">Type a message below to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
      {messages.map((message) => (
        <NewMessageBubble
          key={message.id}
          message={message}
          onBranch={onBranch}
          onCopy={onCopy}
        />
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
}
