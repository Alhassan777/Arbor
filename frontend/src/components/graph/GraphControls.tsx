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
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-slide-up">
      <div className="flex items-center gap-2 bg-gradient-to-br from-forest-floor to-undergrowth backdrop-blur-md border border-branch rounded-2xl px-3 py-2 shadow-dappled">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => zoomIn()}
              className="group p-2.5 rounded-xl hover:bg-canopy/10 transition-all duration-300 active:scale-95"
            >
              <ZoomIn className="h-4 w-4 text-birch group-hover:text-canopy transition-colors" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Zoom in</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => zoomOut()}
              className="group p-2.5 rounded-xl hover:bg-canopy/10 transition-all duration-300 active:scale-95"
            >
              <ZoomOut className="h-4 w-4 text-birch group-hover:text-canopy transition-colors" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Zoom out</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => fitView({ padding: 0.2 })}
              className="group p-2.5 rounded-xl hover:bg-canopy/10 transition-all duration-300 active:scale-95"
            >
              <Maximize2 className="h-4 w-4 text-birch group-hover:text-canopy transition-colors" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Fit view</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-branch" />

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggleLock}
              className={cn(
                'p-2.5 rounded-xl transition-all duration-300 active:scale-95',
                isLocked
                  ? 'bg-canopy/20 shadow-glow-canopy'
                  : 'hover:bg-canopy/10'
              )}
            >
              {isLocked ? (
                <Lock className="h-4 w-4 text-canopy" />
              ) : (
                <Unlock className="h-4 w-4 text-birch hover:text-canopy transition-colors" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>{isLocked ? 'Unlock pan/zoom' : 'Lock pan/zoom'}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
