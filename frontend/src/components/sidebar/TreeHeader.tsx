import { Plus, ChevronLeft, Menu } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/Tooltip';

interface TreeHeaderProps {
  onNewChat: () => void;
  onToggle: () => void;
}

export default function TreeHeader({ onNewChat, onToggle }: TreeHeaderProps) {
  return (
    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Menu className="h-4 w-4 text-text-secondary" />
        <h2 className="text-sm font-semibold text-text-primary">BranchChat</h2>
      </div>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onNewChat}
              className="p-2 rounded-lg bg-primary hover:bg-primary-hover text-white transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>New conversation (Cmd+N)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-text-secondary" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Collapse sidebar (Cmd+[)</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
