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
        'flex items-end gap-3 border-2 rounded-2xl bg-gradient-to-br from-forest-floor to-undergrowth p-3 transition-all duration-300',
        'focus-within:border-canopy focus-within:shadow-glow-canopy',
        disabled ? 'border-branch opacity-60' : 'border-branch hover:border-lichen'
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
        className="flex-1 bg-transparent text-parchment placeholder:text-lichen resize-none outline-none px-2 py-2 max-h-[200px] font-medium"
      />
      <button
        onClick={onSubmit}
        disabled={!value.trim() || disabled}
        className={cn(
          'p-3 rounded-xl transition-all duration-300',
          'bg-gradient-to-br from-canopy to-canopy-light hover:shadow-glow-canopy text-midnight-soil',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none',
          !disabled && value.trim() && 'hover:scale-105 active:scale-95'
        )}
      >
        <SendHorizontal className="h-5 w-5" />
      </button>
    </div>
  );
}
