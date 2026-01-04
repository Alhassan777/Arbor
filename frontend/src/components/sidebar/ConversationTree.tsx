import { useState, useEffect } from 'react';
import { useConversationStore } from '../../store/conversationStore';
import { useToastStore } from '../../store/toastStore';
import TreeHeader from './TreeHeader';
import TreeSearch from './TreeSearch';
import TreeNode from './TreeNode';
import ConfirmDialog from '../ConfirmDialog';
import NameTreeDialog from '../NameTreeDialog';

interface TreeNodeWrapperProps {
  nodeId: string;
  depth: number;
  expandedNodes: Set<string>;
  onToggleExpand: (nodeId: string) => void;
  searchQuery: string;
  onDelete?: (nodeId: string) => void;
  onMove?: (nodeId: string, newParentId: string | null) => void;
}

function TreeNodeWrapper({
  nodeId,
  depth,
  expandedNodes,
  onToggleExpand,
  searchQuery,
  onDelete,
  onMove,
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
  const isRootNode = tree?.rootNodeId === nodeId;

  return (
    <TreeNode
      node={node}
      depth={depth}
      isActive={isActive}
      isExpanded={isExpanded}
      hasChildren={hasChildren}
      isRootNode={isRootNode}
      onSelect={setCurrentNode}
      onToggleExpand={onToggleExpand}
      onDelete={onDelete}
      onMove={onMove}
    >
      {childNodes.map((childNode) => (
        <TreeNodeWrapper
          key={childNode.id}
          nodeId={childNode.id}
          depth={depth + 1}
          expandedNodes={expandedNodes}
          onToggleExpand={onToggleExpand}
          searchQuery={searchQuery}
          onDelete={onDelete}
          onMove={onMove}
        />
      ))}
    </TreeNode>
  );
}

interface ConversationTreeProps {
  onToggle: () => void;
}

export default function ConversationTree({ onToggle }: ConversationTreeProps) {
  const { tree, initializeNewTree, deleteNode, moveNode, updateTreeName } = useConversationStore();
  const { addToast } = useToastStore();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newTreeDialogOpen, setNewTreeDialogOpen] = useState(false);

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
    setNewTreeDialogOpen(true);
  };

  const handleCreateTree = async (name: string) => {
    await initializeNewTree(name);
    setNewTreeDialogOpen(false);
    addToast(`Created tree: ${name}`, 'success');
  };

  const handleRenameTree = async (name: string) => {
    await updateTreeName(name);
    setRenameDialogOpen(false);
    addToast('Tree renamed', 'success');
  };

  const handleDelete = (nodeId: string) => {
    setNodeToDelete(nodeId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (nodeToDelete) {
      await deleteNode(nodeToDelete);
      setDeleteConfirmOpen(false);
      setNodeToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setNodeToDelete(null);
  };

  const handleMove = async (nodeId: string, newParentId: string | null) => {
    await moveNode(nodeId, newParentId);
  };

  if (!tree) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-text-muted text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col">
        <TreeHeader
          treeName={tree.name}
          onNewChat={handleNewChat}
          onToggle={onToggle}
          onRename={() => setRenameDialogOpen(true)}
        />
        <TreeSearch value={searchQuery} onChange={setSearchQuery} />
        <div className="flex-1 overflow-y-auto">
          {tree.rootNodeId && (
            <TreeNodeWrapper
              nodeId={tree.rootNodeId}
              depth={0}
              expandedNodes={expandedNodes}
              onToggleExpand={handleToggleExpand}
              searchQuery={searchQuery}
              onDelete={handleDelete}
              onMove={handleMove}
            />
          )}
        </div>
      </div>

      <NameTreeDialog
        isOpen={newTreeDialogOpen}
        title="Name Your New Tree"
        placeholder="e.g., Research Project, Code Review, etc."
        onConfirm={handleCreateTree}
        onCancel={() => setNewTreeDialogOpen(false)}
      />

      <NameTreeDialog
        isOpen={renameDialogOpen}
        title="Rename Tree"
        initialValue={tree.name}
        placeholder="Enter new tree name..."
        onConfirm={handleRenameTree}
        onCancel={() => setRenameDialogOpen(false)}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Node"
        message="Are you sure you want to delete this node and all its children? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
}
