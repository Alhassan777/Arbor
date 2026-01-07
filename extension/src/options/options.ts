/**
 * Options page script for Arbor extension
 * Handles API key management UI
 */

// Import the secure storage utility functions
// Note: In a web page context, we need to use chrome.storage directly
// since we can't import TypeScript modules directly

const STORAGE_KEY = "gemini_api_key";

// DOM elements
const apiKeyForm = document.getElementById("apiKeyForm") as HTMLFormElement;
const apiKeyInput = document.getElementById("apiKey") as HTMLInputElement;
const toggleVisibilityBtn = document.getElementById("toggleVisibility") as HTMLButtonElement;
const saveBtn = document.getElementById("saveBtn") as HTMLButtonElement;
const saveBtnText = document.getElementById("saveBtnText") as HTMLSpanElement;
const saveBtnLoading = document.getElementById("saveBtnLoading") as HTMLSpanElement;
const testBtn = document.getElementById("testBtn") as HTMLButtonElement;
const removeBtn = document.getElementById("removeBtn") as HTMLButtonElement;
const statusMessage = document.getElementById("statusMessage") as HTMLDivElement;

// State
let isPasswordVisible = false;

/**
 * Redact API key for safe logging
 */
function redactApiKey(key: string | null | undefined): string {
  if (!key) return "[no key]";
  if (key.length <= 10) return "[invalid]";
  return `${key.substring(0, 7)}...****`;
}

/**
 * Validate API key format
 */
function validateApiKeyFormat(key: string): { valid: boolean; error?: string } {
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
 * Show status message
 */
function showStatus(message: string, type: "success" | "error" | "info") {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type} show`;
  
  // Auto-hide after 5 seconds for success/info messages
  if (type === "success" || type === "info") {
    setTimeout(() => {
      statusMessage.classList.remove("show");
    }, 5000);
  }
}

/**
 * Load existing API key (masked)
 */
async function loadApiKey() {
  try {
    return new Promise<string | null>((resolve) => {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        if (chrome.runtime.lastError) {
          console.error("Error loading API key:", chrome.runtime.lastError.message);
          resolve(null);
          return;
        }
        resolve(result[STORAGE_KEY] || null);
      });
    });
  } catch (error) {
    console.error("Failed to load API key:", error);
    return null;
  }
}

/**
 * Save API key
 */
async function saveApiKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
  // Validate format
  const validation = validateApiKeyFormat(apiKey);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const trimmed = apiKey.trim();

  try {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: trimmed }, () => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message });
          return;
        }
        console.log("API key saved", redactApiKey(trimmed));
        resolve({ success: true });
      });
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Remove API key
 */
async function removeApiKey(): Promise<{ success: boolean; error?: string }> {
  try {
    return new Promise((resolve) => {
      chrome.storage.local.remove([STORAGE_KEY], () => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message });
          return;
        }
        resolve({ success: true });
      });
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Validate API key with background script
 */
async function validateApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        action: "gemini-validate-key",
        payload: { apiKey },
      },
      (response) => {
        if (chrome.runtime.lastError) {
          resolve({
            valid: false,
            error: chrome.runtime.lastError.message,
          });
          return;
        }

        if (response && response.success) {
          resolve({
            valid: response.valid,
            error: response.error,
          });
        } else {
          resolve({
            valid: false,
            error: response?.error || "Validation failed",
          });
        }
      }
    );
  });
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility() {
  isPasswordVisible = !isPasswordVisible;
  apiKeyInput.type = isPasswordVisible ? "text" : "password";
  toggleVisibilityBtn.textContent = isPasswordVisible ? "🙈" : "👁️";
}

/**
 * Initialize the page
 */
async function init() {
  // Load existing API key
  const existingKey = await loadApiKey();
  if (existingKey) {
    // Show masked version: show first 7 chars + dots
    apiKeyInput.value = redactApiKey(existingKey);
    apiKeyInput.placeholder = "API key is already saved (enter new key to replace)";
  }

  // Event listeners
  toggleVisibilityBtn.addEventListener("click", togglePasswordVisibility);

  apiKeyForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      showStatus("Please enter an API key", "error");
      return;
    }

    // Don't save if it's the redacted version
    if (apiKey.includes("...****")) {
      showStatus("Please enter a new API key (the current key is hidden for security)", "info");
      return;
    }

    // Validate format
    const formatValidation = validateApiKeyFormat(apiKey);
    if (!formatValidation.valid) {
      showStatus(formatValidation.error || "Invalid API key format", "error");
      return;
    }

    // Show loading state
    saveBtn.disabled = true;
    saveBtnText.style.display = "none";
    saveBtnLoading.style.display = "inline";

    try {
      // Validate with API
      const validation = await validateApiKey(apiKey);
      if (!validation.valid) {
        showStatus(validation.error || "Invalid API key", "error");
        saveBtn.disabled = false;
        saveBtnText.style.display = "inline";
        saveBtnLoading.style.display = "none";
        return;
      }

      // Save the key
      const result = await saveApiKey(apiKey);
      if (result.success) {
        showStatus("✅ API key saved successfully!", "success");
        apiKeyInput.value = redactApiKey(apiKey);
        apiKeyInput.type = "password";
        isPasswordVisible = false;
        toggleVisibilityBtn.textContent = "👁️";
      } else {
        showStatus(result.error || "Failed to save API key", "error");
      }
    } catch (error) {
      showStatus(
        error instanceof Error ? error.message : "Failed to validate API key",
        "error"
      );
    } finally {
      saveBtn.disabled = false;
      saveBtnText.style.display = "inline";
      saveBtnLoading.style.display = "none";
    }
  });

  testBtn.addEventListener("click", async () => {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey || apiKey.includes("...****")) {
      showStatus("Please enter an API key first", "error");
      return;
    }

    testBtn.disabled = true;
    testBtn.textContent = "⏳ Testing...";

    try {
      const validation = await validateApiKey(apiKey);
      if (validation.valid) {
        showStatus("✅ Connection test successful! API key is valid.", "success");
      } else {
        showStatus(validation.error || "Connection test failed", "error");
      }
    } catch (error) {
      showStatus(
        error instanceof Error ? error.message : "Connection test failed",
        "error"
      );
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = "Test Connection";
    }
  });

  removeBtn.addEventListener("click", async () => {
    if (!confirm("Are you sure you want to remove your API key? You'll need to enter it again to use Gemini features.")) {
      return;
    }

    removeBtn.disabled = true;
    removeBtn.textContent = "⏳ Removing...";

    try {
      const result = await removeApiKey();
      if (result.success) {
        showStatus("✅ API key removed successfully", "success");
        apiKeyInput.value = "";
        apiKeyInput.placeholder = "AIza...";
      } else {
        showStatus(result.error || "Failed to remove API key", "error");
      }
    } catch (error) {
      showStatus(
        error instanceof Error ? error.message : "Failed to remove API key",
        "error"
      );
    } finally {
      removeBtn.disabled = false;
      removeBtn.textContent = "Remove Key";
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
