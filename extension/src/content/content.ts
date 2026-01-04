// Content script - Injects sidebar into chatbot pages
import { ChatNode, ChatTree, ExtensionState } from '../types';

class ArborExtension {
  private state: ExtensionState;
  private sidebarInjected = false;
  private graphInjected = false;

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
    // Load state from chrome.storage
    const stored = await chrome.storage.local.get('arborState');
    if (stored.arborState) {
      this.state = stored.arborState;
    } else {
      // Create demo tree for testing
      this.createDemoTree();
    }

    // Wait for page to be ready before injecting UI
    this.waitForPageReady();
  }

  private waitForPageReady() {
    // Try to inject immediately if document is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      // Wait a bit for any dynamic content to load
      setTimeout(() => this.injectUI(), 500);
    } else {
      // Wait for DOM to be ready
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.injectUI(), 500);
      });
    }

    // Also inject on full page load as a fallback
    window.addEventListener('load', () => {
      if (!this.sidebarInjected) {
        setTimeout(() => this.injectUI(), 500);
      }
    });

    // Watch for SPA navigation and re-inject if UI is missing
    this.watchForNavigation();
  }

  private watchForNavigation() {
    // Watch for URL changes (SPA navigation)
    let lastUrl = location.href;
    new MutationObserver(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        // Check if UI is still visible, if not, re-inject
        setTimeout(() => {
          const sidebar = document.getElementById('arbor-sidebar-container');
          if (!sidebar || !document.body.contains(sidebar)) {
            console.log('Arbor: UI missing after navigation, re-injecting...');
            this.sidebarInjected = false;
            this.graphInjected = false;
            this.injectUI();
          }
        }, 1000);
      }
    }).observe(document, { subtree: true, childList: true });
  }

  private createDemoTree() {
    const treeId = 'demo-tree-1';
    const rootId = 'node-1';

    const rootNode: ChatNode = {
      id: rootId,
      title: 'Main Conversation',
      url: window.location.href,
      platform: this.detectPlatform(),
      parentId: null,
      children: ['node-2', 'node-3'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      summary: 'Initial conversation about AI and machine learning',
      tags: ['AI', 'Research'],
    };

    const childNode1: ChatNode = {
      id: 'node-2',
      title: 'Deep Dive: Neural Networks',
      url: window.location.href + '#branch-1',
      platform: this.detectPlatform(),
      parentId: rootId,
      children: ['node-4'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      connectionLabel: 'deepens',
      tags: ['Neural Networks'],
    };

    const childNode2: ChatNode = {
      id: 'node-3',
      title: 'Practical Applications',
      url: window.location.href + '#branch-2',
      platform: this.detectPlatform(),
      parentId: rootId,
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      connectionLabel: 'applies',
      tags: ['Applications'],
    };

    const grandchildNode: ChatNode = {
      id: 'node-4',
      title: 'CNN Architecture Details',
      url: window.location.href + '#branch-1-1',
      platform: this.detectPlatform(),
      parentId: 'node-2',
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      connectionLabel: 'explores',
      tags: ['CNN', 'Deep Learning'],
    };

    const tree: ChatTree = {
      id: treeId,
      name: 'AI Research Project',
      rootNodeId: rootId,
      nodes: {
        [rootId]: rootNode,
        'node-2': childNode1,
        'node-3': childNode2,
        'node-4': grandchildNode,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.trees[treeId] = tree;
    this.state.currentTreeId = treeId;
    this.state.currentNodeId = rootId;
    this.saveState();
  }

  private detectPlatform(): 'chatgpt' | 'gemini' | 'perplexity' {
    const hostname = window.location.hostname;
    if (hostname.includes('chatgpt') || hostname.includes('openai')) {
      return 'chatgpt';
    } else if (hostname.includes('gemini')) {
      return 'gemini';
    } else if (hostname.includes('perplexity')) {
      return 'perplexity';
    }
    return 'chatgpt'; // default
  }

  private injectUI() {
    if (this.sidebarInjected) {
      // UI already injected, just make sure it's visible
      const sidebar = document.getElementById('arbor-sidebar-container');
      const graph = document.getElementById('arbor-graph-container');
      if (sidebar && graph && document.body.contains(sidebar)) {
        return;
      }
      // If UI elements exist but are not in DOM, reset and re-inject
      this.sidebarInjected = false;
      this.graphInjected = false;
    }

    try {
      // Inject CSS first
      this.injectStyles();

      // Inject left sidebar
      this.injectSidebar();

      // Inject right graph view
      this.injectGraphView();

      // Adjust main content margin
      this.adjustMainContent();

      this.sidebarInjected = true;
      console.log('Arbor: UI injected successfully');
    } catch (error) {
      console.error('Arbor: Error injecting UI:', error);
    }
  }

  private injectStyles() {
    // Check if styles already exist
    if (document.getElementById('arbor-extension-styles')) {
      return;
    }

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
    // Check if sidebar already exists
    let sidebar = document.getElementById('arbor-sidebar-container');
    if (sidebar && document.body.contains(sidebar)) {
      return;
    }

    // Remove existing sidebar if it's detached from DOM
    if (sidebar) {
      sidebar.remove();
    }

    // Create sidebar container
    sidebar = document.createElement('div');
    sidebar.id = 'arbor-sidebar-container';
    sidebar.innerHTML = this.getSidebarHTML();
    document.body.insertBefore(sidebar, document.body.firstChild);

    // Attach event listeners
    this.attachSidebarListeners();
  }

  private injectGraphView() {
    // Check if graph already exists
    let graph = document.getElementById('arbor-graph-container');
    if (graph && document.body.contains(graph)) {
      return;
    }

    // Remove existing graph if it's detached from DOM
    if (graph) {
      graph.remove();
    }

    graph = document.createElement('div');
    graph.id = 'arbor-graph-container';
    graph.innerHTML = this.getGraphHTML();
    document.body.appendChild(graph);

    // Render graph
    this.renderGraph();

    // Attach listeners
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
              No trees yet.<br>
              Click "Add Current Chat" to start organizing!
            </div>
          </div>
        </div>
        <div class="action-buttons">
          <button class="btn" id="add-current-chat">+ Add Current Chat</button>
        </div>
      `;
    }

    const treeHTML = this.renderTreeNode(currentTree.rootNodeId, currentTree);

    return `
      <div class="arbor-header">
        <h2>🌳 ${currentTree.name}</h2>
        <button class="arbor-toggle-btn" id="toggle-sidebar">Hide</button>
      </div>
      <div class="arbor-content" id="tree-view">
        ${treeHTML}
      </div>
      <div class="action-buttons">
        <button class="btn" id="add-current-chat">+ Add Chat</button>
        <button class="btn btn-secondary" id="create-branch">Branch</button>
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
        <button class="arbor-toggle-btn" id="toggle-graph">Hide</button>
      </div>
      <div class="arbor-content">
        <div class="graph-canvas" id="graph-canvas"></div>
      </div>
    `;
  }

  private renderGraph() {
    const canvas = document.getElementById('graph-canvas');
    if (!canvas || !this.state.currentTreeId) return;

    const tree = this.state.trees[this.state.currentTreeId];
    if (!tree) return;

    canvas.innerHTML = '';

    // Simple hierarchical layout
    const positions = this.calculateNodePositions(tree);

    // Render connections first (so they appear behind nodes)
    this.renderConnections(tree, positions, canvas);

    // Render nodes
    this.renderGraphNodes(tree, positions, canvas);
  }

  private calculateNodePositions(tree: ChatTree): Record<string, {x: number, y: number}> {
    const positions: Record<string, {x: number, y: number}> = {};
    const levelCounts: Record<number, number> = {};

    const traverse = (nodeId: string, level: number) => {
      if (!levelCounts[level]) levelCounts[level] = 0;

      const x = 40 + (level * 180);
      const y = 40 + (levelCounts[level] * 100);

      positions[nodeId] = { x, y };
      levelCounts[level]++;

      const node = tree.nodes[nodeId];
      if (node) {
        node.children.forEach(childId => traverse(childId, level + 1));
      }
    };

    traverse(tree.rootNodeId, 0);
    return positions;
  }

  private renderConnections(
    tree: ChatTree,
    positions: Record<string, {x: number, y: number}>,
    canvas: HTMLElement
  ) {
    Object.values(tree.nodes).forEach(node => {
      if (node.parentId && positions[node.parentId] && positions[node.id]) {
        const parent = positions[node.parentId];
        const child = positions[node.id];

        const line = document.createElement('div');
        line.className = 'connection-line';

        const length = Math.sqrt(Math.pow(child.x - parent.x, 2) + Math.pow(child.y - parent.y, 2));
        const angle = Math.atan2(child.y - parent.y, child.x - parent.x) * 180 / Math.PI;

        line.style.width = `${length}px`;
        line.style.left = `${parent.x + 60}px`;
        line.style.top = `${parent.y + 20}px`;
        line.style.transform = `rotate(${angle}deg)`;

        canvas.appendChild(line);
      }
    });
  }

  private renderGraphNodes(
    tree: ChatTree,
    positions: Record<string, {x: number, y: number}>,
    canvas: HTMLElement
  ) {
    Object.entries(positions).forEach(([nodeId, pos]) => {
      const node = tree.nodes[nodeId];
      if (!node) return;

      const nodeEl = document.createElement('div');
      nodeEl.className = 'graph-node';
      nodeEl.style.left = `${pos.x}px`;
      nodeEl.style.top = `${pos.y}px`;

      const platformEmoji = {
        chatgpt: '🤖',
        gemini: '✨',
        perplexity: '🔍',
      }[node.platform];

      nodeEl.innerHTML = `
        <div class="graph-node-title">${node.title}</div>
        <div class="graph-node-platform">${platformEmoji} ${node.platform}</div>
      `;

      nodeEl.addEventListener('click', () => {
        this.state.currentNodeId = nodeId;
        this.saveState();
        this.refresh();
        // Optionally navigate to URL
        // window.location.href = node.url;
      });

      canvas.appendChild(nodeEl);
    });
  }

  private attachSidebarListeners() {
    // Toggle sidebar
    const toggleBtn = document.getElementById('toggle-sidebar');
    toggleBtn?.addEventListener('click', () => {
      const sidebar = document.getElementById('arbor-sidebar-container');
      if (sidebar) {
        sidebar.style.display = sidebar.style.display === 'none' ? 'flex' : 'none';
        this.adjustMainContent();
      }
    });

    // Add current chat
    const addChatBtn = document.getElementById('add-current-chat');
    addChatBtn?.addEventListener('click', () => this.addCurrentChat());

    // Create branch
    const branchBtn = document.getElementById('create-branch');
    branchBtn?.addEventListener('click', () => this.createBranch());

    // Node clicks
    document.querySelectorAll('.tree-node').forEach(node => {
      node.addEventListener('click', (e) => {
        const nodeId = (e.currentTarget as HTMLElement).dataset.nodeId;
        if (nodeId) {
          this.state.currentNodeId = nodeId;
          this.saveState();
          this.refresh();
        }
      });
    });
  }

  private attachGraphListeners() {
    const toggleBtn = document.getElementById('toggle-graph');
    toggleBtn?.addEventListener('click', () => {
      const graph = document.getElementById('arbor-graph-container');
      if (graph) {
        graph.style.display = graph.style.display === 'none' ? 'flex' : 'none';
        this.adjustMainContent();
      }
    });
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

    // Adjust main content (platform-specific selectors)
    const mainSelectors = [
      'main',
      '[role="main"]',
      '.main-content',
      '#main',
    ];

    mainSelectors.forEach(selector => {
      const main = document.querySelector(selector) as HTMLElement;
      if (main) {
        main.style.marginLeft = `${leftMargin}px`;
        main.style.marginRight = `${rightMargin}px`;
        main.style.transition = 'margin 0.3s ease';
      }
    });
  }

  private addCurrentChat() {
    const title = prompt('Enter a title for this chat:');
    if (!title) return;

    const newNode: ChatNode = {
      id: `node-${Date.now()}`,
      title,
      url: window.location.href,
      platform: this.detectPlatform(),
      parentId: this.state.currentNodeId,
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!this.state.currentTreeId) {
      // Create new tree
      const treeId = `tree-${Date.now()}`;
      const tree: ChatTree = {
        id: treeId,
        name: title, // Use chat title as initial tree name
        rootNodeId: newNode.id,
        nodes: { [newNode.id]: newNode },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.state.trees[treeId] = tree;
      this.state.currentTreeId = treeId;
      this.state.currentNodeId = newNode.id;
    } else {
      const tree = this.state.trees[this.state.currentTreeId];
      tree.nodes[newNode.id] = newNode;

      if (this.state.currentNodeId) {
        const parent = tree.nodes[this.state.currentNodeId];
        if (parent && !parent.children.includes(newNode.id)) {
          parent.children.push(newNode.id);
        }
      }
    }

    this.saveState();
    this.refresh();
  }

  private createBranch() {
    if (!this.state.currentNodeId) {
      alert('Please select a node first');
      return;
    }

    const title = prompt('Enter a title for the branch:');
    if (!title) return;

    const newNode: ChatNode = {
      id: `node-${Date.now()}`,
      title,
      url: window.location.href,
      platform: this.detectPlatform(),
      parentId: this.state.currentNodeId,
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      connectionLabel: 'extends',
    };

    const tree = this.state.trees[this.state.currentTreeId!];
    tree.nodes[newNode.id] = newNode;

    const parent = tree.nodes[this.state.currentNodeId];
    if (parent) {
      parent.children.push(newNode.id);
    }

    this.saveState();
    this.refresh();

    // TODO: Generate context and open new chat
    alert(`Branch created! Next: Open new chat and paste context.\n\nContext will include:\n- Summary of parent conversation\n- Recent messages\n- Connection type: ${newNode.connectionLabel}`);
  }

  private async saveState() {
    await chrome.storage.local.set({ arborState: this.state });
  }

  private refresh() {
    // Re-render sidebar
    const sidebar = document.getElementById('arbor-sidebar-container');
    if (sidebar) {
      sidebar.innerHTML = this.getSidebarHTML();
      this.attachSidebarListeners();
    }

    // Re-render graph
    this.renderGraph();
  }
}

// Initialize extension
new ArborExtension();
