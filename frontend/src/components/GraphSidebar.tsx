import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useConversationStore } from '../store/conversationStore';

export default function GraphSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { tree, currentNodeId, setCurrentNode } = useConversationStore();

  // Convert conversation tree to React Flow nodes and edges
  const { nodes: flowNodes, edges: flowEdges } = useMemo(() => {
    if (!tree) return { nodes: [], edges: [] };

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    Object.values(tree.nodes).forEach((node, index) => {
      const isActive = node.id === currentNodeId;

      nodes.push({
        id: node.id,
        type: 'default',
        data: {
          label: (
            <div className="px-2 py-1 text-xs">
              <div className="font-medium truncate max-w-[120px]">
                {node.title}
              </div>
            </div>
          ),
        },
        position: { x: 0, y: index * 100 }, // Will be auto-laid out
        style: {
          background: isActive ? '#3B82F6' : '#ffffff',
          color: isActive ? '#ffffff' : '#000000',
          border: `2px solid ${isActive ? '#2563EB' : '#E5E7EB'}`,
          borderRadius: '8px',
          fontSize: '12px',
          width: 150,
        },
      });

      if (node.parentId) {
        edges.push({
          id: `${node.parentId}-${node.id}`,
          source: node.parentId,
          target: node.id,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#94A3B8' },
        });
      }
    });

    // Simple layout algorithm: position nodes vertically based on depth
    const layoutNodes = (nodes: Node[], edges: Edge[]) => {
      const positioned = new Set<string>();
      const nodeMap = new Map(nodes.map(n => [n.id, n]));

      const positionNode = (nodeId: string, depth: number, offset: number): number => {
        if (positioned.has(nodeId)) return offset;

        const node = nodeMap.get(nodeId);
        if (!node) return offset;

        node.position = { x: depth * 200, y: offset };
        positioned.add(nodeId);

        let currentOffset = offset + 100;

        // Position children
        const children = edges.filter(e => e.source === nodeId).map(e => e.target);
        children.forEach(childId => {
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

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white border-r border-gray-200 flex items-start justify-center pt-4">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Expand sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Conversation Tree</h2>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Collapse sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* Graph */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
