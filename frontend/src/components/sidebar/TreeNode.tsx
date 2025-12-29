import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Folder, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ConversationNode } from '../../types';

interface TreeNodeProps {
  node: ConversationNode;
  depth: number;
  isActive: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  children?: React.ReactNode;
}

export default function TreeNode({
  node,
  depth,
  isActive,
  isExpanded,
  hasChildren,
  onSelect,
  onToggleExpand,
  children,
}: TreeNodeProps) {
  const indent = depth * 16;
  const Icon = hasChildren ? Folder : MessageSquare;

  return (
    <div>
      <button
        onClick={() => onSelect(node.id)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-all duration-150 cursor-pointer group relative',
          'hover:bg-surface-hover',
          isActive && 'bg-primary-muted border-l-2 border-primary'
        )}
        style={{ paddingLeft: `${indent + 12}px` }}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.id);
            }}
            className="p-0.5 hover:bg-surface-hover rounded transition-all flex-shrink-0"
          >
            <ChevronRight
              className={cn(
                'h-3 w-3 text-text-muted transition-transform duration-200',
                isExpanded && 'rotate-90'
              )}
            />
          </button>
        )}

        {!hasChildren && <div className="w-4 flex-shrink-0" />}

        <Icon
          className={cn(
            'h-4 w-4 flex-shrink-0',
            isActive ? 'text-primary' : 'text-text-muted'
          )}
        />

        <span
          className={cn(
            'flex-1 truncate font-medium text-left',
            isActive ? 'text-primary' : 'text-text-primary'
          )}
          title={node.title}
        >
          {node.title}
        </span>

        {node.messages.length > 0 && (
          <span className="text-xs text-text-muted flex-shrink-0 bg-surface px-1.5 py-0.5 rounded">
            {node.messages.length}
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
