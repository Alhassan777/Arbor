export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[70%] bg-surface border border-border rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
