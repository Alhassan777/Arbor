/**
 * UIInjector - Orchestrates UI injection and management
 * Refactored to use smaller, focused modules
 */

import type { ChatTree } from "../../types";
import { StyleInjector } from "./StyleInjector";
import { SidebarRenderer } from "./SidebarRenderer";
import { GraphViewRenderer } from "./GraphViewRenderer";
import { ToggleButtonsManager } from "./ToggleButtonsManager";
import { SidebarListeners } from "./SidebarListeners";

export interface AvailableChat {
  id: string;
  title: string;
  url: string;
  platform: "chatgpt" | "gemini" | "perplexity";
}

export class UIInjector {
  private onSidebarAction: (action: string, data?: any) => void;
  private toggleButtonsManager: ToggleButtonsManager;
  private sidebarListeners: SidebarListeners;

  constructor(onSidebarAction: (action: string, data?: any) => void) {
    this.onSidebarAction = onSidebarAction;
    this.toggleButtonsManager = new ToggleButtonsManager(
      () => this.toggleSidebar(),
      () => this.toggleGraph()
    );
    this.sidebarListeners = new SidebarListeners(onSidebarAction, () =>
      this.toggleSidebar()
    );
  }

  injectStyles() {
    StyleInjector.inject();
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
      // Sidebar overlays, no need to adjust body margins
    }

    sidebar.innerHTML = SidebarRenderer.render(
      trees,
      currentTreeId,
      untrackedChats
    );
    this.sidebarListeners.attach();
    this.toggleButtonsManager.inject();
    // Sync button state with sidebar visibility (sidebar starts visible)
    this.toggleButtonsManager.updateSidebarState(
      !sidebar.classList.contains("hidden")
    );
  }

  injectGraphView() {
    let graph = document.getElementById("arbor-graph-container");

    if (!graph) {
      graph = document.createElement("div");
      graph.id = "arbor-graph-container";
      graph.innerHTML = GraphViewRenderer.render();
      document.body.appendChild(graph);

      // Graph overlays, no need to adjust body margins
      // Update floating button state
      this.toggleButtonsManager.updateGraphState(true);

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
        // Sidebar is now visible
        this.toggleButtonsManager.updateSidebarState(true);
      } else {
        sidebar.classList.add("hidden");
        // Sidebar is now hidden
        this.toggleButtonsManager.updateSidebarState(false);
      }
    }
  }

  toggleGraph() {
    const graph = document.getElementById("arbor-graph-container");
    if (graph) {
      const isHidden = graph.classList.contains("hidden");

      if (isHidden) {
        graph.classList.remove("hidden");
        // Graph is now visible
        this.toggleButtonsManager.updateGraphState(true);
      } else {
        graph.classList.add("hidden");
        // Graph is now hidden
        this.toggleButtonsManager.updateGraphState(false);
      }
    }
  }

  showGraph() {
    const graph = document.getElementById("arbor-graph-container");
    if (graph) {
      graph.classList.remove("hidden");
      this.toggleButtonsManager.updateGraphState(true);
    }
  }

  hideGraph() {
    const graph = document.getElementById("arbor-graph-container");
    if (graph) {
      graph.classList.add("hidden");
      this.toggleButtonsManager.updateGraphState(false);
    }
  }
}
