import { useState } from 'react';
import { useConversationStore } from '../store/conversationStore';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showBranchButton, setShowBranchButton] = useState(false);

  const { createBranch } = useConversationStore();

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
    }
  };

  const handleBranch = async () => {
    await createBranch(message.id);
  };

  const isUser = message.role === 'user';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative max-w-[70%]`}>
        <div
          className={`rounded-lg px-4 py-3 ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
          onMouseUp={handleTextSelection}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Branch button for assistant messages */}
        {!isUser && isHovered && (
          <button
            onClick={handleBranch}
            className="absolute -right-10 top-2 p-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            title="Branch conversation"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-600"
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

        {/* Branch from selection button */}
        {!isUser && showBranchButton && (
          <div className="absolute -bottom-12 left-0 right-0 flex justify-center">
            <button
              onClick={handleBranchFromSelection}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
            >
              Branch from selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
