/**
 * SidebarListeners - Handles sidebar event listeners
 */

export class SidebarListeners {
  private onSidebarAction: (action: string, data?: any) => void;
  private onToggleSidebar: () => void;

  constructor(
    onSidebarAction: (action: string, data?: any) => void,
    onToggleSidebar: () => void
  ) {
    this.onSidebarAction = onSidebarAction;
    this.onToggleSidebar = onToggleSidebar;
  }

  attach() {
    // Close Sidebar button (header)
    document
      .getElementById("close-sidebar-btn")
      ?.addEventListener("click", () => {
        this.onToggleSidebar();
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
}
