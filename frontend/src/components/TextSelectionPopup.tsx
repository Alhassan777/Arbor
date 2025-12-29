import { useEffect, useState } from 'react';

interface TextSelectionPopupProps {
  isVisible: boolean;
  position: { x: number; y: number };
  onBranch: () => void;
  onContinue: () => void;
  onClose: () => void;
}

export default function TextSelectionPopup({
  isVisible,
  position,
  onBranch,
  onContinue,
  onClose,
}: TextSelectionPopupProps) {
  const [popupPosition, setPopupPosition] = useState(position);

  useEffect(() => {
    // Adjust position to keep popup in viewport
    const adjustedPosition = { ...position };
    const popupWidth = 240;
    const popupHeight = 120;

    if (position.x + popupWidth > window.innerWidth) {
      adjustedPosition.x = window.innerWidth - popupWidth - 20;
    }
    if (position.y + popupHeight > window.innerHeight) {
      adjustedPosition.y = position.y - popupHeight - 10;
    }

    setPopupPosition(adjustedPosition);
  }, [position]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop to detect clicks outside */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Popup */}
      <div
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        style={{
          left: `${popupPosition.x}px`,
          top: `${popupPosition.y}px`,
          minWidth: '240px',
        }}
      >
        <div className="p-2">
          <button
            onClick={onBranch}
            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-600 dark:text-blue-400"
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
            <div>
              <div className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                Branch from here
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Start a new conversation branch
              </div>
            </div>
          </button>

          <button
            onClick={onContinue}
            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <div>
              <div className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                Continue in chat
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Add context to this conversation
              </div>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
