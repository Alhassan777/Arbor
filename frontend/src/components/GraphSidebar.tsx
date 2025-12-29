import { useCallback, useMemo, useState, useEffect } from 'react';
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
import { Icons } from './ui/Icons';

interface GraphSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onOpenSettings: () => void;
}

export default function GraphSidebar({ isCollapsed, onToggle, onOpenSettings }: GraphSidebarProps) {
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
      <div className="hidden md:flex w-12 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 items-start justify-center pt-4">
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Expand graph view"
        >
          <Icons.ChevronLeft className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onToggle}
      />

      {/* Sidebar */}
      <div className="w-80 md:w-80 fixed md:relative inset-y-0 right-0 z-50 md:z-auto bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Graph View</h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={onOpenSettings}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Settings"
            >
              <Icons.Settings className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Collapse graph view"
            >
              <Icons.ChevronRight className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
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
    </>
  );
}
