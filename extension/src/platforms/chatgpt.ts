// ChatGPT platform integration
import { Platform } from '../types';

export class ChatGPTPlatform implements Platform {
  name = 'chatgpt';

  /**
   * Detect if we're on ChatGPT
   */
  isActive(): boolean {
    const hostname = window.location.hostname;
    return hostname.includes('chatgpt.com') || hostname.includes('openai.com');
  }

  /**
   * Extract chat ID from URL
   * URLs look like: https://chatgpt.com/c/abc123def456
   */
  getChatId(): string | null {
    const match = window.location.pathname.match(/\/c\/([a-zA-Z0-9-]+)/);
    return match ? match[1] : null;
  }

  /**
   * Get current chat URL
   */
  detectCurrentChatUrl(): string | null {
    const chatId = this.getChatId();
    if (!chatId) return null;
    return window.location.href;
  }

  /**
   * Extract chat title from DOM
   * ChatGPT displays the title in various places
   */
  detectChatTitle(): string | null {
    // Try multiple selectors in order of preference
    const selectors = [
      // Main chat title in sidebar (when chat is selected)
      'nav [class*="group"] [class*="flex-1"] [class*="text-sm"]',
      // Page title
      'title',
      // Header title
      'h1',
      // Fallback: first message content
      '[data-message-author-role="user"] [class*="markdown"]',
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        let title = element.textContent.trim();

        // Clean up page title (remove " | ChatGPT" suffix)
        if (selector === 'title') {
          title = title.replace(/\s*\|\s*ChatGPT.*$/, '');
        }

        // Limit length
        if (title.length > 100) {
          title = title.substring(0, 97) + '...';
        }

        return title || 'Untitled Chat';
      }
    }

    return 'Untitled Chat';
  }

  /**
   * Check if we're in a conversation (not home page)
   */
  isInConversation(): boolean {
    return this.getChatId() !== null;
  }

  /**
   * Get the selected/highlighted text in the chat
   */
  getSelectedText(): string | null {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) {
      return null;
    }
    return selection.toString().trim();
  }

  /**
   * Open a new chat (navigates to home then opens new chat)
   */
  openNewChat(): void {
    window.location.href = 'https://chatgpt.com/';
  }

  /**
   * Navigate to a specific chat
   */
  navigateToChat(chatId: string): void {
    window.location.href = `https://chatgpt.com/c/${chatId}`;
  }

  /**
   * Generate context prompt for branching
   * This creates a prompt that the user can paste into a new chat
   */
  generateBranchContext(params: {
    parentTitle: string;
    summary?: string;
    selectedText?: string;
    connectionType?: string;
  }): string {
    const { parentTitle, summary, selectedText, connectionType } = params;

    let context = `This is a continuation of our previous conversation: "${parentTitle}".\n\n`;

    if (summary) {
      context += `Previous conversation summary:\n${summary}\n\n`;
    }

    if (selectedText) {
      context += `I want to focus on this specific part:\n"${selectedText}"\n\n`;
    }

    if (connectionType) {
      const relationshipDescriptions: Record<string, string> = {
        deepens: "Let's explore this topic in more depth.",
        explores: "Let's explore a related aspect of this.",
        contrasts: "Let's consider an alternative perspective on this.",
        examples: "Let's look at specific examples of this.",
        applies: "Let's discuss how to apply this in practice.",
        questions: "I have some questions about this.",
        extends: "Let's extend this discussion to related areas.",
        summarizes: "Let's summarize and consolidate what we've discussed.",
      };

      const description = relationshipDescriptions[connectionType];
      if (description) {
        context += description + '\n\n';
      }
    }

    context += 'Please continue from here.';

    return context;
  }

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Watch for URL changes (ChatGPT is a SPA)
   */
  onNavigationChange(callback: (chatId: string | null) => void): void {
    let lastChatId = this.getChatId();

    // Use MutationObserver to detect URL changes in SPA
    const observer = new MutationObserver(() => {
      const currentChatId = this.getChatId();
      if (currentChatId !== lastChatId) {
        lastChatId = currentChatId;
        callback(currentChatId);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also listen to popstate for back/forward navigation
    window.addEventListener('popstate', () => {
      const currentChatId = this.getChatId();
      if (currentChatId !== lastChatId) {
        lastChatId = currentChatId;
        callback(currentChatId);
      }
    });
  }

  /**
   * Extract all messages from current chat (for context/summarization)
   */
  extractMessages(): Array<{ role: 'user' | 'assistant'; content: string }> {
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Find all message elements
    const messageElements = document.querySelectorAll('[data-message-author-role]');

    messageElements.forEach((element) => {
      const role = element.getAttribute('data-message-author-role') as
        | 'user'
        | 'assistant'
        | null;
      if (!role || (role !== 'user' && role !== 'assistant')) return;

      const contentElement = element.querySelector('[class*="markdown"]');
      if (!contentElement) return;

      const content = contentElement.textContent?.trim();
      if (!content) return;

      messages.push({ role, content });
    });

    return messages;
  }

  /**
   * Get last N messages for context
   */
  getRecentMessages(count: number = 10): Array<{ role: 'user' | 'assistant'; content: string }> {
    const allMessages = this.extractMessages();
    return allMessages.slice(-count);
  }
}

export const chatgptPlatform = new ChatGPTPlatform();
