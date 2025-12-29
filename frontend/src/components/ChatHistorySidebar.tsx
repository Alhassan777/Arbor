import { useState, useEffect } from 'react';
import { useConversationStore } from '../store/conversationStore';
import { Icons } from './ui/Icons';
import { cn } from '../lib/utils';
import type { ConversationNode } from '../types';

interface ChatHistorySidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface TreeNodeProps {
  node: ConversationNode;
  level: number;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: (nodeId: string) => void;
  onSelect: (nodeId: string) => void;
  childNodes: ConversationNode[];
  expandedNodes: Set<string>;
  onToggleExpand: (nodeId: string) => void;
}

function TreeNode({
  node,
  level,
  isActive,
  isExpanded,
  onToggle,
  onSelect,
  childNodes,
  expandedNodes,
  onToggleExpand,
}: TreeNodeProps) {
  const hasChildren = childNodes.length > 0;
  const indent = level * 12;

  return (
    <div>
      <button
        onClick={() => onSelect(node.id)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors group',
          'hover:bg-gray-100 dark:hover:bg-gray-700',
          isActive && 'bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-600'
        )}
        style={{ paddingLeft: `${indent + 12}px` }}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          >
            {isExpanded ? (
              <Icons.ChevronRight className="h-3 w-3 text-gray-500 rotate-90 transition-transform" />
            ) : (
              <Icons.ChevronRight className="h-3 w-3 text-gray-500 transition-transform" />
            )}
          </button>
        )}

        {!hasChildren && <div className="w-4" />}

        <div className="flex-1 flex items-center gap-2 min-w-0">
          <Icons.Chat className="h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
          <span
            className={cn(
              'truncate font-medium',
              isActive
                ? 'text-blue-700 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300'
            )}
          >
            {node.title}
          </span>
        </div>

        {node.messages.length > 0 && (
          <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
            {node.messages.length}
          </span>
        )}
      </button>

      {hasChildren && isExpanded && (
        <div>
          {childNodes.map((childNode) => (
            <TreeNodeWrapper
              key={childNode.id}
              nodeId={childNode.id}
              level={level + 1}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TreeNodeWrapperProps {
  nodeId: string;
  level: number;
  expandedNodes: Set<string>;
  onToggleExpand: (nodeId: string) => void;
}

function TreeNodeWrapper({ nodeId, level, expandedNodes, onToggleExpand }: TreeNodeWrapperProps) {
  const { tree, currentNodeId, setCurrentNode } = useConversationStore();

  const node = tree?.nodes[nodeId];
  if (!node) return null;

  const childNodes = Object.values(tree?.nodes || {}).filter(
    (n) => n.parentId === nodeId
  );

  const isActive = currentNodeId === nodeId;
  const isExpanded = expandedNodes.has(nodeId);

  return (
    <TreeNode
      node={node}
      level={level}
      isActive={isActive}
      isExpanded={isExpanded}
      onToggle={onToggleExpand}
      onSelect={setCurrentNode}
      childNodes={childNodes}
      expandedNodes={expandedNodes}
      onToggleExpand={onToggleExpand}
    />
  );
}

export default function ChatHistorySidebar({ isCollapsed, onToggle }: ChatHistorySidebarProps) {
  const { tree } = useConversationStore();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Auto-expand root node
  useEffect(() => {
    if (tree?.rootNodeId && expandedNodes.size === 0) {
      setExpandedNodes(new Set([tree.rootNodeId]));
    }
  }, [tree?.rootNodeId]);

  const handleToggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex items-start justify-center pt-4">
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Expand chat history"
        >
          <Icons.ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
        <div className="text-gray-500 dark:text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Chat History</h2>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Collapse chat history"
        >
          <Icons.ChevronLeft className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Tree View */}
      <div className="flex-1 overflow-y-auto">
        {tree.rootNodeId && (
          <TreeNodeWrapper
            nodeId={tree.rootNodeId}
            level={0}
            expandedNodes={expandedNodes}
            onToggleExpand={handleToggleExpand}
          />
        )}
      </div>
    </div>
  );
}
