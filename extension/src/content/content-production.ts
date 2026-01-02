// Production-ready content script with real chat tracking
import { ChatNode, ChatTree, ExtensionState, ConnectionType } from '../types';
import { db } from '../storage/indexeddb';
import { chatgptPlatform } from '../platforms/chatgpt';

class ArborExtensionProduction {
  private state: ExtensionState;
  private sidebarInjected = false;
  private currentPlatform = chatgptPlatform;
  private currentChatId: string | null = null;
  private canvasZoom = 1;
  private canvasPanX = 0;
  private canvasPanY = 0;
  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;

  constructor() {
    this.state = {
      trees: {},
      currentTreeId: null,
      currentNodeId: null,
      sidebarVisible: true,
      graphSidebarVisible: true,
    };
    this.init();
  }

  async init() {
    console.log('🌳 Arbor Extension: Initializing...');

    // Initialize IndexedDB
    await db.init();
    console.log('✅ IndexedDB initialized');

    // Load state from IndexedDB
    await this.loadState();

    // Wait for page to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onPageReady());
    } else {
      this.onPageReady();
    }
  }

  private async loadState() {
    const savedState = await db.getState();

    if (savedState.currentTreeId) {
      this.state.currentTreeId = savedState.currentTreeId as string;
    }
    if (savedState.currentNodeId) {
      this.state.currentNodeId = savedState.currentNodeId as string;
    }

    // Load all trees
    const trees = await db.getAllTrees();
    this.state.trees = {};
    for (const tree of trees) {
      this.state.trees[tree.id] = tree;
    }

    console.log(`📚 Loaded ${trees.length} trees from storage`);
  }

  private onPageReady() {
    console.log('📄 Page ready');

    // Inject UI
    this.injectUI();

    // Detect current chat
    this.detectAndTrackCurrentChat();

    // Watch for navigation changes (ChatGPT is a SPA)
    this.currentPlatform.onNavigationChange((chatId) => {
      console.log('🔄 Navigation detected:', chatId);
      this.currentChatId = chatId;
      this.detectAndTrackCurrentChat();
    });
  }

  private async detectAndTrackCurrentChat() {
    if (!this.currentPlatform.isInConversation()) {
      console.log('ℹ️ Not in a conversation');
      return;
    }

    const chatId = this.currentPlatform.getChatId();
    const url = this.currentPlatform.detectCurrentChatUrl();
    const title = this.currentPlatform.detectChatTitle();

    console.log('💬 Current chat:', { chatId, title, url });

    if (!chatId || !url) return;

    // Check if this chat is already tracked
    const existingNode = await db.findNodeByUrl(url);

    if (existingNode) {
      console.log('✅ Chat already tracked:', existingNode.title);
      this.state.currentNodeId = existingNode.id;
      await this.saveState();
      this.refresh();
    } else {
      console.log('🆕 New chat detected - showing prompt');
      this.showTrackChatPrompt(chatId, url, title || 'Untitled Chat');
    }
  }

  private showTrackChatPrompt(chatId: string, url: string, title: string) {
    // Create a subtle notification banner
    const banner = document.createElement('div');
    banner.id = 'arbor-track-prompt';
    banner.innerHTML = `
      <div style="
        position: fixed;
        top: 16px;
        left: 50%;
        transform: translateX(-50%);
        background: #2d3748;
        color: #fff;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999999;
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
      ">
        <span>🌳</span>
        <span>Track this chat in Arbor?</span>
        <button id="arbor-track-yes" style="
          background: #4a9eff;
          color: #fff;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        ">Yes</button>
        <button id="arbor-track-no" style="
          background: #555;
          color: #fff;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        ">Not now</button>
      </div>
    `;

    document.body.appendChild(banner);

    // Event listeners
    document.getElementById('arbor-track-yes')?.addEventListener('click', () => {
      this.trackCurrentChat(chatId, url, title);
      banner.remove();
    });

    document.getElementById('arbor-track-no')?.addEventListener('click', () => {
      banner.remove();
    });

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      banner.remove();
    }, 10000);
  }

  private async trackCurrentChat(chatId: string, url: string, title: string) {
    const nodeId = `node-${Date.now()}`;

    const newNode: ChatNode = {
      id: nodeId,
      title,
      url,
      platform: 'chatgpt',
      parentId: this.state.currentNodeId, // Link to current node as parent
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If no current tree, create one
    if (!this.state.currentTreeId) {
      const treeId = `tree-${Date.now()}`;
      const tree: ChatTree = {
        id: treeId,
        rootNodeId: nodeId,
        title: title,
        nodes: { [nodeId]: newNode },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.state.trees[treeId] = tree;
      this.state.currentTreeId = treeId;
      this.state.currentNodeId = nodeId;

      await db.saveTree(tree);
      await db.saveNode(newNode, treeId);

      console.log('✅ Created new tree:', tree.title);
    } else {
      // Add to existing tree
      const tree = this.state.trees[this.state.currentTreeId];
      tree.nodes[nodeId] = newNode;

      // Link as child of current node
      if (this.state.currentNodeId && tree.nodes[this.state.currentNodeId]) {
        const parent = tree.nodes[this.state.currentNodeId];
        if (!parent.children.includes(nodeId)) {
          parent.children.push(nodeId);
          await db.saveNode(parent, this.state.currentTreeId);
        }
      }

      this.state.currentNodeId = nodeId;

      await db.saveTree(tree);
      await db.saveNode(newNode, this.state.currentTreeId);

      console.log('✅ Added node to tree:', tree.title);
    }

    await this.saveState();
    this.refresh();

    // Show success notification
    this.showNotification('Chat tracked successfully! 🌳', 'success');
  }

  private showNotification(message: string, type: 'success' | 'error' = 'success') {
    const banner = document.createElement('div');
    banner.innerHTML = `
      <div style="
        position: fixed;
        top: 16px;
        right: 16px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: #fff;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
      ">
        ${message}
      </div>
    `;

    document.body.appendChild(banner);

    setTimeout(() => {
      banner.remove();
    }, 3000);
  }

  private injectUI() {
    if (this.sidebarInjected) return;

    this.injectStyles();
    this.injectSidebar();
    this.injectGraphView();
    this.injectToggleButtons();
    this.adjustMainContent();

    this.sidebarInjected = true;
    console.log('✅ UI injected');
  }

  private injectToggleButtons() {
    // Left toggle button (for tree sidebar)
    const leftToggle = document.createElement('div');
    leftToggle.id = 'arbor-left-toggle';
    leftToggle.innerHTML = `
      <button style="
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #4a9eff;
        color: #fff;
        border: none;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 999998;
        display: none;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      " onmouseover="this.style.background='#3a8eef'" onmouseout="this.style.background='#4a9eff'">
        🌳
      </button>
    `;
    document.body.appendChild(leftToggle);

    leftToggle.querySelector('button')?.addEventListener('click', () => {
      const sidebar = document.getElementById('arbor-sidebar-container');
      if (sidebar) {
        sidebar.style.display = 'flex';
        this.state.sidebarVisible = true;
        (leftToggle.querySelector('button') as HTMLElement).style.display = 'none';
        this.adjustMainContent();
      }
    });

    // Right toggle button (for graph sidebar)
    const rightToggle = document.createElement('div');
    rightToggle.id = 'arbor-right-toggle';
    rightToggle.innerHTML = `
      <button style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #4a9eff;
        color: #fff;
        border: none;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 999998;
        display: none;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      " onmouseover="this.style.background='#3a8eef'" onmouseout="this.style.background='#4a9eff'">
        📊
      </button>
    `;
    document.body.appendChild(rightToggle);

    rightToggle.querySelector('button')?.addEventListener('click', () => {
      const graph = document.getElementById('arbor-graph-container');
      if (graph) {
        graph.style.display = 'flex';
        this.state.graphSidebarVisible = true;
        (rightToggle.querySelector('button') as HTMLElement).style.display = 'none';
        this.adjustMainContent();
      }
    });
  }

  private injectStyles() {
    const style = document.createElement('style');
    style.id = 'arbor-extension-styles';
    style.textContent = `
      #arbor-sidebar-container,
      #arbor-graph-container {
        position: fixed;
        top: 0;
        height: 100vh;
        background: #1a1a1a;
        color: #e0e0e0;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        flex-direction: column;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
      }

      #arbor-sidebar-container {
        left: 0;
        width: 320px;
      }

      #arbor-graph-container {
        right: 0;
        width: 400px;
        box-shadow: -2px 0 8px rgba(0, 0, 0, 0.3);
      }

      .arbor-header {
        padding: 16px;
        border-bottom: 1px solid #333;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .arbor-header h2 {
        font-size: 16px;
        font-weight: 600;
        color: #fff;
      }

      .arbor-toggle-btn {
        background: #333;
        border: none;
        color: #fff;
        padding: 6px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }

      .arbor-toggle-btn:hover {
        background: #444;
      }

      .arbor-content {
        flex: 1;
        overflow-y: auto;
        padding: 12px;
      }

      .tree-node {
        padding: 10px 12px;
        margin: 4px 0;
        background: #252525;
        border-radius: 6px;
        cursor: pointer;
        border-left: 3px solid #4a9eff;
        transition: all 0.2s;
      }

      .tree-node:hover {
        background: #2a2a2a;
        border-left-color: #6bb3ff;
      }

      .tree-node.active {
        background: #2d3748;
        border-left-color: #4a9eff;
      }

      .tree-node-title {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 4px;
        color: #fff;
      }

      .tree-node-meta {
        font-size: 11px;
        color: #999;
        display: flex;
        gap: 8px;
      }

      .tree-node-children {
        margin-left: 16px;
        border-left: 1px solid #333;
        padding-left: 8px;
      }

      .action-buttons {
        padding: 12px;
        border-top: 1px solid #333;
        display: flex;
        gap: 8px;
      }

      .btn {
        flex: 1;
        padding: 10px;
        background: #4a9eff;
        color: #fff;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: background 0.2s;
      }

      .btn:hover {
        background: #3a8eef;
      }

      .btn-secondary {
        background: #333;
      }

      .btn-secondary:hover {
        background: #444;
      }

      .graph-canvas {
        width: 100%;
        height: 100%;
        background: #0d0d0d;
        position: relative;
        overflow: auto;
      }

      .graph-node {
        position: absolute;
        background: #252525;
        border: 2px solid #4a9eff;
        border-radius: 8px;
        padding: 12px;
        min-width: 120px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .graph-node:hover {
        background: #2a2a2a;
        border-color: #6bb3ff;
        transform: scale(1.05);
      }

      .graph-node.active {
        border-color: #10b981;
        background: #1e3a2e;
      }

      .graph-node-title {
        font-size: 12px;
        font-weight: 600;
        color: #fff;
        margin-bottom: 4px;
      }

      .graph-node-platform {
        font-size: 10px;
        color: #999;
      }

      .connection-line {
        position: absolute;
        height: 2px;
        background: #4a9eff;
        transform-origin: left center;
        opacity: 0.6;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #666;
        text-align: center;
        padding: 40px 20px;
      }

      .empty-state-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }

      .empty-state-text {
        font-size: 14px;
        line-height: 1.5;
      }
    `;
    document.head.appendChild(style);
  }

  private injectSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'arbor-sidebar-container';
    sidebar.innerHTML = this.getSidebarHTML();
    document.body.insertBefore(sidebar, document.body.firstChild);

    this.attachSidebarListeners();
  }

  private injectGraphView() {
    const graph = document.createElement('div');
    graph.id = 'arbor-graph-container';
    graph.innerHTML = this.getGraphHTML();
    document.body.appendChild(graph);

    this.renderGraph();
    this.attachGraphListeners();
  }

  private getSidebarHTML(): string {
    const currentTree = this.state.currentTreeId
      ? this.state.trees[this.state.currentTreeId]
      : null;

    if (!currentTree) {
      return `
        <div class="arbor-header">
          <h2>🌳 Arbor Trees</h2>
          <button class="arbor-toggle-btn" id="toggle-sidebar">Hide</button>
        </div>
        <div class="arbor-content">
          <div class="empty-state">
            <div class="empty-state-icon">🌱</div>
            <div class="empty-state-text">
              <strong>Welcome to Arbor!</strong><br><br>

              <strong>📚 To add existing chats:</strong><br>
              Click "Browse Chats" button below<br><br>

              <strong>🆕 Or visit any ChatGPT chat</strong><br>
              and click "Yes" when prompted
            </div>
          </div>
        </div>
        <div class="action-buttons">
          <button class="btn" id="browse-chats-empty" title="Add existing ChatGPT conversations">
            📚 Browse Chats
          </button>
        </div>
        <div style="padding: 12px; border-top: 1px solid #333; font-size: 11px; color: #666;">
          <strong style="color: #999;">Quick Tips:</strong><br>
          • <strong>Branch:</strong> Create subtopic from current chat<br>
          • <strong>New Tree:</strong> Start fresh tree for new project
        </div>
      `;
    }

    const treeHTML = this.renderTreeNode(currentTree.rootNodeId, currentTree);

    return `
      <div class="arbor-header">
        <h2 id="tree-title-editable" style="cursor: pointer; flex: 1;" title="Click to edit tree title">🌳 ${currentTree.title}</h2>
        <button class="arbor-toggle-btn" id="toggle-sidebar">Hide</button>
      </div>
      <div class="arbor-content" id="tree-view">
        ${treeHTML}
      </div>
      <div class="action-buttons">
        <button class="btn" id="browse-chats" title="Add existing ChatGPT conversations">
          📚 Browse Chats
        </button>
      </div>
      <div class="action-buttons">
        <button class="btn btn-secondary" id="create-branch" title="Create a subtopic from current chat (copies context)">
          🌿 Branch
        </button>
        <button class="btn btn-secondary" id="new-tree" title="Start a new tree for a different project">
          🌳 New Tree
        </button>
      </div>
    `;
  }

  private renderTreeNode(nodeId: string, tree: ChatTree, depth = 0): string {
    const node = tree.nodes[nodeId];
    if (!node) return '';

    const isActive = this.state.currentNodeId === nodeId;
    const platformEmoji = {
      chatgpt: '🤖',
      gemini: '✨',
      perplexity: '🔍',
    }[node.platform];

    let html = `
      <div class="tree-node ${isActive ? 'active' : ''}" data-node-id="${nodeId}">
        <div class="tree-node-title">${platformEmoji} ${node.title}</div>
        <div class="tree-node-meta">
          <span>${node.children.length} branches</span>
          ${node.connectionLabel ? `<span>• ${node.connectionLabel}</span>` : ''}
        </div>
      </div>
    `;

    if (node.children.length > 0) {
      html += '<div class="tree-node-children">';
      for (const childId of node.children) {
        html += this.renderTreeNode(childId, tree, depth + 1);
      }
      html += '</div>';
    }

    return html;
  }

  private getGraphHTML(): string {
    return `
      <div class="arbor-header">
        <h2>📊 Graph View</h2>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button class="arbor-toggle-btn" id="zoom-out" title="Zoom Out">−</button>
          <span id="zoom-level" style="font-size: 12px; color: #999; min-width: 40px;">100%</span>
          <button class="arbor-toggle-btn" id="zoom-in" title="Zoom In">+</button>
          <button class="arbor-toggle-btn" id="reset-zoom" title="Reset View">⟲</button>
          <button class="arbor-toggle-btn" id="toggle-graph">Hide</button>
        </div>
      </div>
      <div class="arbor-content">
        <div class="graph-canvas" id="graph-canvas">
          <div id="graph-content" style="transform-origin: 0 0; transition: transform 0.1s;"></div>
        </div>
      </div>
    `;
  }

  private renderGraph() {
    const container = document.getElementById('graph-content');
    if (!container || !this.state.currentTreeId) return;

    const tree = this.state.trees[this.state.currentTreeId];
    if (!tree) return;

    container.innerHTML = '';

    const positions = this.calculateNodePositions(tree);
    this.renderConnections(tree, positions, container);
    this.renderGraphNodes(tree, positions, container);

    // Apply current zoom and pan
    this.updateCanvasTransform();
  }

  private calculateNodePositions(tree: ChatTree): Record<string, { x: number; y: number }> {
    const positions: Record<string, { x: number; y: number }> = {};
    const levelCounts: Record<number, number> = {};

    const traverse = (nodeId: string, level: number) => {
      const node = tree.nodes[nodeId];
      if (!node) return;

      // Use custom position if available, otherwise auto-layout
      if (node.customPosition) {
        positions[nodeId] = node.customPosition;
      } else {
        if (!levelCounts[level]) levelCounts[level] = 0;

        const x = 40 + level * 180;
        const y = 40 + levelCounts[level] * 100;

        positions[nodeId] = { x, y };
        levelCounts[level]++;
      }

      node.children.forEach((childId) => traverse(childId, level + 1));
    };

    traverse(tree.rootNodeId, 0);
    return positions;
  }

  private renderConnections(
    tree: ChatTree,
    positions: Record<string, { x: number; y: number }>,
    canvas: HTMLElement
  ) {
    Object.values(tree.nodes).forEach((node) => {
      if (node.parentId && positions[node.parentId] && positions[node.id]) {
        const parent = positions[node.parentId];
        const child = positions[node.id];

        const line = document.createElement('div');
        line.className = 'connection-line';

        const length = Math.sqrt(
          Math.pow(child.x - parent.x, 2) + Math.pow(child.y - parent.y, 2)
        );
        const angle = (Math.atan2(child.y - parent.y, child.x - parent.x) * 180) / Math.PI;

        line.style.width = `${length}px`;
        line.style.left = `${parent.x + 60}px`;
        line.style.top = `${parent.y + 20}px`;
        line.style.transform = `rotate(${angle}deg)`;

        canvas.appendChild(line);

        // Add connection label if exists
        if (node.connectionLabel) {
          const label = document.createElement('div');
          label.className = 'connection-label';

          // Calculate midpoint
          const midX = (parent.x + child.x) / 2 + 60;
          const midY = (parent.y + child.y) / 2 + 20;

          label.style.position = 'absolute';
          label.style.left = `${midX}px`;
          label.style.top = `${midY}px`;
          label.style.transform = 'translate(-50%, -50%)';
          label.style.background = '#1a1a1a';
          label.style.border = '1px solid #4a9eff';
          label.style.borderRadius = '4px';
          label.style.padding = '2px 6px';
          label.style.fontSize = '10px';
          label.style.color = '#4a9eff';
          label.style.whiteSpace = 'nowrap';
          label.style.pointerEvents = 'none';
          label.style.zIndex = '10';
          label.textContent = node.connectionLabel;

          canvas.appendChild(label);
        }
      }
    });
  }

  private renderGraphNodes(
    tree: ChatTree,
    positions: Record<string, { x: number; y: number }>,
    canvas: HTMLElement
  ) {
    Object.entries(positions).forEach(([nodeId, pos]) => {
      const node = tree.nodes[nodeId];
      if (!node) return;

      const isActive = this.state.currentNodeId === nodeId;
      const nodeEl = document.createElement('div');
      nodeEl.className = `graph-node ${isActive ? 'active' : ''}`;
      nodeEl.dataset.nodeId = nodeId;
      nodeEl.style.left = `${pos.x}px`;
      nodeEl.style.top = `${pos.y}px`;

      // Apply custom color if set
      if (node.color) {
        nodeEl.style.borderColor = node.color;
      }

      // Apply custom shape if set
      if (node.shape) {
        switch (node.shape) {
          case 'circle':
            nodeEl.style.borderRadius = '50%';
            nodeEl.style.minWidth = '80px';
            nodeEl.style.minHeight = '80px';
            nodeEl.style.display = 'flex';
            nodeEl.style.flexDirection = 'column';
            nodeEl.style.alignItems = 'center';
            nodeEl.style.justifyContent = 'center';
            break;
          case 'rounded':
            nodeEl.style.borderRadius = '12px';
            break;
          case 'rectangle':
            nodeEl.style.borderRadius = '0px';
            break;
          case 'diamond':
            nodeEl.style.transform = 'rotate(45deg)';
            nodeEl.style.padding = '20px';
            break;
        }
      }

      const platformEmoji = {
        chatgpt: '🤖',
        gemini: '✨',
        perplexity: '🔍',
      }[node.platform];

      nodeEl.innerHTML = `
        <div class="graph-node-title">${node.title}</div>
        <div class="graph-node-platform">${platformEmoji} ${node.platform}</div>
      `;

      // Make node draggable
      this.makeNodeDraggable(nodeEl, nodeId);

      // Left click - navigate
      nodeEl.addEventListener('click', (e) => {
        if (!(e.target as HTMLElement).closest('.graph-node-title')) {
          window.location.href = node.url;
        }
      });

      // Right click - show context menu
      nodeEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.showNodeContextMenu(nodeId, e.clientX, e.clientY);
      });

      canvas.appendChild(nodeEl);
    });
  }

  private makeNodeDraggable(nodeEl: HTMLElement, nodeId: string) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;
    let dropTarget: HTMLElement | null = null;

    nodeEl.addEventListener('mousedown', (e) => {
      // Only drag if clicking on the node itself, not buttons/links
      if ((e.target as HTMLElement).tagName === 'BUTTON' ||
          (e.target as HTMLElement).tagName === 'A') {
        return;
      }

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      const rect = nodeEl.getBoundingClientRect();
      const canvas = document.getElementById('graph-canvas');
      if (canvas) {
        const canvasRect = canvas.getBoundingClientRect();
        initialX = rect.left - canvasRect.left + canvas.scrollLeft;
        initialY = rect.top - canvasRect.top + canvas.scrollTop;
      }

      nodeEl.style.cursor = 'grabbing';
      nodeEl.style.zIndex = '1000';
      e.stopPropagation();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const newX = initialX + dx;
      const newY = initialY + dy;

      nodeEl.style.left = `${newX}px`;
      nodeEl.style.top = `${newY}px`;

      // Check for drop target (reparenting)
      const allNodes = document.querySelectorAll('.graph-node');
      let foundTarget = false;

      allNodes.forEach(otherNode => {
        if (otherNode === nodeEl) return;

        const rect = otherNode.getBoundingClientRect();
        const nodeRect = nodeEl.getBoundingClientRect();

        // Check if dragged node overlaps with other node
        const isOverlapping = !(
          nodeRect.right < rect.left ||
          nodeRect.left > rect.right ||
          nodeRect.bottom < rect.top ||
          nodeRect.top > rect.bottom
        );

        if (isOverlapping) {
          dropTarget = otherNode as HTMLElement;
          (otherNode as HTMLElement).style.boxShadow = '0 0 20px #10b981';
          foundTarget = true;
        } else if (dropTarget === otherNode) {
          (otherNode as HTMLElement).style.boxShadow = '';
        }
      });

      if (!foundTarget && dropTarget) {
        dropTarget.style.boxShadow = '';
        dropTarget = null;
      }
    });

    document.addEventListener('mouseup', async () => {
      if (!isDragging) return;

      isDragging = false;
      nodeEl.style.cursor = 'pointer';
      nodeEl.style.zIndex = 'auto';

      // Check if we're reparenting
      if (dropTarget) {
        const newParentId = dropTarget.dataset.nodeId;
        dropTarget.style.boxShadow = '';

        if (newParentId && newParentId !== nodeId) {
          await this.reparentNode(nodeId, newParentId);
        }

        dropTarget = null;
      } else {
        // Just save new position
        const newX = parseInt(nodeEl.style.left);
        const newY = parseInt(nodeEl.style.top);

        await this.updateNodePosition(nodeId, { x: newX, y: newY });
      }

      // Redraw connections
      this.renderGraph();
    });
  }

  private async reparentNode(nodeId: string, newParentId: string) {
    if (!this.state.currentTreeId) return;

    const tree = this.state.trees[this.state.currentTreeId];
    const node = tree.nodes[nodeId];
    const newParent = tree.nodes[newParentId];

    if (!node || !newParent) return;

    // Prevent circular dependencies
    if (this.wouldCreateCycle(nodeId, newParentId, tree)) {
      this.showNotification('Cannot create circular dependency!', 'error');
      return;
    }

    // Prevent making node its own parent or root
    if (nodeId === newParentId || nodeId === tree.rootNodeId) {
      this.showNotification('Invalid reparenting operation!', 'error');
      return;
    }

    // Remove from old parent
    if (node.parentId) {
      const oldParent = tree.nodes[node.parentId];
      if (oldParent) {
        oldParent.children = oldParent.children.filter(id => id !== nodeId);
        await db.saveNode(oldParent, this.state.currentTreeId);
      }
    }

    // Add to new parent
    node.parentId = newParentId;
    if (!newParent.children.includes(nodeId)) {
      newParent.children.push(nodeId);
    }

    await db.saveTree(tree);
    await db.saveNode(node, this.state.currentTreeId);
    await db.saveNode(newParent, this.state.currentTreeId);

    this.showNotification('Node reparented successfully! 🔄', 'success');
    this.refresh();
  }

  private wouldCreateCycle(nodeId: string, newParentId: string, tree: ChatTree): boolean {
    // Check if newParentId is a descendant of nodeId
    const isDescendant = (potentialDescendant: string, ancestor: string): boolean => {
      if (potentialDescendant === ancestor) return true;

      const node = tree.nodes[potentialDescendant];
      if (!node || !node.parentId) return false;

      return isDescendant(node.parentId, ancestor);
    };

    return isDescendant(newParentId, nodeId);
  }

  private async updateNodePosition(nodeId: string, position: { x: number; y: number }) {
    if (!this.state.currentTreeId) return;

    const tree = this.state.trees[this.state.currentTreeId];
    const node = tree.nodes[nodeId];

    if (node) {
      node.customPosition = position;
      await db.saveTree(tree);
      await db.saveNode(node, this.state.currentTreeId);
      console.log('✅ Node position saved:', nodeId, position);
    }
  }

  private showNodeContextMenu(nodeId: string, x: number, y: number) {
    // Remove existing menu if any
    document.getElementById('arbor-context-menu')?.remove();

    const menu = document.createElement('div');
    menu.id = 'arbor-context-menu';
    menu.innerHTML = `
      <div style="
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        z-index: 99999999;
        min-width: 200px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div class="context-menu-item" data-action="color" style="
          padding: 10px 16px;
          cursor: pointer;
          color: #fff;
          border-bottom: 1px solid #333;
          font-size: 14px;
        ">
          🎨 Change Color
        </div>
        <div class="context-menu-item" data-action="shape" style="
          padding: 10px 16px;
          cursor: pointer;
          color: #fff;
          border-bottom: 1px solid #333;
          font-size: 14px;
        ">
          🔷 Change Shape
        </div>
        <div class="context-menu-item" data-action="label" style="
          padding: 10px 16px;
          cursor: pointer;
          color: #fff;
          border-bottom: 1px solid #333;
          font-size: 14px;
        ">
          🏷️ Edit Connection Label
        </div>
        <div class="context-menu-item" data-action="reset" style="
          padding: 10px 16px;
          cursor: pointer;
          color: #fff;
          border-bottom: 1px solid #333;
          font-size: 14px;
        ">
          📍 Reset Position
        </div>
        <div class="context-menu-item" data-action="delete" style="
          padding: 10px 16px;
          cursor: pointer;
          color: #ef4444;
          font-size: 14px;
        ">
          ❌ Delete Node
        </div>
      </div>
    `;

    document.body.appendChild(menu);

    // Add hover effects
    menu.querySelectorAll('.context-menu-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        (item as HTMLElement).style.background = '#252525';
      });
      item.addEventListener('mouseleave', () => {
        (item as HTMLElement).style.background = 'transparent';
      });

      item.addEventListener('click', async () => {
        const action = (item as HTMLElement).dataset.action;
        menu.remove();

        switch (action) {
          case 'color':
            await this.changeNodeColor(nodeId);
            break;
          case 'shape':
            await this.changeNodeShape(nodeId);
            break;
          case 'label':
            await this.editConnectionLabel(nodeId);
            break;
          case 'reset':
            await this.resetNodePosition(nodeId);
            break;
          case 'delete':
            await this.deleteNode(nodeId);
            break;
        }
      });
    });

    // Close menu when clicking outside
    const closeMenu = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node)) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    };

    setTimeout(() => {
      document.addEventListener('click', closeMenu);
    }, 0);
  }

  private async changeNodeColor(nodeId: string) {
    this.showCustomizationPanel(nodeId);
  }

  private async changeNodeShape(nodeId: string) {
    this.showCustomizationPanel(nodeId);
  }

  private showCustomizationPanel(nodeId: string) {
    if (!this.state.currentTreeId) return;

    const tree = this.state.trees[this.state.currentTreeId];
    const node = tree.nodes[nodeId];
    if (!node) return;

    // Remove existing panel if any
    document.getElementById('arbor-customization-panel')?.remove();

    const currentColor = node.color || '#4a9eff';
    const currentShape = node.shape || 'rounded';

    const panel = document.createElement('div');
    panel.id = 'arbor-customization-panel';
    panel.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.6);
        z-index: 99999999;
        width: 350px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="padding: 20px; border-bottom: 1px solid #333;">
          <h3 style="color: #fff; margin: 0; font-size: 18px;">🎨 Customize Node</h3>
          <p style="color: #999; margin: 8px 0 0 0; font-size: 13px;">${node.title}</p>
        </div>

        <div style="padding: 20px;">
          <div style="margin-bottom: 20px;">
            <label style="color: #fff; font-size: 14px; display: block; margin-bottom: 8px;">
              Color
            </label>
            <div style="display: flex; gap: 8px; align-items: center;">
              <input type="color" id="node-color-picker" value="${currentColor}" style="
                width: 60px;
                height: 40px;
                border: 2px solid #333;
                border-radius: 6px;
                cursor: pointer;
                background: transparent;
              ">
              <input type="text" id="node-color-text" value="${currentColor}" style="
                flex: 1;
                padding: 8px 12px;
                background: #252525;
                border: 1px solid #333;
                border-radius: 6px;
                color: #fff;
                font-size: 14px;
              ">
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="color: #fff; font-size: 14px; display: block; margin-bottom: 8px;">
              Shape
            </label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <button class="shape-btn" data-shape="rounded" style="
                padding: 12px;
                background: ${currentShape === 'rounded' ? '#4a9eff' : '#252525'};
                border: 1px solid #333;
                border-radius: 8px;
                color: #fff;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s;
              ">
                ▭ Rounded
              </button>
              <button class="shape-btn" data-shape="rectangle" style="
                padding: 12px;
                background: ${currentShape === 'rectangle' ? '#4a9eff' : '#252525'};
                border: 1px solid #333;
                border-radius: 0px;
                color: #fff;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s;
              ">
                ▢ Rectangle
              </button>
              <button class="shape-btn" data-shape="circle" style="
                padding: 12px;
                background: ${currentShape === 'circle' ? '#4a9eff' : '#252525'};
                border: 1px solid #333;
                border-radius: 50%;
                color: #fff;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s;
              ">
                ● Circle
              </button>
              <button class="shape-btn" data-shape="diamond" style="
                padding: 12px;
                background: ${currentShape === 'diamond' ? '#4a9eff' : '#252525'};
                border: 1px solid #333;
                border-radius: 4px;
                color: #fff;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s;
                transform: rotate(45deg);
              ">
                <span style="display: inline-block; transform: rotate(-45deg);">◆ Diamond</span>
              </button>
            </div>
          </div>
        </div>

        <div style="padding: 16px 20px; border-top: 1px solid #333; display: flex; gap: 8px;">
          <button id="apply-customization" style="
            flex: 1;
            padding: 10px;
            background: #10b981;
            color: #fff;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          ">
            Apply
          </button>
          <button id="cancel-customization" style="
            flex: 1;
            padding: 10px;
            background: #333;
            color: #fff;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
          ">
            Cancel
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Sync color picker and text input
    const colorPicker = document.getElementById('node-color-picker') as HTMLInputElement;
    const colorText = document.getElementById('node-color-text') as HTMLInputElement;

    colorPicker?.addEventListener('input', () => {
      if (colorText) colorText.value = colorPicker.value;
    });

    colorText?.addEventListener('input', () => {
      if (colorPicker && /^#[0-9A-Fa-f]{6}$/.test(colorText.value)) {
        colorPicker.value = colorText.value;
      }
    });

    // Shape button selection
    let selectedShape = currentShape;
    panel.querySelectorAll('.shape-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedShape = (btn as HTMLElement).dataset.shape as ChatNode['shape'] || 'rounded';

        // Update button styles
        panel.querySelectorAll('.shape-btn').forEach(b => {
          (b as HTMLElement).style.background = '#252525';
        });
        (btn as HTMLElement).style.background = '#4a9eff';
      });
    });

    // Apply button
    document.getElementById('apply-customization')?.addEventListener('click', async () => {
      const newColor = colorText?.value || currentColor;

      node.color = newColor;
      node.shape = selectedShape;

      await db.saveTree(tree);
      await db.saveNode(node, this.state.currentTreeId!);
      this.renderGraph();
      this.showNotification('Node customized! 🎨', 'success');

      panel.remove();
    });

    // Cancel button
    document.getElementById('cancel-customization')?.addEventListener('click', () => {
      panel.remove();
    });

    // Close on outside click
    setTimeout(() => {
      const closeOnOutside = (e: MouseEvent) => {
        if (!(e.target as HTMLElement).closest('#arbor-customization-panel > div')) {
          panel.remove();
          document.removeEventListener('click', closeOnOutside);
        }
      };
      document.addEventListener('click', closeOnOutside);
    }, 0);
  }

  private async editConnectionLabel(nodeId: string) {
    if (!this.state.currentTreeId) return;

    const tree = this.state.trees[this.state.currentTreeId];
    const node = tree.nodes[nodeId];

    if (!node || !node.parentId) {
      this.showNotification('Root nodes have no connection label', 'error');
      return;
    }

    const currentLabel = node.connectionLabel || 'none';
    const label = prompt(
      `Connection labels:\ndeepens, explores, contrasts, examples, applies, questions, extends, summarizes, custom\n\nCurrent: ${currentLabel}\n\nEnter new label:`,
      currentLabel
    );

    if (!label) return;

    node.connectionLabel = label as ConnectionType;
    await db.saveTree(tree);
    await db.saveNode(node, this.state.currentTreeId);
    this.renderGraph();
    this.refresh();
    this.showNotification('Connection label updated! 🏷️', 'success');
  }

  private async resetNodePosition(nodeId: string) {
    if (!this.state.currentTreeId) return;

    const tree = this.state.trees[this.state.currentTreeId];
    const node = tree.nodes[nodeId];

    if (node) {
      delete node.customPosition;
      await db.saveTree(tree);
      await db.saveNode(node, this.state.currentTreeId);
      this.renderGraph();
      this.showNotification('Position reset to auto-layout! 📍', 'success');
    }
  }

  private async deleteNode(nodeId: string) {
    if (!this.state.currentTreeId) return;

    const tree = this.state.trees[this.state.currentTreeId];
    const node = tree.nodes[nodeId];

    if (!node) return;

    if (nodeId === tree.rootNodeId) {
      this.showNotification('Cannot delete root node!', 'error');
      return;
    }

    const confirm = window.confirm(`Delete "${node.title}" and all its children?`);
    if (!confirm) return;

    // Remove from parent's children array
    if (node.parentId) {
      const parent = tree.nodes[node.parentId];
      if (parent) {
        parent.children = parent.children.filter(id => id !== nodeId);
        await db.saveNode(parent, this.state.currentTreeId);
      }
    }

    // Recursively delete node and children
    const deleteRecursive = async (id: string) => {
      const n = tree.nodes[id];
      if (!n) return;

      for (const childId of n.children) {
        await deleteRecursive(childId);
      }

      delete tree.nodes[id];
      await db.deleteNode(id);
    };

    await deleteRecursive(nodeId);
    await db.saveTree(tree);

    // Update current node if deleted
    if (this.state.currentNodeId === nodeId) {
      this.state.currentNodeId = tree.rootNodeId;
      await this.saveState();
    }

    this.renderGraph();
    this.refresh();
    this.showNotification('Node deleted! ❌', 'success');
  }

  private attachSidebarListeners() {
    document.getElementById('toggle-sidebar')?.addEventListener('click', () => {
      const sidebar = document.getElementById('arbor-sidebar-container');
      const leftToggle = document.getElementById('arbor-left-toggle')?.querySelector('button') as HTMLElement;

      if (sidebar) {
        if (sidebar.style.display === 'none') {
          sidebar.style.display = 'flex';
          this.state.sidebarVisible = true;
          if (leftToggle) leftToggle.style.display = 'none';
        } else {
          sidebar.style.display = 'none';
          this.state.sidebarVisible = false;
          if (leftToggle) leftToggle.style.display = 'flex';
        }
        this.adjustMainContent();
      }
    });

    // Tree title editing
    document.getElementById('tree-title-editable')?.addEventListener('click', () => {
      this.editTreeTitle();
    });

    // Browse chats button (works for both empty and populated states)
    document.getElementById('browse-chats')?.addEventListener('click', () =>
      this.showChatBrowser()
    );

    document.getElementById('browse-chats-empty')?.addEventListener('click', () =>
      this.showChatBrowser()
    );

    document.getElementById('create-branch')?.addEventListener('click', () =>
      this.createBranch()
    );

    document.getElementById('new-tree')?.addEventListener('click', () => this.createNewTree());

    document.querySelectorAll('.tree-node').forEach((node) => {
      node.addEventListener('click', (e) => {
        const nodeId = (e.currentTarget as HTMLElement).dataset.nodeId;
        if (nodeId && this.state.currentTreeId) {
          const tree = this.state.trees[this.state.currentTreeId];
          const chatNode = tree.nodes[nodeId];
          if (chatNode) {
            window.location.href = chatNode.url;
          }
        }
      });
    });
  }

  private async editTreeTitle() {
    if (!this.state.currentTreeId) return;

    const tree = this.state.trees[this.state.currentTreeId];
    const newTitle = prompt('Enter new tree title:', tree.title);

    if (newTitle && newTitle.trim().length > 0) {
      tree.title = newTitle.trim();
      await db.saveTree(tree);
      this.showNotification('Tree title updated! 📝', 'success');
      this.refresh();
    }
  }

  private attachGraphListeners() {
    document.getElementById('toggle-graph')?.addEventListener('click', () => {
      const graph = document.getElementById('arbor-graph-container');
      const rightToggle = document.getElementById('arbor-right-toggle')?.querySelector('button') as HTMLElement;

      if (graph) {
        if (graph.style.display === 'none') {
          graph.style.display = 'flex';
          this.state.graphSidebarVisible = true;
          if (rightToggle) rightToggle.style.display = 'none';
        } else {
          graph.style.display = 'none';
          this.state.graphSidebarVisible = false;
          if (rightToggle) rightToggle.style.display = 'flex';
        }
        this.adjustMainContent();
      }
    });

    // Zoom controls
    document.getElementById('zoom-in')?.addEventListener('click', () => {
      this.canvasZoom = Math.min(this.canvasZoom + 0.2, 3);
      this.updateCanvasTransform();
    });

    document.getElementById('zoom-out')?.addEventListener('click', () => {
      this.canvasZoom = Math.max(this.canvasZoom - 0.2, 0.3);
      this.updateCanvasTransform();
    });

    document.getElementById('reset-zoom')?.addEventListener('click', () => {
      this.canvasZoom = 1;
      this.canvasPanX = 0;
      this.canvasPanY = 0;
      this.updateCanvasTransform();
    });

    // Canvas panning
    const canvas = document.getElementById('graph-canvas');
    if (canvas) {
      // Wheel zoom
      canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        this.canvasZoom = Math.max(0.3, Math.min(3, this.canvasZoom + delta));
        this.updateCanvasTransform();
      });

      // Pan with mouse drag
      canvas.addEventListener('mousedown', (e) => {
        // Only pan if clicking on the canvas background, not on a node
        if ((e.target as HTMLElement).id === 'graph-canvas' ||
            (e.target as HTMLElement).id === 'graph-content') {
          this.isPanning = true;
          this.panStartX = e.clientX - this.canvasPanX;
          this.panStartY = e.clientY - this.canvasPanY;
          canvas.style.cursor = 'grabbing';
        }
      });

      canvas.addEventListener('mousemove', (e) => {
        if (!this.isPanning) return;
        this.canvasPanX = e.clientX - this.panStartX;
        this.canvasPanY = e.clientY - this.panStartY;
        this.updateCanvasTransform();
      });

      canvas.addEventListener('mouseup', () => {
        if (this.isPanning) {
          this.isPanning = false;
          canvas.style.cursor = 'default';
        }
      });

      canvas.addEventListener('mouseleave', () => {
        if (this.isPanning) {
          this.isPanning = false;
          canvas.style.cursor = 'default';
        }
      });
    }
  }

  private updateCanvasTransform() {
    const container = document.getElementById('graph-content');
    const zoomLevel = document.getElementById('zoom-level');

    if (container) {
      container.style.transform = `translate(${this.canvasPanX}px, ${this.canvasPanY}px) scale(${this.canvasZoom})`;
    }

    if (zoomLevel) {
      zoomLevel.textContent = `${Math.round(this.canvasZoom * 100)}%`;
    }
  }

  private adjustMainContent() {
    const sidebar = document.getElementById('arbor-sidebar-container');
    const graph = document.getElementById('arbor-graph-container');

    let leftMargin = 0;
    let rightMargin = 0;

    if (sidebar && sidebar.style.display !== 'none') {
      leftMargin = 320;
    }
    if (graph && graph.style.display !== 'none') {
      rightMargin = 400;
    }

    const mainSelectors = ['main', '[role="main"]', '.main-content', '#main'];

    mainSelectors.forEach((selector) => {
      const main = document.querySelector(selector) as HTMLElement;
      if (main) {
        main.style.marginLeft = `${leftMargin}px`;
        main.style.marginRight = `${rightMargin}px`;
        main.style.transition = 'margin 0.3s ease';
      }
    });
  }

  private async createBranch() {
    if (!this.state.currentNodeId || !this.state.currentTreeId) {
      alert('Please select a node first');
      return;
    }

    const tree = this.state.trees[this.state.currentTreeId];
    const parentNode = tree.nodes[this.state.currentNodeId];

    // Get recent messages for context
    const recentMessages = this.currentPlatform.getRecentMessages(10);

    // Generate context
    const context = this.currentPlatform.generateBranchContext({
      parentTitle: parentNode.title,
      summary: `Recent context: ${recentMessages.map(m => `${m.role}: ${m.content.substring(0, 100)}`).join('\n')}`,
      selectedText: this.currentPlatform.getSelectedText() || undefined,
      connectionType: 'extends',
    });

    // Copy to clipboard
    const copied = await this.currentPlatform.copyToClipboard(context);

    if (copied) {
      this.showNotification(
        'Context copied! Open a new chat and paste (Ctrl+V)',
        'success'
      );

      // Open new chat
      setTimeout(() => {
        this.currentPlatform.openNewChat();
      }, 1000);
    } else {
      alert(`Context (copy manually):\n\n${context}`);
    }
  }

  private showChatBrowser() {
    // Get all chats from ChatGPT sidebar
    const allChats = this.currentPlatform.getAllChatsFromSidebar();

    if (allChats.length === 0) {
      this.showNotification('No chats found in sidebar. Try scrolling to load more chats.', 'error');
      return;
    }

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'arbor-chat-browser-modal';
    modal.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        z-index: 99999999;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          background: #1a1a1a;
          border-radius: 12px;
          padding: 24px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="color: #fff; margin: 0; font-size: 20px;">📚 Browse ChatGPT Chats</h2>
            <button id="close-chat-browser" style="
              background: none;
              border: none;
              color: #999;
              font-size: 24px;
              cursor: pointer;
              padding: 0;
              width: 32px;
              height: 32px;
            ">×</button>
          </div>

          <p style="color: #999; margin-bottom: 16px; font-size: 14px;">
            Found ${allChats.length} chat(s). Click to add to your current tree.
          </p>

          <div style="
            flex: 1;
            overflow-y: auto;
            margin: 0 -24px;
            padding: 0 24px;
          ">
            ${allChats.map((chat, index) => `
              <div class="chat-browser-item" data-chat-index="${index}" style="
                background: #252525;
                padding: 12px 16px;
                margin-bottom: 8px;
                border-radius: 6px;
                cursor: pointer;
                border-left: 3px solid #4a9eff;
                transition: all 0.2s;
              ">
                <div style="color: #fff; font-size: 14px; font-weight: 500; margin-bottom: 4px;">
                  ${chat.title}
                </div>
                <div style="color: #666; font-size: 11px;">
                  Click to add to tree
                </div>
              </div>
            `).join('')}
          </div>

          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #333;">
            <button id="cancel-chat-browser" style="
              width: 100%;
              padding: 10px;
              background: #333;
              color: #fff;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
            ">Cancel</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add hover effect via event listeners
    modal.querySelectorAll('.chat-browser-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        (item as HTMLElement).style.background = '#2a2a2a';
      });
      item.addEventListener('mouseleave', () => {
        (item as HTMLElement).style.background = '#252525';
      });

      item.addEventListener('click', async () => {
        const index = parseInt((item as HTMLElement).dataset.chatIndex || '0');
        const chat = allChats[index];
        await this.addChatToTree(chat.id, chat.url, chat.title);
        modal.remove();
      });
    });

    // Close handlers
    modal.querySelector('#close-chat-browser')?.addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelector('#cancel-chat-browser')?.addEventListener('click', () => {
      modal.remove();
    });
  }

  private async addChatToTree(chatId: string, url: string, title: string) {
    // Check if already tracked
    const existingNode = await db.findNodeByUrl(url);
    if (existingNode) {
      this.showNotification('This chat is already tracked!', 'error');
      return;
    }

    const nodeId = `node-${Date.now()}`;

    const newNode: ChatNode = {
      id: nodeId,
      title,
      url,
      platform: 'chatgpt',
      parentId: this.state.currentNodeId, // Link to current node as parent
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If no current tree, create one
    if (!this.state.currentTreeId) {
      const treeId = `tree-${Date.now()}`;
      const tree: ChatTree = {
        id: treeId,
        rootNodeId: nodeId,
        title: title,
        nodes: { [nodeId]: newNode },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.state.trees[treeId] = tree;
      this.state.currentTreeId = treeId;
      this.state.currentNodeId = nodeId;

      await db.saveTree(tree);
      await db.saveNode(newNode, treeId);

      console.log('✅ Created new tree:', tree.title);
    } else {
      // Add to existing tree
      const tree = this.state.trees[this.state.currentTreeId];
      tree.nodes[nodeId] = newNode;

      // Link as child of current node
      if (this.state.currentNodeId && tree.nodes[this.state.currentNodeId]) {
        const parent = tree.nodes[this.state.currentNodeId];
        if (!parent.children.includes(nodeId)) {
          parent.children.push(nodeId);
          await db.saveNode(parent, this.state.currentTreeId);
        }
      }

      this.state.currentNodeId = nodeId;

      await db.saveTree(tree);
      await db.saveNode(newNode, this.state.currentTreeId);

      console.log('✅ Added node to tree:', tree.title);
    }

    await this.saveState();
    this.refresh();

    this.showNotification(`"${title}" added to tree! 🌳`, 'success');
  }

  private async createNewTree() {
    const title = prompt('Enter a name for the new tree:');
    if (!title) return;

    this.state.currentTreeId = null;
    this.state.currentNodeId = null;
    await this.saveState();

    this.showNotification('New tree created! Add chats using "Browse Chats" button.', 'success');
    this.refresh();
  }

  private async saveState() {
    await db.saveState({
      currentTreeId: this.state.currentTreeId,
      currentNodeId: this.state.currentNodeId,
    });
  }

  private refresh() {
    const sidebar = document.getElementById('arbor-sidebar-container');
    if (sidebar) {
      sidebar.innerHTML = this.getSidebarHTML();
      this.attachSidebarListeners();
    }

    this.renderGraph();
  }
}

// Initialize extension
new ArborExtensionProduction();
