/**
 * Platform Factory
 * Detects and returns the appropriate platform implementation
 */

import { Platform } from '../types';
import { chatgptPlatform } from './chatgpt';
import { geminiPlatform } from './gemini';
import { perplexityPlatform } from './perplexity';

const platforms: Platform[] = [chatgptPlatform, geminiPlatform, perplexityPlatform];

/**
 * Get the active platform based on current URL
 */
export function getActivePlatform(): Platform | null {
  for (const platform of platforms) {
    if (platform.isActive()) {
      return platform;
    }
  }
  return null;
}

/**
 * Export individual platforms for direct access
 */
export { chatgptPlatform, geminiPlatform, perplexityPlatform };

/**
 * Export all platforms
 */
export { platforms };
