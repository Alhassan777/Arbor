// Background service worker for Arbor extension

console.log('Arbor extension background script loaded');

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Arbor extension installed:', details.reason);

  if (details.reason === 'install') {
    // First time installation
    console.log('Welcome to Arbor! 🌳');
  } else if (details.reason === 'update') {
    // Extension updated
    console.log('Arbor extension updated');
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);

  if (request.action === 'generateSummary') {
    // TODO: Call AI API to generate summary
    sendResponse({ summary: 'Summary will be generated here' });
  }

  return true; // Keep message channel open for async response
});

export {};
