import { ZoomIn, ZoomOut, Maximize2, Lock, Unlock } from 'lucide-react';
import { useReactFlow } from 'reactflow';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/Tooltip';
import { cn } from '../../lib/utils';

interface GraphControlsProps {
  isLocked: boolean;
  onToggleLock: () => void;
}

export default function GraphControls({ isLocked, onToggleLock }: GraphControlsProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
      <div className="flex gap-1 bg-surface border border-border rounded-full px-2 py-1 shadow-lg">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => zoomIn()}
              className="p-2 rounded-full hover:bg-surface-hover transition-colors"
            >
              <ZoomIn className="h-4 w-4 text-text-primary" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Zoom in</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => zoomOut()}
              className="p-2 rounded-full hover:bg-surface-hover transition-colors"
            >
              <ZoomOut className="h-4 w-4 text-text-primary" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Zoom out</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => fitView({ padding: 0.2 })}
              className="p-2 rounded-full hover:bg-surface-hover transition-colors"
            >
              <Maximize2 className="h-4 w-4 text-text-primary" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Fit view</TooltipContent>
        </Tooltip>

        <div className="w-px bg-border my-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggleLock}
              className={cn(
                'p-2 rounded-full transition-colors',
                isLocked ? 'bg-primary-muted' : 'hover:bg-surface-hover'
              )}
            >
              {isLocked ? (
                <Lock className="h-4 w-4 text-primary" />
              ) : (
                <Unlock className="h-4 w-4 text-text-primary" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>{isLocked ? 'Unlock pan/zoom' : 'Lock pan/zoom'}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
