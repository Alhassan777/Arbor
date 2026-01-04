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
          'w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-all duration-300 group relative',
          'hover:bg-undergrowth/50 rounded-lg mx-2',
          isActive && 'bg-gradient-to-r from-canopy/15 to-transparent border-l-[3px] border-canopy shadow-sm',
          isDragging && 'opacity-40 scale-95',
          isDropTarget && 'bg-canopy/20 border-l-[3px] border-canopy ring-2 ring-canopy/30',
          !isRootNode && onMove && 'cursor-grab active:cursor-grabbing'
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
              className="p-1 hover:bg-canopy/10 rounded-lg transition-all flex-shrink-0 group/chevron"
            >
              <ChevronRight
                className={cn(
                  'h-3.5 w-3.5 transition-all duration-300',
                  isExpanded && 'rotate-90',
                  isActive ? 'text-canopy' : 'text-lichen group-hover/chevron:text-canopy'
                )}
              />
            </button>
          )}

          {!hasChildren && <div className="w-4 flex-shrink-0" />}

          <div
            className={cn(
              'flex-shrink-0 p-1.5 rounded-lg transition-all duration-300',
              isActive ? 'bg-canopy/20 text-canopy' : 'bg-undergrowth text-lichen group-hover:bg-canopy/10 group-hover:text-canopy'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>

          <span
            className={cn(
              'flex-1 truncate font-semibold text-left transition-colors',
              isActive ? 'text-canopy' : 'text-birch group-hover:text-parchment'
            )}
            title={node.title}
          >
            {node.title}
          </span>

          {node.messages.length > 0 && (
            <span
              className={cn(
                'text-xs flex-shrink-0 px-2 py-1 rounded-full font-medium transition-all',
                isActive
                  ? 'bg-canopy/20 text-canopy border border-canopy/30'
                  : 'bg-undergrowth text-lichen border border-branch group-hover:border-lichen'
              )}
            >
              {node.messages.length}
            </span>
          )}
        </button>

        {onDelete && (
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0">
            <Menu
              trigger={
                <button
                  className="p-1.5 hover:bg-canopy/10 rounded-lg transition-all duration-300 active:scale-95 group/menu"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Icons.MoreVertical className="h-4 w-4 text-lichen group-hover/menu:text-canopy transition-colors" />
                </button>
              }
            >
              <MenuItem
                onClick={() => {
                  onDelete(node.id);
                }}
              >
                <div className="flex items-center gap-2 text-amber-sap hover:text-berry transition-colors">
                  <Icons.Trash className="h-4 w-4" />
                  <span className="font-medium">Delete</span>
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
