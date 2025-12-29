import { Settings } from 'lucide-react';
import { ArborFullLogo } from '../brand/ArborLogo';
import { IconButton } from '../ui/IconButton';

interface AppHeaderProps {
  onSettingsClick?: () => void;
}

export default function AppHeader({ onSettingsClick }: AppHeaderProps) {
  return (
    <header className="h-14 border-b border-branch bg-forest-floor flex items-center justify-between px-4">
      <ArborFullLogo size={28} />

      <div className="flex items-center gap-2">
        {/* Keyboard shortcut hint */}
        <span className="text-xs text-lichen hidden sm:block">
          Press <kbd className="px-1.5 py-0.5 bg-undergrowth rounded-organic text-birch border border-branch">⌘K</kbd> for commands
        </span>

        {/* Settings */}
        {onSettingsClick && (
          <IconButton
            icon={<Settings size={18} />}
            onClick={onSettingsClick}
            className="p-2 rounded-organic text-birch hover:bg-undergrowth hover:text-parchment transition-all"
            label="Settings"
          />
        )}
      </div>
    </header>
  );
}
