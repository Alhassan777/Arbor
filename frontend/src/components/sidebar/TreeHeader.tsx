import { Plus, ChevronLeft, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/Tooltip';

interface TreeHeaderProps {
  onNewChat: () => void;
  onToggle: () => void;
}

export default function TreeHeader({ onNewChat, onToggle }: TreeHeaderProps) {
  return (
    <div className="px-5 py-4 border-b border-branch bg-gradient-to-br from-forest-floor to-midnight-soil flex items-center justify-between backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-canopy/10 rounded-xl">
          <Sparkles className="h-4 w-4 text-canopy" />
        </div>
        <h2 className="text-sm font-bold text-parchment tracking-wide">Arbor</h2>
      </div>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onNewChat}
              className="p-2.5 rounded-xl bg-gradient-to-br from-canopy to-canopy-light hover:shadow-glow-canopy text-midnight-soil transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4 font-bold" />
            </button>
          </TooltipTrigger>
          <TooltipContent>New conversation (Cmd+N)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggle}
              className="p-2.5 hover:bg-undergrowth rounded-xl transition-all duration-300 active:scale-95 group"
            >
              <ChevronLeft className="h-4 w-4 text-birch group-hover:text-canopy transition-colors" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Collapse sidebar (Cmd+[)</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
