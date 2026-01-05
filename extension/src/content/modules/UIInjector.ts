import type { ChatTree } from "../../types";

export interface AvailableChat {
  id: string;
  title: string;
  url: string;
  platform: "chatgpt" | "gemini" | "perplexity";
}

export class UIInjector {
  private onSidebarAction: (action: string, data?: any) => void;

  constructor(onSidebarAction: (action: string, data?: any) => void) {
    this.onSidebarAction = onSidebarAction;
  }

  injectStyles() {
    if (document.getElementById("arbor-styles")) return;

    const style = document.createElement("style");
    style.id = "arbor-styles";
    style.textContent = `
      /* Adjust main content to account for panels */
      body {
        transition: margin-left 0.3s ease, margin-right 0.3s ease;
      }
      
      /* Ensure main content area respects margins */
      body > div[role="main"],
      body > main,
      #__next > div,
      [data-testid="conversation-turn"],
      .conversation-container {
        transition: margin-left 0.3s ease, margin-right 0.3s ease;
      }
      
      body.arbor-sidebar-visible {
        margin-left: 280px;
      }
      
      body.arbor-sidebar-visible > div[role="main"],
      body.arbor-sidebar-visible > main,
      body.arbor-sidebar-visible #__next > div {
        margin-left: 0;
      }
      
      body.arbor-graph-visible {
        margin-right: 400px;
      }
      
      body.arbor-graph-visible > div[role="main"],
      body.arbor-graph-visible > main,
      body.arbor-graph-visible #__next > div {
        margin-right: 0;
      }
      
      body.arbor-sidebar-visible.arbor-graph-visible {
        margin-left: 280px;
        margin-right: 400px;
      }
      
      body.arbor-sidebar-visible.arbor-graph-visible > div[role="main"],
      body.arbor-sidebar-visible.arbor-graph-visible > main,
      body.arbor-sidebar-visible.arbor-graph-visible #__next > div {
        margin-left: 0;
        margin-right: 0;
      }

      #arbor-sidebar-container,
      #arbor-graph-container {
        position: fixed;
        top: 0;
        height: 100vh;
        background: #1a1a1a;
        color: #e0e0e0;
        z-index: 2147483646;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: transform 0.3s ease;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
      }
      
      #arbor-graph-container #graph-canvas {
        overflow: auto !important;
        cursor: default;
        scroll-behavior: smooth;
      }
      
      #arbor-graph-container #graph-content {
        position: relative;
        transform-origin: 0 0;
      }

      #arbor-sidebar-container {
        left: 0;
        width: 280px;
        border-right: 1px solid #2a3530;
        transform: translateX(0);
      }
      
      #arbor-sidebar-container.hidden {
        transform: translateX(-100%);
      }

      #arbor-graph-container {
        right: 0;
        width: 400px;
        background: #0f1311;
        transform: translateX(0);
        box-shadow: -2px 0 8px rgba(0, 0, 0, 0.3);
      }
      
      #arbor-graph-container.hidden {
        transform: translateX(100%);
      }
      
      /* Floating toggle buttons (Loom-style) */
      #arbor-toggle-buttons {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 12px;
        z-index: 1000000;
        pointer-events: none;
      }
      
      #arbor-toggle-buttons button {
        pointer-events: auto;
        padding: 12px 20px;
        background: rgba(26, 26, 26, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(42, 53, 48, 0.8);
        border-radius: 24px;
        color: #e8efe9;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      #arbor-toggle-buttons button:hover {
        background: rgba(28, 36, 32, 0.98);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
      }
      
      #arbor-toggle-buttons button:active {
        transform: translateY(0);
      }
      
      #arbor-toggle-buttons button.active {
        background: rgba(45, 212, 167, 0.2);
        border-color: rgba(45, 212, 167, 0.4);
        color: #2dd4a7;
      }

      .connection-line {
        position: absolute;
        height: 2px;
        background: rgba(74, 156, 255, 0.4);
        transform-origin: left center;
        pointer-events: auto;
        transition: all 0.2s ease;
      }

      .graph-node {
        position: absolute;
        background: #252525;
        border: 2px solid #4a9eff;
        border-radius: 12px;
        padding: 12px;
        min-width: 120px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .graph-node:hover {
        background: #2a2a2a;
        box-shadow: 0 4px 12px rgba(74, 156, 255, 0.3);
      }

      .graph-node.active {
        background: linear-gradient(135deg, #2a4a5e 0%, #1e3a4a 100%);
        box-shadow: 0 0 20px rgba(45, 212, 167, 0.3);
      }

      .graph-node-title {
        font-size: 13px;
        font-weight: 600;
        color: #fff;
        margin-bottom: 4px;
      }

      .graph-node-platform {
        font-size: 10px;
        color: #999;
      }
    `;
    document.head.appendChild(style);
  }

