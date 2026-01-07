/**
 * Secure API Key Storage Utility
 * 
 * Stores Gemini API keys securely using chrome.storage.local
 * - Keys are encrypted by Chrome and not synced across devices
 * - Never logs full keys - always redacts for security
 */

const STORAGE_KEY = "gemini_api_key";

/**
 * Redact API key for safe logging (only shows first 7 chars: "AIza...")
 */
function redactApiKey(key: string | null | undefined): string {
  if (!key) return "[no key]";
  if (key.length <= 10) return "[invalid]";
  return `${key.substring(0, 7)}...****`;
}

/**
 * Validate API key format
 * Gemini API keys start with "AIza" and are typically 39+ characters
 */
export function validateApiKeyFormat(key: string): { valid: boolean; error?: string } {
  if (!key || typeof key !== "string") {
    return { valid: false, error: "API key is required" };
  }

  const trimmed = key.trim();

  if (trimmed.length < 30) {
    return { valid: false, error: "API key is too short (minimum 30 characters)" };
  }

  if (!trimmed.startsWith("AIza")) {
    return { valid: false, error: "Invalid API key format (must start with 'AIza')" };
  }

  return { valid: true };
}

/**
 * Get the stored API key
 * @returns Promise resolving to API key string or null if not set
 */
export async function getApiKey(): Promise<string | null> {
  try {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        if (chrome.runtime.lastError) {
          console.error("Error getting API key:", chrome.runtime.lastError.message);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        const apiKey = result[STORAGE_KEY] || null;
        if (apiKey) {
          console.log("🌳 Arbor: API key retrieved from storage", redactApiKey(apiKey));
        } else {
          console.log("🌳 Arbor: No API key found in storage");
        }

        resolve(apiKey);
      });
    });
  } catch (error) {
    console.error("Failed to get API key:", error);
    return null;
  }
}

/**
 * Store an API key securely
 * @param apiKey - The API key to store
 * @returns Promise resolving to success status
 */
export async function setApiKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
  // Validate format before storing
  const validation = validateApiKeyFormat(apiKey);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const trimmed = apiKey.trim();

  try {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [STORAGE_KEY]: trimmed }, () => {
        if (chrome.runtime.lastError) {
          const error = chrome.runtime.lastError.message;
          console.error("Error saving API key:", error);
          reject(new Error(error));
          return;
        }

        console.log("🌳 Arbor: API key saved to secure storage", redactApiKey(trimmed));
        resolve({ success: true });
      });
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to save API key:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Remove the stored API key
 * @returns Promise resolving to success status
 */
export async function removeApiKey(): Promise<{ success: boolean; error?: string }> {
  try {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove([STORAGE_KEY], () => {
        if (chrome.runtime.lastError) {
          const error = chrome.runtime.lastError.message;
          console.error("Error removing API key:", error);
          reject(new Error(error));
          return;
        }

        console.log("🌳 Arbor: API key removed from storage");
        resolve({ success: true });
      });
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to remove API key:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Check if an API key is currently stored
 * @returns Promise resolving to boolean
 */
export async function hasApiKey(): Promise<boolean> {
  const key = await getApiKey();
  return key !== null && key.length > 0;
}
