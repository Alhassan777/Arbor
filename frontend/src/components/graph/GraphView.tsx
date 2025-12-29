import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ChevronRight, GitBranch } from 'lucide-react';
import { useConversationStore } from '../../store/conversationStore';
import ConversationNodeCard, { ConversationNodeData } from './ConversationNodeCard';
import BranchEdge from './BranchEdge';
import GraphControls from './GraphControls';

const nodeTypes = {
  conversation: ConversationNodeCard,
};

const edgeTypes = {
  branch: BranchEdge,
};

interface GraphViewProps {
  onToggle: () => void;
}

function GraphViewInner({ onToggle }: GraphViewProps) {
  const { tree, currentNodeId, setCurrentNode } = useConversationStore();
  const [isLocked, setIsLocked] = useState(false);

  // Convert conversation tree to React Flow nodes and edges
  const { nodes: flowNodes, edges: flowEdges } = useMemo(() => {
    if (!tree) return { nodes: [], edges: [] };

    const nodes: Node<ConversationNodeData>[] = [];
    const edges: Edge[] = [];

    Object.values(tree.nodes).forEach((node, index) => {
      const isActive = node.id === currentNodeId;
      const isRoot = node.id === tree.rootNodeId;

      nodes.push({
        id: node.id,
        type: 'conversation',
        data: {
          title: node.title,
          messageCount: node.messages.length,
          isActive,
          isRoot,
        },
        position: { x: 0, y: index * 100 },
      });

      if (node.parentId) {
        edges.push({
          id: `${node.parentId}-${node.id}`,
          source: node.parentId,
          target: node.id,
          type: 'branch',
        });
      }
    });

    // Simple layout algorithm: position nodes vertically based on depth
    const layoutNodes = (nodes: Node[], edges: Edge[]) => {
      const positioned = new Set<string>();
      const nodeMap = new Map(nodes.map((n) => [n.id, n]));

      const positionNode = (nodeId: string, depth: number, offset: number): number => {
        if (positioned.has(nodeId)) return offset;

        const node = nodeMap.get(nodeId);
        if (!node) return offset;

        node.position = { x: depth * 220, y: offset };
        positioned.add(nodeId);

        let currentOffset = offset + 100;

        // Position children
        const children = edges.filter((e) => e.source === nodeId).map((e) => e.target);
        children.forEach((childId) => {
          currentOffset = positionNode(childId, depth + 1, currentOffset);
        });

        return currentOffset;
      };

      // Start from root
      if (tree) {
        positionNode(tree.rootNodeId, 0, 0);
      }

      return nodes;
    };

    return {
      nodes: layoutNodes(nodes, edges),
      edges,
    };
  }, [tree, currentNodeId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // Update nodes when flowNodes change
  useMemo(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setCurrentNode(node.id);
    },
    [setCurrentNode]
  );

  if (!tree) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <GitBranch className="h-16 w-16 text-text-muted mx-auto mb-4" />
          <p className="text-sm text-text-secondary">No graph to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">Graph View</h2>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-surface-hover rounded transition-colors"
          title="Collapse graph view"
        >
          <ChevronRight className="h-4 w-4 text-text-secondary" />
        </button>
      </div>

      {/* Graph */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={isLocked ? undefined : onNodesChange}
          onEdgesChange={isLocked ? undefined : onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          zoomOnScroll={!isLocked}
          panOnScroll={!isLocked}
          panOnDrag={!isLocked}
          nodesDraggable={!isLocked}
          nodesConnectable={false}
          elementsSelectable={!isLocked}
          className="bg-background"
        >
          <Background color="rgba(255, 255, 255, 0.03)" gap={16} />
          <MiniMap
            nodeColor={(node) => {
              const data = node.data as ConversationNodeData;
              return data.isActive ? '#6366f1' : '#52525b';
            }}
            className="bg-surface border border-border"
            maskColor="rgba(10, 10, 15, 0.6)"
          />
          <GraphControls isLocked={isLocked} onToggleLock={() => setIsLocked(!isLocked)} />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function GraphView({ onToggle }: GraphViewProps) {
  return (
    <ReactFlowProvider>
      <GraphViewInner onToggle={onToggle} />
    </ReactFlowProvider>
  );
}
