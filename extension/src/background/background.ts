// Background service worker for Arbor extension

console.log("🌳 Arbor extension background script loaded");

/**
 * Redact API key from strings for safe logging
 */
function redactApiKey(text: string): string {
  if (!text) return text;
  // Replace API keys (AIza...) with redacted version
  return text.replace(/AIza[^\s"']+/g, "AIza...****");
}

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log("🌳 Arbor extension installed:", details.reason);

  if (details.reason === "install") {
    // First time installation
    console.log("Welcome to Arbor! 🌳");
    console.log("🌳 Background: Configure your Gemini API key in extension settings");
  } else if (details.reason === "update") {
    // Extension updated
    console.log("🌳 Arbor extension updated");
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("🌳 Background received message:", request.action);

  // Handle Gemini API availability check
  if (request.action === "gemini-check-availability") {
    handleGeminiAvailabilityCheck()
      .then((available) => {
        sendResponse({ success: true, available });
      })
      .catch((error) => {
        console.warn("🌳 Background: Availability check failed:", error);
        sendResponse({ success: false, available: false, error: error.message });
      })
      .catch(() => {}); // Fallback

    return true; // Keep message channel open for async response
  }

  // Handle Gemini API call
  if (request.action === "gemini-api-call") {
    handleGeminiAPICall(request.payload)
      .then((result) => {
        sendResponse({ success: true, ...result });
      })
      .catch((error) => {
        console.error("🌳 Background: Gemini API error:", redactApiKey(error.message || String(error)));
        sendResponse({
          success: false,
          error: redactApiKey(error instanceof Error ? error.message : "Unknown error"),
        });
      })
      .catch(() => {}); // Fallback

    return true; // Keep message channel open for async response
  }

  // Handle Gemini API key validation
  if (request.action === "gemini-validate-key") {
    handleGeminiKeyValidation(request.payload?.apiKey)
      .then((result) => {
        sendResponse(result);
      })
      .catch((error) => {
        sendResponse({
          success: false,
          valid: false,
          error: redactApiKey(error instanceof Error ? error.message : "Unknown error"),
        });
      })
      .catch(() => {}); // Fallback

    return true; // Keep message channel open for async response
  }

  // Handle tab ID request (legacy, kept for compatibility)
  if (request.action === "get-tab-id") {
    if (sender.tab && sender.tab.id) {
      sendResponse({ success: true, tabId: sender.tab.id });
    } else {
      sendResponse({
        success: false,
        error: "No tab ID available in sender",
      });
    }
    return true;
  }

  // Unknown action - still respond to prevent "message port closed" error
  sendResponse({ success: false, error: "Unknown action" });
  return false;
});

/**
 * Get API key from secure storage
 */
async function getApiKey(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["gemini_api_key"], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(result.gemini_api_key || null);
    });
  });
}

/**
 * Check if Gemini API is available (has API key)
 */
async function handleGeminiAvailabilityCheck(): Promise<boolean> {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      console.log("🌳 Background: Gemini API key not found");
      return false;
    }

    // Validate format
    if (!apiKey.startsWith("AIza") || apiKey.length < 30) {
      console.log("🌳 Background: Invalid Gemini API key format");
      return false;
    }

    console.log("🌳 Background: Gemini API key found", redactApiKey(apiKey));
    return true;
  } catch (error) {
    console.error("🌳 Background: Error checking Gemini availability:", error);
    return false;
  }
}

/**
 * Handle Gemini API call
 */
async function handleGeminiAPICall(payload: {
  method: string;
  model?: string;
  prompt: string;
  maxTokens?: number;
}): Promise<{ text: string }> {
  const { method = "generateContent", model = "gemini-2.0-flash-exp", prompt, maxTokens = 2048 } = payload;

  // Get API key from secure storage
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key not found. Please configure it in extension settings.");
  }

  // Validate API key format
  if (!apiKey.startsWith("AIza") || apiKey.length < 30) {
    throw new Error("Invalid Gemini API key format");
  }

  try {
    // Build Gemini API request
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
      },
    };

    console.log("🌳 Background: Calling Gemini API (model:", model + ")", redactApiKey("key: " + apiKey));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText || "API error";
      
      // Redact any API keys in error message
      let safeErrorMessage = redactApiKey(errorMessage);
      
      // Handle specific error codes
      if (response.status === 401) {
        safeErrorMessage = "Invalid API key. Please check your API key in extension settings.";
      } else if (response.status === 403) {
        safeErrorMessage = "API key does not have permission to access this model.";
      } else if (response.status === 429) {
        safeErrorMessage = "Rate limit exceeded. Please try again later.";
      } else if (response.status === 400) {
        safeErrorMessage = "Invalid request: " + safeErrorMessage;
      }

      throw new Error(`Gemini API error (${response.status}): ${safeErrorMessage}`);
    }

    const data = await response.json();

    // Extract text from Gemini response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("No text in Gemini API response");
    }

    return { text };
  } catch (error) {
    // Ensure we don't expose API keys in errors
    if (error instanceof Error) {
      throw new Error(redactApiKey(error.message));
    }
    throw new Error("Failed to call Gemini API");
  }
}

/**
 * Validate Gemini API key by making a lightweight test request
 */
async function handleGeminiKeyValidation(apiKey?: string): Promise<{
  success: boolean;
  valid: boolean;
  error?: string;
}> {
  if (!apiKey) {
    return { success: false, valid: false, error: "API key is required" };
  }

  // Validate format
  if (!apiKey.startsWith("AIza") || apiKey.length < 30) {
    return {
      success: true,
      valid: false,
      error: "Invalid API key format (must start with 'AIza' and be at least 30 characters)",
    };
  }

  try {
    // Make a lightweight test request
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "test",
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1,
        },
      }),
    });

    if (response.ok) {
      return { success: true, valid: true };
    } else {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;

      if (response.status === 401) {
        return {
          success: true,
          valid: false,
          error: "Invalid API key. Please check your key and try again.",
        };
      } else if (response.status === 403) {
        return {
          success: true,
          valid: false,
          error: "API key does not have permission to access this model.",
        };
      } else {
        return {
          success: true,
          valid: false,
          error: `API key validation failed: ${errorMessage}`,
        };
      }
    }
  } catch (error) {
    return {
      success: false,
      valid: false,
      error: error instanceof Error ? error.message : "Network error during validation",
    };
  }
}

export {};
