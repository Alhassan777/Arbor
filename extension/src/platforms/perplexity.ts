// Perplexity AI platform integration
import { Platform, PlatformName, AIProvider, PLATFORM_TO_PROVIDER } from '../types';

export class PerplexityPlatform implements Platform {
  name = 'perplexity';

  /**
   * Detect if we're on Perplexity
   */
  isActive(): boolean {
    const hostname = window.location.hostname;
    return hostname.includes('perplexity.ai');
  }

  /**
   * Extract chat ID from URL
   * URLs look like: https://www.perplexity.ai/search/abc-123-def
   */
  getChatId(): string | null {
    const match = window.location.pathname.match(/\/search\/([a-zA-Z0-9-_]+)/);
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
   */
  detectChatTitle(): string | null {
    // Try page title first
    const titleElement = document.querySelector('title');
    if (titleElement?.textContent) {
      let title = titleElement.textContent.trim();
      // Remove " - Perplexity" suffix
      title = title.replace(/\s*-\s*Perplexity.*$/, '');
      return title || 'Untitled Search';
    }

    return 'Untitled Search';
  }

  /**
   * Check if we're in a conversation
   */
  isInConversation(): boolean {
    return this.getChatId() !== null;
  }

  /**
   * Get the selected/highlighted text
   */
  getSelectedText(): string | null {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) {
      return null;
    }
    return selection.toString().trim();
  }

  /**
   * Open a new search
   */
  openNewChat(): void {
    window.location.href = 'https://www.perplexity.ai/';
  }

  /**
   * Navigate to a specific search
   */
  navigateToChat(chatId: string): void {
    window.location.href = `https://www.perplexity.ai/search/${chatId}`;
  }

  /**
   * Generate context prompt for branching
   */
  generateBranchContext(params: {
    parentTitle: string;
    summary?: string;
    selectedText?: string;
    connectionType?: string;
  }): string {
    const { parentTitle, summary, selectedText, connectionType } = params;

    let context = `This is a follow-up to my previous search: "${parentTitle}".\n\n`;

    if (summary) {
      context += `Previous search summary:\n${summary}\n\n`;
    }

    if (selectedText) {
      context += `I want to explore this specific aspect:\n"${selectedText}"\n\n`;
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

    context += 'Please continue the search from here.';
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
   * Watch for URL changes
   */
  onNavigationChange(callback: (chatId: string | null) => void): void {
    let lastChatId = this.getChatId();

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

    window.addEventListener('popstate', () => {
      const currentChatId = this.getChatId();
      if (currentChatId !== lastChatId) {
        lastChatId = currentChatId;
        callback(currentChatId);
      }
    });
  }

  /**
   * Extract all messages from current search
   */
  extractMessages(): Array<{ role: 'user' | 'assistant'; content: string }> {
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Perplexity's message structure may vary - this is a placeholder
    // You'll need to inspect the DOM to find the correct selectors
    const messageElements = document.querySelectorAll('[data-role]');

    messageElements.forEach((element) => {
      const role = element.getAttribute('data-role') as 'user' | 'assistant' | null;
      if (!role || (role !== 'user' && role !== 'assistant')) return;

      const content = element.textContent?.trim();
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

  /**
   * Attempt to rename a search
   */
  async renameChat(chatUrl: string, newTitle: string): Promise<boolean> {
    // Perplexity's rename functionality is platform-specific
    // This is a placeholder implementation
    console.warn('Rename search not yet implemented for Perplexity');
    return false;
  }

  /**
   * Get provider info for backend integration
   */
  getProviderInfo(): { platform: PlatformName; provider: AIProvider } {
    return {
      platform: 'perplexity' as PlatformName,
      provider: PLATFORM_TO_PROVIDER['perplexity'], // Maps to 'perplexity'
    };
  }
}

export const perplexityPlatform = new PerplexityPlatform();
