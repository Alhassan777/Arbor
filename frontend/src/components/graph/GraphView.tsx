import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { ChevronRight, GitBranch } from "lucide-react";
import { useConversationStore } from "../../store/conversationStore";
import { useConnectionLabels } from "../../hooks/useConnectionLabels";
import { useToastStore } from "../../store/toastStore";
import ConversationNodeCard, {
  ConversationNodeData,
} from "./ConversationNodeCard";
import BranchEdge from "./BranchEdge";
import GraphControls from "./GraphControls";
import ParticleBackground from "../effects/ParticleBackground";
import EdgeLabelDialog from "./EdgeLabelDialog";
import type { ConnectionLabelType } from "../../types";

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
  const { connectionLabels, updateConnectionLabel } = useConnectionLabels(
    tree?.id || null
  );
  const { addToast } = useToastStore();
  const [isLocked, setIsLocked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isSavingLabel, setIsSavingLabel] = useState(false);

  const handleEdgeLabelClick = useCallback((edgeId: string) => {
    setSelectedEdgeId(edgeId);
    setLabelDialogOpen(true);
  }, []);

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
        type: "conversation",
        data: {
          title: node.title,
          messageCount: node.messages.length,
          isActive,
          isRoot,
        },
        position: { x: 0, y: index * 100 },
      });

      if (node.parentId) {
        const edgeId = `${node.parentId}-${node.id}`;
        const label = connectionLabels.get(edgeId);

        edges.push({
          id: edgeId,
          source: node.parentId,
          target: node.id,
          type: "branch",
          data: {
            label,
            onLabelClick: handleEdgeLabelClick,
          },
        });
      }
    });

    // Simple layout algorithm: position nodes vertically based on depth
    const layoutNodes = (nodes: Node[], edges: Edge[]) => {
      const positioned = new Set<string>();
      const nodeMap = new Map(nodes.map((n) => [n.id, n]));

      const positionNode = (
        nodeId: string,
        depth: number,
        offset: number
      ): number => {
        if (positioned.has(nodeId)) return offset;

        const node = nodeMap.get(nodeId);
        if (!node) return offset;

        node.position = { x: depth * 220, y: offset };
        positioned.add(nodeId);

        let currentOffset = offset + 100;

        // Position children
        const children = edges
          .filter((e) => e.source === nodeId)
          .map((e) => e.target);
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
  }, [tree, currentNodeId, connectionLabels, handleEdgeLabelClick]);

  const handleSaveLabel = useCallback(
    async (type: ConnectionLabelType, text: string) => {
      if (!selectedEdgeId || !tree) return;

      setIsSavingLabel(true);
      try {
        await updateConnectionLabel(selectedEdgeId, {
          type,
          text,
          aiGenerated: false,
          userEdited: true,
        });

        addToast("Connection label saved", "success");
        setLabelDialogOpen(false);
        setSelectedEdgeId(null);
      } catch (error) {
        console.error("Error saving label:", error);
        addToast("Failed to save label", "error");
      } finally {
        setIsSavingLabel(false);
      }
    },
    [selectedEdgeId, tree, updateConnectionLabel, addToast]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // Update nodes when flowNodes change
  useMemo(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  const onNodeDragStart = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // Store the starting position
      setDragStartPos({ x: node.position.x, y: node.position.y });
      setIsDragging(true);
    },
    []
  );

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // Check if the node actually moved
      if (dragStartPos) {
        const dx = Math.abs(node.position.x - dragStartPos.x);
        const dy = Math.abs(node.position.y - dragStartPos.y);
        const hasMoved = dx > 5 || dy > 5; // 5px threshold

        // Only keep isDragging true if the node actually moved
        if (!hasMoved) {
          setIsDragging(false);
        } else {
          // Reset after a delay to prevent accidental navigation
          setTimeout(() => setIsDragging(false), 100);
        }
      } else {
        setIsDragging(false);
      }
      setDragStartPos(null);
    },
    [dragStartPos]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // Only navigate if we're not dragging
      if (!isDragging) {
        setCurrentNode(node.id);
      }
    },
    [setCurrentNode, isDragging]
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      // Open label dialog when edge is clicked
      handleEdgeLabelClick(edge.id);
    },
    [handleEdgeLabelClick]
  );

  // Get parent and child titles for label dialog
  const selectedEdgeNodes = useMemo(() => {
    if (!selectedEdgeId || !tree) return null;

    const [parentId, childId] = selectedEdgeId.split("-");
    const parentNode = tree.nodes[parentId];
    const childNode = tree.nodes[childId];

    return parentNode && childNode
      ? { parentTitle: parentNode.title, childTitle: childNode.title }
      : null;
  }, [selectedEdgeId, tree]);

  const existingLabel = selectedEdgeId
    ? connectionLabels.get(selectedEdgeId)
    : null;

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
    <div className="h-full flex flex-col bg-midnight-soil">
      {/* Header */}
      <div className="px-5 py-4 border-b border-branch bg-gradient-to-br from-forest-floor to-midnight-soil flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-canopy/10 rounded-xl">
            <GitBranch className="h-4 w-4 text-canopy" />
          </div>
          <h2 className="text-sm font-bold text-parchment tracking-wide">
            Graph View
          </h2>
        </div>
        <button
          onClick={onToggle}
          className="p-2 hover:bg-undergrowth rounded-xl transition-all duration-300 active:scale-95 group"
          title="Collapse graph view"
        >
          <ChevronRight className="h-4 w-4 text-birch group-hover:text-canopy transition-colors" />
        </button>
      </div>

      {/* Graph */}
      <div className="flex-1 relative">
        <ParticleBackground particleCount={40} />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={isLocked ? undefined : onNodesChange}
          onEdgesChange={isLocked ? undefined : onEdgesChange}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
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
          <Background color="rgba(45, 212, 167, 0.02)" gap={20} />
          <MiniMap
            nodeColor={(node) => {
              const data = node.data as ConversationNodeData;
              return data.isActive ? "#2dd4a7" : "#4a5854";
            }}
            className="!bg-gradient-to-br !from-forest-floor !to-undergrowth !border-2 !border-branch !rounded-xl !shadow-dappled"
            maskColor="rgba(12, 15, 14, 0.7)"
          />
          <GraphControls
            isLocked={isLocked}
            onToggleLock={() => setIsLocked(!isLocked)}
          />
        </ReactFlow>
      </div>

      {/* Edge Label Dialog */}
      {selectedEdgeNodes && (
        <EdgeLabelDialog
          isOpen={labelDialogOpen}
          onClose={() => {
            setLabelDialogOpen(false);
            setSelectedEdgeId(null);
          }}
          onSave={handleSaveLabel}
          parentTitle={selectedEdgeNodes.parentTitle}
          childTitle={selectedEdgeNodes.childTitle}
          initialType={existingLabel?.type}
          initialText={existingLabel?.text}
          isLoading={isSavingLabel}
        />
      )}
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
