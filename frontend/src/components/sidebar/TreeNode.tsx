import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Folder, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import type { ConversationNode } from '../../types';
import { Menu, MenuItem } from '../ui/Menu';
import { Icons } from '../ui/Icons';

interface TreeNodeProps {
  node: ConversationNode;
  depth: number;
  isActive: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  isRootNode: boolean;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onDelete?: (id: string) => void;
  onMove?: (nodeId: string, newParentId: string | null) => void;
  children?: React.ReactNode;
}

export default function TreeNode({
  node,
  depth,
  isActive,
  isExpanded,
  hasChildren,
  isRootNode,
  onSelect,
  onToggleExpand,
  onDelete,
  onMove,
  children,
}: TreeNodeProps) {
  const indent = depth * 16;
  const Icon = hasChildren ? Folder : MessageSquare;
  const [isDragging, setIsDragging] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (isRootNode) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/arbor-node-id', node.id);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    const draggedNodeId = e.dataTransfer.types.includes('application/arbor-node-id');
    if (!draggedNodeId) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDropTarget(true);
  };

  const handleDragLeave = () => {
    setIsDropTarget(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);

    const draggedNodeId = e.dataTransfer.getData('application/arbor-node-id');
    if (!draggedNodeId || draggedNodeId === node.id || !onMove) return;

    // Move the dragged node to this node as parent
    onMove(draggedNodeId, node.id);
  };

  return (
    <div>
      <div
        draggable={!isRootNode && !!onMove}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-all duration-150 group relative',
          'hover:bg-surface-hover',
          isActive && 'bg-primary-muted border-l-2 border-primary',
          isDragging && 'opacity-50',
          isDropTarget && 'bg-primary-muted/50 border-l-2 border-primary',
          !isRootNode && onMove && 'cursor-move'
        )}
        style={{ paddingLeft: `${indent + 12}px` }}
      >
        <button
          onClick={() => onSelect(node.id)}
          className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
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

        {onDelete && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <Menu
              trigger={
                <button
                  className="p-1 hover:bg-surface-hover rounded transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Icons.MoreVertical className="h-4 w-4 text-text-muted" />
                </button>
              }
            >
              <MenuItem
                onClick={(e) => {
                  e?.stopPropagation();
                  onDelete(node.id);
                }}
              >
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <Icons.Trash className="h-4 w-4" />
                  <span>Delete</span>
                </div>
              </MenuItem>
            </Menu>
          </div>
        )}
      </div>

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
