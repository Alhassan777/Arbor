/**
 * Arbor Extension - Content Script (Refactored & Modular)
 *
 * Main orchestrator for the browser extension.
 * Now only ~350 lines (down from 2759!)
 */

import { db } from "./db";
import { detectPlatform } from "./platformDetector";
import { GraphRenderer } from "./modules/GraphRenderer";
import { ConnectionLabelsManager } from "./modules/ConnectionLabels";
import { SidebarObserver } from "./modules/SidebarObserver";
import { StateManager } from "./modules/StateManager";
import { TreeManager } from "./modules/TreeManager";
import { NodeManager } from "./modules/NodeManager";
import { NodeInteractions } from "./modules/NodeInteractions";
import { ChatDetector } from "./modules/ChatDetector";
import { UIInjector } from "./modules/UIInjector";
import { GraphPanZoom } from "./modules/GraphPanZoom";
import type { ExtensionState, ChatTree } from "../types";
import type { AvailableChat } from "./modules/ChatDetector";

class ArborExtension {
  private state: ExtensionState = {
    currentTreeId: null,
    currentNodeId: null,
    sidebarVisible: true,
    graphSidebarVisible: false,
    trees: {},
  };

  private availableChats: AvailableChat[] = [];
  private sidebarInjected = false;
  private platform: "chatgpt" | "gemini" | "perplexity";

  // Modules
  private graphRenderer: GraphRenderer;
  private connectionLabels: ConnectionLabelsManager;
  private sidebarObserver: SidebarObserver;
  private stateManager: StateManager;
  private treeManager: TreeManager;
  private nodeManager: NodeManager;
  private nodeInteractions: NodeInteractions;
  private chatDetector: ChatDetector;
  private uiInjector: UIInjector;
  private graphPanZoom: GraphPanZoom;

  constructor(platform: "chatgpt" | "gemini" | "perplexity") {
    this.platform = platform;

    // Initialize modules with proper callbacks
    this.graphRenderer = new GraphRenderer(
      (nodeId) => this.handleNodeClick(nodeId),
      (childId, parentId) => this.handleConnectionLabelClick(childId, parentId)
    );
    this.connectionLabels = new ConnectionLabelsManager();
    this.sidebarObserver = new SidebarObserver();
    this.stateManager = new StateManager();
    this.treeManager = new TreeManager();
    this.nodeManager = new NodeManager();
    this.nodeInteractions = new NodeInteractions();
    this.chatDetector = new ChatDetector(platform);
    this.uiInjector = new UIInjector((action, data) =>
      this.handleSidebarAction(action, data)
    );
    this.graphPanZoom = new GraphPanZoom();

    this.init();
  }

