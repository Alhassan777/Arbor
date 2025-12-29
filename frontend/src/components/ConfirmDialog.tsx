import { Button } from './ui/Button';
import { cn } from '../lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {title}
            </h3>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-gray-600 dark:text-gray-300">{message}</p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <Button onClick={onCancel} variant="secondary">
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              className={cn(
                variant === 'danger' && 'bg-red-600 hover:bg-red-700',
                variant === 'warning' && 'bg-yellow-600 hover:bg-yellow-700',
                variant === 'info' && 'bg-blue-600 hover:bg-blue-700'
              )}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