  injectSidebar(
    trees: Record<string, ChatTree>,
    currentTreeId: string | null,
    untrackedChats: AvailableChat[]
  ) {
    let sidebar = document.getElementById("arbor-sidebar-container");

    if (!sidebar) {
      sidebar = document.createElement("div");
      sidebar.id = "arbor-sidebar-container";
      document.body.insertBefore(sidebar, document.body.firstChild);
      // Start with sidebar visible
      document.body.classList.add("arbor-sidebar-visible");
    }

    sidebar.innerHTML = this.getSidebarHTML(
      trees,
      currentTreeId,
      untrackedChats
    );
    this.attachSidebarListeners();
    this.injectToggleButtons();
  }

  private injectToggleButtons() {
    let toggleButtons = document.getElementById("arbor-toggle-buttons");

    if (!toggleButtons) {
      toggleButtons = document.createElement("div");
      toggleButtons.id = "arbor-toggle-buttons";
      toggleButtons.innerHTML = `
        <button id="toggle-sidebar-btn" class="active">
          <span>🌳</span>
          <span>Sidebar</span>
        </button>
        <button id="toggle-graph-btn-bottom">
          <span>📊</span>
          <span>Graph</span>
        </button>
      `;
      document.body.appendChild(toggleButtons);

      // Attach listeners
      document
        .getElementById("toggle-sidebar-btn")
        ?.addEventListener("click", () => {
          this.toggleSidebar();
        });

      document
        .getElementById("toggle-graph-btn-bottom")
        ?.addEventListener("click", () => {
          this.toggleGraph();
        });
    }
  }

  private getSidebarHTML(
    trees: Record<string, ChatTree>,
    currentTreeId: string | null,
    untrackedChats: AvailableChat[]
  ): string {
    const allTrees = Object.values(trees);

    return `
      <div class="arbor-header" style="
        padding: 18px 20px;
        border-bottom: 1px solid #2a3530;
        background: linear-gradient(135deg, #131917 0%, #0c0f0e 100%);
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <h2 style="font-size: 17px; font-weight: 700; color: #e8efe9; margin: 0;">🌳 Arbor</h2>
        <div style="display: flex; gap: 8px;">
          <button id="close-sidebar-btn" style="
            padding: 6px 10px;
            background: #1c2420;
            color: #9caba3;
            border: 1px solid #2a3530;
            border-radius: 6px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 600;
            transition: all 0.2s ease;
          ">
            ✕ Close
          </button>
        </div>
      </div>
      <div class="arbor-content" style="flex: 1; overflow-y: auto;">
        ${
          allTrees.length > 0
            ? this.renderTreesList(allTrees, currentTreeId)
            : '<div class="empty-state" style="text-align: center; padding: 40px 20px; color: #6a7570;"><div style="font-size: 48px; margin-bottom: 16px;">🌱</div><div style="font-size: 14px; line-height: 1.5;"><strong>Welcome to Arbor!</strong><br><br>Create your first tree below</div></div>'
        }
        ${
          currentTreeId && trees[currentTreeId]
            ? this.renderCurrentTree(trees[currentTreeId])
            : ""
        }
        ${
          untrackedChats.length > 0
            ? this.renderUntrackedChats(untrackedChats)
            : ""
        }
      </div>
      <div class="action-buttons" style="padding: 16px 20px; border-top: 1px solid #2a3530;">
        <button class="btn" id="new-chat-btn" style="
          width: 100%;
          padding: 12px 16px;
          background: linear-gradient(135deg, #2dd4a7 0%, #1eb88a 100%);
          color: #0c0f0e;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(45, 212, 167, 0.2);
          margin-bottom: 10px;
        ">
          <span style="margin-right: 6px;">✨</span> New Chat
        </button>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-secondary" id="create-branch" style="
            flex: 1;
            padding: 12px 16px;
            background: #1c2420;
            color: #9caba3;
            border: 1px solid #2a3530;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            transition: all 0.2s ease;
          ">
            <span style="margin-right: 4px;">🌿</span> Branch
          </button>
          <button class="btn btn-secondary" id="new-tree" style="
            flex: 1;
            padding: 12px 16px;
            background: #1c2420;
            color: #9caba3;
            border: 1px solid #2a3530;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            transition: all 0.2s ease;
          ">
            <span style="margin-right: 4px;">🌳</span> New Tree
          </button>
        </div>
      </div>
    `;
  }

