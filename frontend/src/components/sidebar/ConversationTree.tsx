import { useState, useEffect } from 'react';
import { useConversationStore } from '../../store/conversationStore';
import TreeHeader from './TreeHeader';
import TreeSearch from './TreeSearch';
import TreeNode from './TreeNode';

interface TreeNodeWrapperProps {
  nodeId: string;
  depth: number;
  expandedNodes: Set<string>;
  onToggleExpand: (nodeId: string) => void;
  searchQuery: string;
}

function TreeNodeWrapper({
  nodeId,
  depth,
  expandedNodes,
  onToggleExpand,
  searchQuery,
}: TreeNodeWrapperProps) {
  const { tree, currentNodeId, setCurrentNode } = useConversationStore();

  const node = tree?.nodes[nodeId];
  if (!node) return null;

  // Filter based on search query
  if (searchQuery && !node.title.toLowerCase().includes(searchQuery.toLowerCase())) {
    return null;
  }

  const childNodes = Object.values(tree?.nodes || {}).filter(
    (n) => n.parentId === nodeId
  );

  const isActive = currentNodeId === nodeId;
  const isExpanded = expandedNodes.has(nodeId);
  const hasChildren = childNodes.length > 0;

  return (
    <TreeNode
      node={node}
      depth={depth}
      isActive={isActive}
      isExpanded={isExpanded}
      hasChildren={hasChildren}
      onSelect={setCurrentNode}
      onToggleExpand={onToggleExpand}
    >
      {childNodes.map((childNode) => (
        <TreeNodeWrapper
          key={childNode.id}
          nodeId={childNode.id}
          depth={depth + 1}
          expandedNodes={expandedNodes}
          onToggleExpand={onToggleExpand}
          searchQuery={searchQuery}
        />
      ))}
    </TreeNode>
  );
}

interface ConversationTreeProps {
  onToggle: () => void;
}

export default function ConversationTree({ onToggle }: ConversationTreeProps) {
  const { tree, initializeNewTree } = useConversationStore();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleNewChat = () => {
    initializeNewTree();
  };

  if (!tree) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-text-muted text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <TreeHeader onNewChat={handleNewChat} onToggle={onToggle} />
      <TreeSearch value={searchQuery} onChange={setSearchQuery} />
      <div className="flex-1 overflow-y-auto">
        {tree.rootNodeId && (
          <TreeNodeWrapper
            nodeId={tree.rootNodeId}
            depth={0}
            expandedNodes={expandedNodes}
            onToggleExpand={handleToggleExpand}
            searchQuery={searchQuery}
          />
        )}
      </div>
    </div>
  );
}
