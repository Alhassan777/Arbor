import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Sparkles, Check } from 'lucide-react';
import type { ConnectionLabelType } from '../../types';
import { getConnectionTypeDescription } from '../../lib/ai/connectionLabeler';

interface EdgeLabelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (type: ConnectionLabelType, text: string) => void;
  initialType?: ConnectionLabelType;
  initialText?: string;
  parentTitle: string;
  childTitle: string;
  isLoading?: boolean;
}

const labelTypes: ConnectionLabelType[] = [
  'deepens',
  'explores',
  'contrasts',
  'examples',
  'applies',
  'questions',
  'extends',
  'summarizes',
  'custom',
];

export default function EdgeLabelDialog({
  isOpen,
  onClose,
  onSave,
  initialType = 'explores',
  initialText = '',
  parentTitle,
  childTitle,
  isLoading = false,
}: EdgeLabelDialogProps) {
  const [selectedType, setSelectedType] = useState<ConnectionLabelType>(initialType);
  const [customText, setCustomText] = useState(initialText);

  const handleSave = () => {
    const text = selectedType === 'custom' 
      ? customText 
      : getConnectionTypeDescription(selectedType);
    onSave(selectedType, text);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-midnight-soil/80 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg">
          <div className="bg-gradient-to-br from-forest-floor to-undergrowth border-2 border-branch rounded-2xl shadow-dappled p-6 animate-slide-up">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <Dialog.Title className="text-xl font-bold text-parchment mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-canopy" />
                  Label Connection
                </Dialog.Title>
                <div className="text-xs text-text-secondary space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lichen">From:</span>
                    <span className="text-birch font-medium">{parentTitle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lichen">To:</span>
                    <span className="text-birch font-medium">{childTitle}</span>
                  </div>
                </div>
              </div>
              <Dialog.Close asChild>
                <button className="p-2 hover:bg-undergrowth rounded-lg transition-all">
                  <X className="h-4 w-4 text-lichen hover:text-parchment" />
                </button>
              </Dialog.Close>
            </div>

            {/* Label Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-lichen uppercase tracking-wide">
                Relationship Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {labelTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={[
                      'px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left',
                      selectedType === type
                        ? 'bg-canopy/20 border-2 border-canopy text-canopy shadow-sm'
                        : 'bg-undergrowth border border-branch text-birch hover:border-lichen hover:bg-undergrowth/80',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="capitalize">{type}</span>
                      {selectedType === type && (
                        <Check className="h-4 w-4 flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-[10px] text-text-secondary/70 mt-0.5">
                      {getConnectionTypeDescription(type).substring(0, 30)}...
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Text Input */}
            {selectedType === 'custom' && (
              <div className="mt-4 space-y-2">
                <label className="text-sm font-semibold text-lichen uppercase tracking-wide">
                  Custom Label Text
                </label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Enter your custom label..."
                  className="w-full px-4 py-2.5 bg-undergrowth border border-branch rounded-lg text-sm text-parchment placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-canopy/40 focus:border-canopy transition-all"
                  autoFocus
                />
              </div>
            )}

            {/* Preview */}
            <div className="mt-4 p-3 bg-midnight-soil/60 rounded-lg border border-branch/60">
              <div className="text-[10px] text-lichen uppercase tracking-wide mb-1">
                Preview
              </div>
              <div className="text-sm text-canopy font-medium">
                {selectedType === 'custom' 
                  ? customText || 'Enter custom text...'
                  : getConnectionTypeDescription(selectedType)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={isLoading || (selectedType === 'custom' && !customText.trim())}
                className="flex-1 px-4 py-2.5 bg-gradient-to-br from-canopy to-canopy-light hover:shadow-glow-canopy text-midnight-soil rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? 'Saving...' : 'Save Label'}
              </button>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2.5 bg-undergrowth hover:bg-branch border border-branch text-birch hover:text-parchment rounded-xl font-semibold text-sm transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