  private renderTreesList(
    trees: ChatTree[],
    currentTreeId: string | null
  ): string {
    return `
      <div style="padding: 16px 20px;">
        <div style="color: #a0a0a0; font-size: 11px; margin-bottom: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;">
          🌳 My Trees
        </div>
        ${trees
          .map((tree) => {
            const isActive = tree.id === currentTreeId;
            const nodeCount = Object.keys(tree.nodes).length;
            const branchCount = nodeCount > 1 ? nodeCount - 1 : 0;

            return `
            <div class="tree-item-container" data-tree-id="${
              tree.id
            }" style="position: relative; margin-bottom: 8px;">
              <div class="tree-item" data-tree-id="${tree.id}" style="
                background: ${
                  isActive
                    ? "linear-gradient(135deg, #2a4a5e 0%, #1e3a4a 100%)"
                    : "#252525"
                };
                padding: 14px 16px;
                padding-right: 44px;
                border-radius: 8px;
                cursor: pointer;
                border: ${
                  isActive
                    ? "1px solid rgba(45, 212, 167, 0.3)"
                    : "1px solid #2a3530"
                };
                box-shadow: ${
                  isActive ? "0 0 20px rgba(45, 212, 167, 0.15)" : "none"
                };
                transition: all 0.2s ease;
              ">
                <div style="color: #e8efe9; font-size: 14px; font-weight: 600; margin-bottom: 6px;">
                  ${tree.name || "Unnamed Tree"}
                </div>
                <div style="color: ${
                  isActive ? "#9caba3" : "#6a7570"
                }; font-size: 11px; opacity: 0.85;">
                  ${
                    branchCount > 0
                      ? `${branchCount} branch${branchCount !== 1 ? "es" : ""}`
                      : "No branches"
                  }${
              nodeCount > 0
                ? ` • ${nodeCount} chat${nodeCount !== 1 ? "s" : ""}`
                : ""
            }
                </div>
              </div>
            </div>
          `;
          })
          .join("")}
      </div>
    `;
  }

  private renderCurrentTree(tree: ChatTree): string {
    const displayName =
      tree.name && tree.name.trim() && tree.name !== "undefined"
        ? tree.name
        : "Unnamed Tree";

    return `
      <div style="padding: 16px 20px; border-top: 1px solid #2a3530;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <div style="color: #a0a0a0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;">
            📊 Current Tree
          </div>
          <span id="tree-title-editable" style="color: #2dd4a7; font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 4px; font-weight: 500;" title="Click to edit">
            <span style="font-size: 12px;">✏️</span> Edit Name
          </span>
        </div>
        <div style="margin-bottom: 12px; padding: 12px; background: rgba(45, 212, 167, 0.05); border-radius: 8px; border: 1px solid rgba(45, 212, 167, 0.2);">
          <div style="color: #2dd4a7; font-size: 11px; font-weight: 600; margin-bottom: 4px; opacity: 0.8;">
            TREE NAME
          </div>
          <div style="color: #e8efe9; font-size: 14px; font-weight: 600;">
            ${displayName}
          </div>
        </div>
        ${this.renderTreeNodes(tree, tree.rootNodeId)}
      </div>
    `;
  }

  private renderTreeNodes(
    tree: ChatTree,
    nodeId: string,
    depth: number = 0
  ): string {
    const node = tree.nodes[nodeId];
    if (!node) return "";

    const indent = depth * 16;
    const hasChildren = node.children.length > 0;
    const platformEmoji = {
      chatgpt: "🤖",
      gemini: "✨",
      perplexity: "🔍",
    }[node.platform];

    let html = `
      <div class="tree-node" data-node-id="${nodeId}" style="
        padding: 10px 12px;
        margin: 4px 0;
        margin-left: ${indent}px;
        background: #1c2420;
        border-radius: 6px;
        cursor: pointer;
        border-left: 3px solid #2dd4a7;
        transition: all 0.2s ease;
      ">
        <div style="font-size: 13px; font-weight: 600; color: #e8efe9; margin-bottom: 4px;">
          ${platformEmoji} ${node.title}
        </div>
        <div style="font-size: 11px; color: #9caba3;">
          ${
            hasChildren
              ? `${node.children.length} branch${
                  node.children.length !== 1 ? "es" : ""
                }`
              : "Leaf node"
          }
          ${node.connectionLabel ? ` • ${node.connectionLabel}` : ""}
        </div>
      </div>
    `;

    if (hasChildren) {
      node.children.forEach((childId) => {
        html += this.renderTreeNodes(tree, childId, depth + 1);
      });
    }

    return html;
  }

  private renderUntrackedChats(chats: AvailableChat[]): string {
    return `
      <div style="padding: 16px 20px; border-top: 1px solid #2a3530;">
        <div style="color: #a0a0a0; font-size: 11px; margin-bottom: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;">
          💬 Untracked Chats
        </div>
        <div style="max-height: 250px; overflow-y: auto;">
          ${chats
            .slice(0, 15)
            .map(
              (chat, index) => `
            <div class="untracked-chat-item" data-chat-index="${index}" data-chat-url="${
                chat.url
              }" style="
              background: #1c1c1c;
              padding: 10px 12px;
              margin-bottom: 6px;
              border-radius: 6px;
              cursor: pointer;
              border: 1px solid #2a3530;
              font-size: 11px;
              color: #8a9a90;
              transition: all 0.15s ease;
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 8px;
            ">
              <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${chat.title.substring(0, 42)}${
                chat.title.length > 42 ? "..." : ""
              }
              </span>
              <span class="add-to-tree-btn" data-chat-index="${index}" style="
                color: #2dd4a7;
                font-size: 18px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: rgba(45, 212, 167, 0.1);
                transition: all 0.15s ease;
              ">+</span>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  private attachSidebarListeners() {
    // Close Sidebar button (header)
    document
      .getElementById("close-sidebar-btn")
      ?.addEventListener("click", () => {
        this.toggleSidebar();
      });

    // New Chat button
    document.getElementById("new-chat-btn")?.addEventListener("click", () => {
      this.onSidebarAction("newChat");
    });

    // New Tree button
    document.getElementById("new-tree")?.addEventListener("click", () => {
      this.onSidebarAction("newTree");
    });

    // Branch button
    document.getElementById("create-branch")?.addEventListener("click", () => {
      this.onSidebarAction("createBranch");
    });

    // Tree selection
    document.querySelectorAll(".tree-item").forEach((item) => {
      item.addEventListener("click", () => {
        const treeId = (item as HTMLElement).dataset.treeId;
        this.onSidebarAction("selectTree", treeId);
      });
    });

    // Untracked chat selection
    document.querySelectorAll(".untracked-chat-item").forEach((item) => {
      const chatUrl = (item as HTMLElement).dataset.chatUrl;
      const chatIndex = (item as HTMLElement).dataset.chatIndex;

      item.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains("add-to-tree-btn")) {
          this.onSidebarAction("addChatToTree", chatIndex);
        } else if (chatUrl) {
          window.location.href = chatUrl;
        }
      });
    });
  }

  injectGraphView() {
    let graph = document.getElementById("arbor-graph-container");

    if (!graph) {
      graph = document.createElement("div");
      graph.id = "arbor-graph-container";
      // Start visible
      graph.innerHTML = `
        <div style="padding: 20px; border-bottom: 1px solid #2a3530; background: #131917; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <h3 style="margin: 0; font-size: 15px; font-weight: 600; color: #e8efe9;">📊 Tree Visualization</h3>
            <div style="display: flex; gap: 4px; align-items: center;">
              <button id="zoom-out-btn" style="
                padding: 4px 8px;
                background: #1c2420;
                color: #9caba3;
                border: 1px solid #2a3530;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.2s ease;
              ">−</button>
              <span id="zoom-level" style="
                font-size: 11px;
                color: #6a7570;
                min-width: 45px;
                text-align: center;
              ">100%</span>
              <button id="zoom-in-btn" style="
                padding: 4px 8px;
                background: #1c2420;
                color: #9caba3;
                border: 1px solid #2a3530;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.2s ease;
              ">+</button>
              <button id="zoom-reset-btn" style="
                padding: 4px 8px;
                background: #1c2420;
                color: #9caba3;
                border: 1px solid #2a3530;
                border-radius: 4px;
                cursor: pointer;
                font-size: 10px;
                font-weight: 600;
                transition: all 0.2s ease;
              ">Reset</button>
            </div>
          </div>
          <button id="close-graph-btn" style="
            padding: 6px 12px;
            background: #1c2420;
            color: #9caba3;
            border: 1px solid #2a3530;
            border-radius: 6px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 600;
            transition: all 0.2s ease;
          ">✕ Close</button>
        </div>
        <div style="
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: rgba(28, 36, 32, 0.9);
          border: 1px solid #2a3530;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 11px;
          color: #6a7570;
          z-index: 100;
          pointer-events: none;
        ">
          💡 <strong>Tip:</strong> Space + Scroll to zoom, Space + Drag to pan
        </div>
        <div id="graph-canvas" style="width: 100%; height: calc(100% - 65px); position: relative; overflow: auto; background: #0f1311; cursor: default;">
          <div id="graph-content" style="position: relative; width: 2000px; height: 2000px;"></div>
        </div>
      `;
      document.body.appendChild(graph);
      
      // Make graph visible by default
      document.body.classList.add("arbor-graph-visible");
      
      // Update floating button state
      const toggleBtnBottom = document.getElementById("toggle-graph-btn-bottom");
      if (toggleBtnBottom) {
        toggleBtnBottom.classList.add("active");
      }

      // Add close button listener
      graph.querySelector("#close-graph-btn")?.addEventListener("click", () => {
        this.toggleGraph();
      });
    }
  }

  toggleSidebar() {
    const sidebar = document.getElementById("arbor-sidebar-container");
    if (sidebar) {
      const isHidden = sidebar.classList.contains("hidden");

      if (isHidden) {
        sidebar.classList.remove("hidden");
        document.body.classList.add("arbor-sidebar-visible");
      } else {
        sidebar.classList.add("hidden");
        document.body.classList.remove("arbor-sidebar-visible");
      }

      // Update button state
      const toggleBtn = document.getElementById("toggle-sidebar-btn");
      if (toggleBtn) {
        if (isHidden) {
          toggleBtn.classList.add("active");
        } else {
          toggleBtn.classList.remove("active");
        }
      }
    }
  }

  toggleGraph() {
    const graph = document.getElementById("arbor-graph-container");
    if (graph) {
      const isHidden = graph.classList.contains("hidden");

      if (isHidden) {
        graph.classList.remove("hidden");
        document.body.classList.add("arbor-graph-visible");
      } else {
        graph.classList.add("hidden");
        document.body.classList.remove("arbor-graph-visible");
      }

      // Update floating button state
      const toggleBtnBottom = document.getElementById("toggle-graph-btn-bottom");
      if (toggleBtnBottom) {
        if (isHidden) {
          toggleBtnBottom.classList.add("active");
        } else {
          toggleBtnBottom.classList.remove("active");
        }
      }
    }
  }

  showGraph() {
    const graph = document.getElementById("arbor-graph-container");
    if (graph) {
      graph.classList.remove("hidden");
      document.body.classList.add("arbor-graph-visible");

      const toggleBtnBottom = document.getElementById("toggle-graph-btn-bottom");
      if (toggleBtnBottom) {
        toggleBtnBottom.classList.add("active");
      }
    }
  }

  hideGraph() {
    const graph = document.getElementById("arbor-graph-container");
    if (graph) {
      graph.classList.add("hidden");
      document.body.classList.remove("arbor-graph-visible");

      const toggleBtnBottom = document.getElementById("toggle-graph-btn-bottom");
      if (toggleBtnBottom) {
        toggleBtnBottom.classList.remove("active");
      }
    }
  }
}
