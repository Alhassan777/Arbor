import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { MessageSquare, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ConversationNodeData {
  title: string;
  messageCount: number;
  isActive: boolean;
  isRoot: boolean;
}

interface ConversationNodeCardProps {
  data: ConversationNodeData;
  selected: boolean;
}

function ConversationNodeCard({ data, selected }: ConversationNodeCardProps) {
  const Icon = data.isRoot ? Sparkles : MessageSquare;

  return (
    <div
      className={cn(
        'group relative w-[200px] rounded-2xl transition-all duration-300 cursor-grab active:cursor-grabbing',
        'backdrop-blur-sm border-2',
        data.isActive
          ? 'bg-gradient-to-br from-canopy/10 via-forest-floor to-forest-floor border-canopy shadow-glow-canopy'
          : 'bg-gradient-to-br from-forest-floor to-undergrowth border-branch hover:border-lichen',
        selected && 'ring-2 ring-canopy ring-offset-2 ring-offset-midnight-soil',
        'hover:scale-105 hover:shadow-dappled'
      )}
    >
      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Left}
        className={cn(
          'w-3 h-3 rounded-full border-2 transition-all',
          data.isActive
            ? 'bg-canopy border-canopy shadow-glow-canopy'
            : 'bg-lichen border-branch group-hover:bg-canopy group-hover:border-canopy'
        )}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={cn(
          'w-3 h-3 rounded-full border-2 transition-all',
          data.isActive
            ? 'bg-canopy border-canopy shadow-glow-canopy'
            : 'bg-lichen border-branch group-hover:bg-canopy group-hover:border-canopy'
        )}
      />

      {/* Node Content */}
      <div className="p-4 space-y-3">
        {/* Header with icon and title */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex-shrink-0 p-2 rounded-lg transition-all duration-300',
              data.isActive
                ? 'bg-canopy/20 text-canopy shadow-sm'
                : 'bg-undergrowth text-lichen group-hover:bg-canopy/10 group-hover:text-canopy'
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                'text-sm font-semibold line-clamp-2 leading-snug transition-colors',
                data.isActive ? 'text-parchment' : 'text-birch group-hover:text-parchment'
              )}
              title={data.title}
            >
              {data.title}
            </p>
          </div>
        </div>

        {/* Footer with message count */}
        {data.messageCount > 0 && (
          <div className="flex items-center justify-between">
            <div
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                data.isActive
                  ? 'bg-canopy/15 text-canopy border border-canopy/30'
                  : 'bg-undergrowth text-lichen border border-branch group-hover:border-lichen'
              )}
            >
              <MessageSquare className="h-3 w-3" />
              <span>{data.messageCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* Glow effect for active state */}
      {data.isActive && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-canopy/5 to-transparent pointer-events-none" />
      )}
    </div>
  );
}

export default memo(ConversationNodeCard);
