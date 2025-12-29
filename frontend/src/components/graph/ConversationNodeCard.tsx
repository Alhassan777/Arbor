import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { MessageSquare, Home } from 'lucide-react';
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
  const Icon = data.isRoot ? Home : MessageSquare;

  return (
    <div
      className={cn(
        'w-[180px] h-[70px] rounded-xl border-2 bg-surface p-3 cursor-pointer transition-all duration-200',
        'hover:scale-105 hover:shadow-md',
        data.isActive
          ? 'border-primary shadow-lg shadow-primary/20'
          : 'border-border',
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-primary border-2 border-background"
      />

      {/* Node Content */}
      <div className="h-full flex flex-col justify-between">
        <div className="flex items-start gap-2">
          <Icon className={cn('h-4 w-4 flex-shrink-0', data.isActive ? 'text-primary' : 'text-text-muted')} />
          <p
            className="text-sm font-medium text-text-primary line-clamp-2 leading-tight"
            title={data.title}
          >
            {data.title}
          </p>
        </div>

        {data.messageCount > 0 && (
          <div className="flex justify-end">
            <span className="text-xs text-text-muted bg-surface-hover px-1.5 py-0.5 rounded">
              {data.messageCount} msg{data.messageCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ConversationNodeCard);
