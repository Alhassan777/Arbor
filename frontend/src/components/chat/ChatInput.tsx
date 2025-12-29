import { useRef, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = 'Type your message...',
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit();
      }
    }

    // Cmd/Ctrl + Enter also sends
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit();
      }
    }
  };

  return (
    <div
      className={cn(
        'flex items-end gap-2 border border-border rounded-xl bg-surface p-2 transition-all',
        'focus-within:ring-2 focus-within:ring-primary/50'
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted resize-none outline-none px-2 py-2 max-h-[200px]"
      />
      <button
        onClick={onSubmit}
        disabled={!value.trim() || disabled}
        className={cn(
          'p-2 rounded-lg transition-all hover:scale-105',
          'bg-primary hover:bg-primary-hover text-white',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
        )}
      >
        <SendHorizontal className="h-5 w-5" />
      </button>
    </div>
  );
}
