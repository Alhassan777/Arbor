import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface NameTreeDialogProps {
  isOpen: boolean;
  title: string;
  initialValue?: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
  placeholder?: string;
}

export default function NameTreeDialog({
  isOpen,
  title,
  initialValue = '',
  onConfirm,
  onCancel,
  placeholder = 'Enter tree name...',
}: NameTreeDialogProps) {
  const [name, setName] = useState(initialValue);

  useEffect(() => {
    setName(initialValue);
  }, [initialValue, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

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
        <div className="bg-gradient-to-br from-forest-floor to-midnight-soil border border-branch rounded-xl shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-branch">
            <h3 className="text-lg font-semibold text-parchment">
              {title}
            </h3>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4">
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full bg-undergrowth border-branch text-parchment placeholder:text-lichen focus:border-canopy focus:ring-canopy"
                autoFocus
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-branch flex justify-end gap-3">
              <Button
                type="button"
                onClick={onCancel}
                variant="secondary"
                className="bg-undergrowth hover:bg-undergrowth/80 text-birch border-branch"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!name.trim()}
                className="bg-gradient-to-br from-canopy to-canopy-light hover:shadow-glow-canopy text-midnight-soil disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
