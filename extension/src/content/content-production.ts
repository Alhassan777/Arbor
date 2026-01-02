// Production-ready content script with real chat tracking
import { ChatNode, ChatTree, ExtensionState } from '../types';
import { db } from '../storage/indexeddb';
import { chatgptPlatform } from '../platforms/chatgpt';

class ArborExtensionProduction {
  private state: ExtensionState;
  private sidebarInjected = false;
  private currentPlatform = chatgptPlatform;
  private currentChatId: string | null = null;

  constructor() {
    this.state = {
      trees: {},
      currentTreeId: null,
      currentNodeId: null,
      sidebarVisible: true,
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
    this.adjustMainContent();

    this.sidebarInjected = true;
    console.log('✅ UI injected');
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
        <h2>🌳 ${currentTree.title}</h2>
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

    const positions = this.calculateNodePositions(tree);
    this.renderConnections(tree, positions, canvas);
    this.renderGraphNodes(tree, positions, canvas);
  }

  private calculateNodePositions(tree: ChatTree): Record<string, { x: number; y: number }> {
    const positions: Record<string, { x: number; y: number }> = {};
    const levelCounts: Record<number, number> = {};

    const traverse = (nodeId: string, level: number) => {
      if (!levelCounts[level]) levelCounts[level] = 0;

      const x = 40 + level * 180;
      const y = 40 + levelCounts[level] * 100;

      positions[nodeId] = { x, y };
      levelCounts[level]++;

      const node = tree.nodes[nodeId];
      if (node) {
        node.children.forEach((childId) => traverse(childId, level + 1));
      }
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
        // Navigate to chat
        window.location.href = node.url;
      });

      canvas.appendChild(nodeEl);
    });
  }

  private attachSidebarListeners() {
    document.getElementById('toggle-sidebar')?.addEventListener('click', () => {
      const sidebar = document.getElementById('arbor-sidebar-container');
      if (sidebar) {
        sidebar.style.display = sidebar.style.display === 'none' ? 'flex' : 'none';
        this.adjustMainContent();
      }
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

  private attachGraphListeners() {
    document.getElementById('toggle-graph')?.addEventListener('click', () => {
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
