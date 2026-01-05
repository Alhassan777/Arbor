/**
 * SidebarRenderer - Handles sidebar HTML generation
 */

import type { ChatTree } from "../../types";
import type { AvailableChat } from "./UIInjector";

export class SidebarRenderer {
  static render(
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

  private static renderTreesList(
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

  private static renderCurrentTree(tree: ChatTree): string {
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
          <div style="display: flex; gap: 8px; align-items: center;">
            <span id="tree-title-editable" style="color: #2dd4a7; font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 4px; font-weight: 500;" title="Click to edit">
              <span style="font-size: 12px;">✏️</span> Edit Name
            </span>
            <span id="tree-delete-btn" style="color: #ef4444; font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 4px; font-weight: 500;" title="Delete tree">
              <span style="font-size: 12px;">🗑️</span> Delete
            </span>
          </div>
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

  private static renderTreeNodes(
    tree: ChatTree,
    nodeId: string,
    depth: number = 0
  ): string {
    const node = tree.nodes[nodeId];
    if (!node) return "";

    const indent = depth * 16;
    const hasChildren = node.children.length > 0;
    const isRootNode = nodeId === tree.rootNodeId;
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
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      ">
        <div style="flex: 1;">
          <div style="font-size: 13px; font-weight: 600; color: #e8efe9; margin-bottom: 4px;">
            ${platformEmoji} ${node.title}
            ${isRootNode ? ' <span style="font-size: 10px; color: #6a7570;">(Root)</span>' : ''}
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
        ${
          !isRootNode
            ? `<button class="delete-node-btn" data-node-id="${nodeId}" style="
          padding: 4px 8px;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 4px;
          cursor: pointer;
          font-size: 10px;
          font-weight: 600;
          transition: all 0.2s ease;
          opacity: 0;
          pointer-events: auto;
        " title="Delete node">🗑️</button>`
            : ""
        }
      </div>
    `;

    if (hasChildren) {
      node.children.forEach((childId) => {
        html += this.renderTreeNodes(tree, childId, depth + 1);
      });
    }

    return html;
  }

  private static renderUntrackedChats(chats: AvailableChat[]): string {
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
}