  async init() {
    console.log("🌳 Arbor Extension: Initializing...");

    await db.init();
    console.log("✅ IndexedDB initialized");

    await this.loadState();
    console.log("✅ State loaded");

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.onPageReady());
    } else {
      this.onPageReady();
    }
  }

  private async loadState() {
    const savedState = await this.stateManager.loadState();
    Object.assign(this.state, savedState);

    const trees = await this.stateManager.loadTrees();
    this.state.trees = trees;
  }

  private async saveState() {
    await this.stateManager.saveState({
      currentTreeId: this.state.currentTreeId,
      currentNodeId: this.state.currentNodeId,
    });
  }

  private onPageReady() {
    console.log("📄 Page ready");

    this.injectUI();
    this.setupSidebarObserver();
    this.scanAvailableChats();
    this.detectAndTrackCurrentChat();

    // Periodic updates
    setInterval(() => this.scanAvailableChats(), 10000);
    setInterval(() => this.detectAndTrackCurrentChat(), 5000);
  }

  private setupSidebarObserver() {
    this.sidebarObserver.start(() => {
      if (this.sidebarInjected) {
        console.log("🔄 Re-injecting UI after removal");
        this.injectUI();
      }
    });
  }

  private injectUI() {
    if (this.sidebarInjected) {
      const existing = document.getElementById("arbor-sidebar-container");
      if (existing) return;
    }

    this.uiInjector.injectStyles();
    this.refreshSidebar();
    this.uiInjector.injectGraphView();
    this.attachGraphListeners();
    this.attachZoomControls();
    this.graphPanZoom.init();
    this.graphPanZoom.setOnScaleChange(() => this.updateZoomDisplay());

    this.sidebarInjected = true;
    console.log("✅ UI injected");

    // Render graph if a tree is selected (for re-injection scenarios)
    if (this.state.currentTreeId) {
      setTimeout(() => {
        this.renderGraph();
      }, 100);
    }
  }

  private attachZoomControls() {
    document.getElementById("zoom-in-btn")?.addEventListener("click", () => {
      const currentScale = this.graphPanZoom.getScale();
      this.graphPanZoom.setScale(currentScale + 0.1);
      this.updateZoomDisplay();
    });

    document.getElementById("zoom-out-btn")?.addEventListener("click", () => {
      const currentScale = this.graphPanZoom.getScale();
      this.graphPanZoom.setScale(currentScale - 0.1);
      this.updateZoomDisplay();
    });

    document.getElementById("zoom-reset-btn")?.addEventListener("click", () => {
      this.graphPanZoom.resetZoom();
      this.updateZoomDisplay();
    });
  }

  private updateZoomDisplay() {
    const zoomLevel = document.getElementById("zoom-level");
    if (zoomLevel) {
      const scale = this.graphPanZoom.getScale();
      zoomLevel.textContent = `${Math.round(scale * 100)}%`;
    }
  }

  private refreshSidebar() {
    const untrackedChats = this.getUntrackedChats();
    this.uiInjector.injectSidebar(
      this.state.trees,
      this.state.currentTreeId,
      untrackedChats
    );
  }

  private getUntrackedChats(): AvailableChat[] {
    const trackedUrls = new Set<string>();

    Object.values(this.state.trees).forEach((tree) => {
      Object.values(tree.nodes).forEach((node) => {
        trackedUrls.add(node.url);
      });
    });

    return this.availableChats.filter((chat) => !trackedUrls.has(chat.url));
  }

  private attachGraphListeners() {
    // Add listeners for graph nodes after they're rendered
    setTimeout(() => {
      document.querySelectorAll(".graph-node").forEach((nodeEl) => {
        const nodeId = (nodeEl as HTMLElement).dataset.nodeId;
        if (!nodeId) return;

        // Make node draggable
        const dragState = this.nodeInteractions.makeNodeDraggable(
          nodeEl as HTMLElement,
          nodeId,
          async (id, pos) => {
            if (this.state.currentTreeId) {
              const tree = this.state.trees[this.state.currentTreeId];
              await this.nodeManager.updateNodePosition(
                id,
                pos,
                tree,
                this.state.currentTreeId
              );
              this.renderGraph();
            }
          },
          async (id, newParentId) => {
            if (this.state.currentTreeId) {
              const tree = this.state.trees[this.state.currentTreeId];
              const success = await this.nodeManager.reparentNode(
                id,
                newParentId,
                tree,
                this.state.currentTreeId
              );
              if (success) {
                this.showNotification("Node reparented! 🔄", "success");
                this.renderGraph();
              } else {
                this.showNotification("Cannot reparent node", "error");
              }
            }
          }
        );

        // Click handler (only if not dragged)
        nodeEl.addEventListener("click", () => {
          if (!dragState.hasMoved) {
            this.handleNodeClick(nodeId);
          }
        });

        // Context menu
        nodeEl.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          const mouseEvent = e as MouseEvent;
          this.nodeInteractions.showContextMenu(
            nodeId,
            mouseEvent.clientX,
            mouseEvent.clientY,
            (action, id) => this.handleNodeAction(action, id)
          );
        });
      });
    }, 100);
  }

  private async handleNodeAction(action: string, nodeId: string) {
    if (!this.state.currentTreeId) return;

    const tree = this.state.trees[this.state.currentTreeId];
    const node = tree.nodes[nodeId];

    if (!node) return;

    switch (action) {
      case "rename":
        const newTitle = prompt("Enter new title:", node.title);
        if (newTitle) {
          await this.nodeManager.renameNode(
            nodeId,
            newTitle,
            tree,
            this.state.currentTreeId
          );
          this.showNotification("Node renamed! ✏️", "success");
          this.refresh();
        }
        break;

      case "color":
        const color = prompt("Enter color (hex):", node.color || "#4a9eff");
        if (color) {
          await this.nodeManager.updateNodeColor(
            nodeId,
            color,
            tree,
            this.state.currentTreeId
          );
          this.showNotification("Color updated! 🎨", "success");
          this.renderGraph();
        }
        break;

      case "shape":
        const shape = prompt(
          "Enter shape (circle, rounded, rectangle, diamond):",
          node.shape || "rounded"
        );
        if (shape) {
          await this.nodeManager.updateNodeShape(
            nodeId,
            shape,
            tree,
            this.state.currentTreeId
          );
          this.showNotification("Shape updated! 🔷", "success");
          this.renderGraph();
        }
        break;

      case "label":
        if (node.parentId) {
          await this.handleConnectionLabelClick(nodeId, node.parentId);
        } else {
          this.showNotification("Root nodes have no connection label", "error");
        }
        break;

      case "reset":
        delete node.customPosition;
        await this.nodeManager.updateNodePosition(
          nodeId,
          { x: 0, y: 0 },
          tree,
          this.state.currentTreeId
        );
        this.showNotification("Position reset! 📍", "success");
        this.renderGraph();
        break;

      case "delete":
        await this.deleteNodeFromTree(nodeId);
        break;
    }
  }

  private async handleSidebarAction(action: string, data?: any) {
    switch (action) {
      case "toggleGraph":
        this.uiInjector.toggleGraph();
        // Reinitialize pan/zoom when graph is toggled to visible
        setTimeout(() => {
          const graph = document.getElementById("arbor-graph-container");
          if (graph && !graph.classList.contains("hidden")) {
            this.graphPanZoom.init();
            this.graphPanZoom.setOnScaleChange(() => this.updateZoomDisplay());
            this.updateZoomDisplay();
          }
        }, 100);
        break;
      case "newChat":
        await this.createNewChat();
        break;
      case "newTree":
        await this.createNewTree();
        break;
      case "createBranch":
        await this.createBranch();
        break;
      case "selectTree":
        await this.selectTree(data);
        break;
      case "addChatToTree":
        await this.addChatToTree(data); // data is now chatUrl
        break;
      case "editTreeName":
        await this.editTreeName();
        break;
      case "deleteTree":
        await this.deleteTree();
        break;
      case "deleteNode":
        await this.deleteNodeFromTree(data);
        break;
    }
  }

  private async createNewTree() {
    const name = prompt("Enter tree name:");
    if (!name) return;

    const tree = await this.treeManager.createTree(name, this.platform);
    this.state.trees[tree.id] = tree;
    this.state.currentTreeId = tree.id;
    this.state.currentNodeId = tree.rootNodeId;

    await this.saveState();
    this.showNotification(`Tree "${name}" created! 🌳`, "success");
    this.refresh();
  }

  private async createNewChat() {
    const url = this.platform === "chatgpt" ? "https://chatgpt.com/" : "";
    if (url) {
      window.location.href = url;
    }
  }

  private async createBranch() {
    if (!this.state.currentTreeId || !this.state.currentNodeId) {
      this.showNotification("No active tree or node selected", "error");
      return;
    }

    this.showNotification("Opening new chat to create branch...", "success");
    window.open(
      this.platform === "chatgpt" ? "https://chatgpt.com/" : "",
      "_blank"
    );
  }

  private async selectTree(treeId: string) {
    if (!this.state.trees[treeId]) return;

    this.state.currentTreeId = treeId;
    this.state.currentNodeId = this.state.trees[treeId].rootNodeId;

    await this.saveState();
    // Ensure graph is shown before rendering
    this.uiInjector.showGraph();
    this.refresh();
  }

  private async editTreeName() {
    if (!this.state.currentTreeId) {
      this.showNotification("No tree selected", "error");
      return;
    }

    const tree = this.state.trees[this.state.currentTreeId];
    if (!tree) return;

    const newName = prompt("Enter new tree name:", tree.name || "Unnamed Tree");
    if (!newName || newName.trim() === "") return;

    await this.treeManager.renameTree(
      this.state.currentTreeId,
      newName.trim(),
      this.state.trees
    );

    await this.saveState();
    this.showNotification(`Tree renamed to "${newName}"! ✏️`, "success");
    this.refresh();
  }

  private async deleteTree() {
    if (!this.state.currentTreeId) {
      this.showNotification("No tree selected", "error");
      return;
    }

    const tree = this.state.trees[this.state.currentTreeId];
    if (!tree) {
      this.showNotification("Tree not found", "error");
      return;
    }

    const treeName = tree.name || "Unnamed Tree";
    const nodeCount = Object.keys(tree.nodes).length;

    if (
      !confirm(
        `Delete "${treeName}"?\n\nThis will permanently delete:\n• The entire tree\n• All ${nodeCount} node${
          nodeCount !== 1 ? "s" : ""
        } and their connections\n\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    const result = await this.treeManager.deleteTree(
      this.state.currentTreeId,
      this.state.trees
    );

    if (!result.success) {
      this.showNotification(
        `Failed to delete tree: ${result.error || "Unknown error"}`,
        "error"
      );
      return;
    }

    // Update state to next tree or clear if none
    this.state.currentTreeId = result.nextTreeId;
    this.state.currentNodeId = result.nextTreeId
      ? this.state.trees[result.nextTreeId]?.rootNodeId || null
      : null;

    await this.saveState();
    this.showNotification(`Tree "${treeName}" deleted! 🗑️`, "success");
    this.refresh();
  }

  private async deleteNodeFromTree(nodeId: string) {
    if (!this.state.currentTreeId) {
      this.showNotification("No tree selected", "error");
      return;
    }

    const tree = this.state.trees[this.state.currentTreeId];
    const node = tree?.nodes[nodeId];

    if (!node) {
      this.showNotification("Node not found", "error");
      return;
    }

    // Prevent deleting root node
    if (nodeId === tree.rootNodeId) {
      this.showNotification(
        "Cannot delete root node! Delete the tree instead.",
        "error"
      );
      return;
    }

    // Count descendants
    const countDescendants = (id: string): number => {
      const n = tree.nodes[id];
      if (!n) return 0;
      let count = 1; // Count self
      for (const childId of n.children) {
        count += countDescendants(childId);
      }
      return count;
    };

    const descendantCount = countDescendants(nodeId);
    const willDeleteCount =
      descendantCount > 1 ? `${descendantCount} nodes` : "1 node";

    if (
      !confirm(
        `Delete "${node.title}"?\n\nThis will permanently delete:\n• ${willDeleteCount} (including all children)\n• All connections to this branch\n\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    const result = await this.nodeManager.deleteNode(
      nodeId,
      tree,
      this.state.currentTreeId
    );

    if (!result.success) {
      this.showNotification(
        `Failed to delete node: ${result.error || "Unknown error"}`,
        "error"
      );
      return;
    }

    // Update current node if it was deleted
    if (this.state.currentNodeId === nodeId) {
      this.state.currentNodeId = tree.rootNodeId;
      await this.saveState();
    }

    this.showNotification("Node deleted! 🗑️", "success");
    this.refresh();
  }

  private async addChatToTree(chatUrl: string) {
    if (!this.state.currentTreeId) {
      this.showNotification("No active tree selected", "error");
      return;
    }

    // Find the chat by URL in availableChats
    const chat = this.availableChats.find((c) => c.url === chatUrl);
    if (!chat) {
      this.showNotification("Chat not found", "error");
      return;
    }

    // Check if chat is already tracked
    const untrackedChats = this.getUntrackedChats();
    const isUntracked = untrackedChats.some((c) => c.url === chatUrl);
    if (!isUntracked) {
      this.showNotification("This chat is already in a tree", "error");
      return;
    }

    const tree = this.state.trees[this.state.currentTreeId];
    await this.nodeManager.createNode(
      tree.rootNodeId,
      chat.title,
      chat.url,
      chat.platform,
      tree,
      this.state.currentTreeId
    );

    this.showNotification(`Added "${chat.title}" to tree! ✅`, "success");
    this.refresh();
    this.renderGraph();
  }

  private async handleNodeClick(nodeId: string) {
    if (!this.state.currentTreeId) return;

    const tree = this.state.trees[this.state.currentTreeId];
    const node = tree?.nodes[nodeId];

    if (node) {
      window.location.href = node.url;
    }
  }

  private async handleConnectionLabelClick(childId: string, parentId: string) {
    if (!this.state.currentTreeId) return;

    const tree = this.state.trees[this.state.currentTreeId];
    await this.connectionLabels.editConnectionLabel(
      childId,
      parentId,
      tree,
      this.state.currentTreeId,
      (parentTitle, childTitle) => {
        this.showNotification(
          `Label updated: ${parentTitle} → ${childTitle}`,
          "success"
        );
        this.renderGraph();
      }
    );
  }

  private renderGraph() {
    if (!this.state.currentTreeId) {
      this.uiInjector.hideGraph();
      return;
    }

    const tree = this.state.trees[this.state.currentTreeId];
    if (!tree) {
      this.uiInjector.hideGraph();
      return;
    }

    // Ensure graph container exists
    const graphContainer = document.getElementById("arbor-graph-container");
    if (!graphContainer) {
      this.uiInjector.injectGraphView();
    }

    // Ensure graph container is visible before rendering
    this.uiInjector.showGraph();

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      const content = document.getElementById("graph-content");
      if (!content) {
        console.warn("Graph content container not found, retrying...");
        setTimeout(() => this.renderGraph(), 100);
        return;
      }

      this.graphRenderer.setCurrentTree(this.state.currentTreeId);
      this.graphRenderer.setCurrentNode(this.state.currentNodeId);
      this.graphRenderer.renderGraph(tree);

      // Reinitialize pan/zoom after graph is rendered
      this.graphPanZoom.init();
      this.graphPanZoom.setOnScaleChange(() => this.updateZoomDisplay());
      this.graphPanZoom.applyScale();
      this.updateZoomDisplay();

      // Reattach listeners after render
      this.attachGraphListeners();
    }, 50);
  }

  private async scanAvailableChats() {
    this.availableChats = await this.chatDetector.scanAvailableChats();

    if (this.sidebarInjected) {
      this.refreshSidebar();
    }
  }

  private detectAndTrackCurrentChat() {
    const currentChat = this.chatDetector.detectCurrentChat();

    if (currentChat && this.state.currentTreeId) {
      const tree = this.state.trees[this.state.currentTreeId];
      const existingNode = Object.values(tree.nodes).find(
        (node) => node.url === currentChat.url
      );

      if (existingNode) {
        this.state.currentNodeId = existingNode.id;
      }
    }
  }

  private refresh() {
    this.refreshSidebar();
    this.renderGraph();
  }

  private showNotification(message: string, type: "success" | "error") {
    console.log(`[${type.toUpperCase()}] ${message}`);

    // Simple toast notification
    const toast = document.createElement("div");
    toast.style.cssText = `
        position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === "success" ? "#2dd4a7" : "#ef4444"};
      color: ${type === "success" ? "#0c0f0e" : "#fff"};
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 99999999;
              font-size: 14px;
      font-weight: 600;
      animation: slideIn 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "slideOut 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize extension
const platform = detectPlatform();
if (platform) {
  console.log(`🌳 Arbor: Detected ${platform}`);
  new ArborExtension(platform);
} else {
  console.log("🌳 Arbor: Platform not supported");
}
