/**
 * BranchContextManager - Handles branch creation with context
 * 
 * This module manages the creation of branch contexts by:
 * - Extracting recent messages from the current chat
 * - Getting selected text (if any)
 * - Generating formatted context for branching
 * - Copying context to clipboard
 * - Opening new chat
 */

import { chatgptPlatform } from "../../platforms/chatgpt";
import type { Platform } from "../../types";

export interface BranchContextOptions {
  parentTitle: string;
  connectionType?: string;
  messageCount?: number;
}

export class BranchContextManager {
  private platform: "chatgpt" | "gemini" | "perplexity";
  private platformInstance: Platform;

  constructor(platform: "chatgpt" | "gemini" | "perplexity") {
    this.platform = platform;
    
    // Get platform instance (similar to ChatDetector pattern)
    // Currently only ChatGPT is fully implemented
    if (platform === "chatgpt") {
      this.platformInstance = chatgptPlatform;
    } else {
      // Fallback - we'll need to implement other platforms later
      this.platformInstance = chatgptPlatform;
    }
  }

  /**
   * Create branch context and copy to clipboard
   * Returns the generated context string
   */
  async createBranchContext(options: BranchContextOptions): Promise<{
    success: boolean;
    context: string;
    error?: string;
  }> {
    try {
      const { parentTitle, connectionType = "extends", messageCount = 10 } = options;

      // Get recent messages from the current chat
      const recentMessages = this.platformInstance.getRecentMessages(messageCount);

      // Format messages as summary
      const summary = recentMessages
        .map((m) => `${m.role}: ${m.content.substring(0, 100)}`)
        .join("\n");

      // Get selected text (if any)
      const selectedText = this.platformInstance.getSelectedText() || undefined;

      // Generate context using platform method
      const context = this.platformInstance.generateBranchContext({
        parentTitle,
        summary: `Recent context:\n${summary}`,
        selectedText,
        connectionType,
      });

      // Copy to clipboard
      const copied = await this.platformInstance.copyToClipboard(context);

      if (!copied) {
        return {
          success: false,
          context,
          error: "Failed to copy to clipboard",
        };
      }

      return {
        success: true,
        context,
      };
    } catch (error) {
      console.error("Error creating branch context:", error);
      return {
        success: false,
        context: "",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Open a new chat in the current platform
   */
  openNewChat(): void {
    this.platformInstance.openNewChat();
  }

  /**
   * Get currently selected text
   */
  getSelectedText(): string | null {
    return this.platformInstance.getSelectedText();
  }

  /**
   * Get recent messages from current chat
   */
  getRecentMessages(count: number = 10): Array<{ role: "user" | "assistant"; content: string }> {
    return this.platformInstance.getRecentMessages(count);
  }
}
