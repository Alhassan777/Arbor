# Arbor Browser Extension

Organize your AI chats hierarchically across ChatGPT, Gemini, and Perplexity.

**🎉 NOW PRODUCTION-READY!**
- ✅ Real chat detection
- ✅ Persistent IndexedDB storage
- ✅ Automatic tracking
- ✅ Context generation for branching with Gemini 2.0 Flash-Lite
- ✅ Secure API key management (BYOK - Bring Your Own Key)

## 🚀 Quick Start - Testing the Extension

### 1. Build the Extension

```bash
cd extension
npm install
npm run dev
```

This will:
- Compile TypeScript to JavaScript
- Copy files to `dist/` folder
- Watch for changes (auto-rebuild)

### 2. Load in Chrome/Edge/Brave

1. Open your browser
2. Go to `chrome://extensions/` (or `edge://extensions/` or `brave://extensions/`)
3. Enable **Developer mode** (toggle in top-right)
4. Click **"Load unpacked"**
5. Select the `extension/dist` folder

### 3. Set Up Your Gemini API Key

Arbor uses **Gemini 2.0 Flash-Lite** for intelligent context summarization when creating branches. You need to provide your own API key:

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey) or [Google Cloud Console](https://console.cloud.google.com/)
2. Open the extension options:
   - Right-click the Arbor extension icon → **Options**, OR
   - Go to `chrome://extensions/` → Find Arbor → Click **Options**
3. Paste your API key in the settings page
4. Click **"Save"** to validate and store your key securely
5. Your key is encrypted and stored locally on your device

**Security Note**: Your API key stays on your device and is only sent to Google's Gemini API. It's never transmitted to any other server.

### 4. Test It!

1. Visit **ChatGPT**: https://chatgpt.com
2. You should see:
   - **Left sidebar**: Tree view of chats
   - **Right sidebar**: Graph visualization
3. Try clicking:
   - **"Add Chat"** button
   - **Tree nodes** to navigate
   - **Graph nodes** to see connections
   - **"Create Branch"** button to test context generation

### 5. Iterative Development

**Watch mode is running** (`npm run dev`), so:

1. Make changes to any `.ts` file
2. Webpack auto-rebuilds to `dist/`
3. Go to `chrome://extensions/`
4. Click the **reload icon** on Arbor extension
5. Refresh the ChatGPT page
6. See your changes!

**Faster workflow:**
- Keep Chrome DevTools open (`F12`)
- Check Console for errors
- Use `console.log()` liberally

### 6. Debugging

**Content Script (sidebar):**
- Right-click on page → Inspect
- Console shows logs from `content.ts`

**Background Script:**
- Go to `chrome://extensions/`
- Click "Service Worker" under Arbor
- Separate DevTools opens for background script

**Popup (if you add one):**
- Click extension icon
- Right-click popup → Inspect

## 📁 Project Structure

```
extension/
├── manifest.json           # Extension configuration
├── src/
│   ├── content/
│   │   ├── content-production.ts    # Main sidebar injection
│   │   ├── sidebar.html             # Sidebar HTML/CSS
│   │   └── modules/
│   │       ├── context/
│   │       │   └── llm/            # LLM service layer
│   │       │       ├── GeminiLLMService.ts  # Gemini 2.0 Flash-Lite integration
│   │       │       └── LLMService.ts        # LLM interface
│   │       └── BranchContextManager.ts      # Branch context generation
│   ├── background/
│   │   └── background.ts   # Service worker (API proxy)
│   ├── options/
│   │   ├── options.html    # Settings page
│   │   ├── options.ts      # Settings logic
│   │   └── options.css     # Settings styles
│   ├── storage/
│   │   └── apiKeyStorage.ts # Secure API key storage
│   └── types/
│       └── index.ts        # TypeScript types
├── dist/                   # Built files (load this in browser)
├── package.json
├── webpack.config.js
└── tsconfig.json
```

## 🎨 Production Features

- ✅ **Real chat detection** - Automatically detects ChatGPT conversations
- ✅ **IndexedDB storage** - Persistent storage (50MB+)
- ✅ **Automatic tracking** - Shows prompt: "Track this chat in Arbor?"
- ✅ **AI-powered context generation** - Uses Gemini 2.0 Flash-Lite for intelligent summarization
- ✅ **Tree navigation** - Click nodes to open chats
- ✅ **Graph visualization** - See your conversation hierarchy
- ✅ **Smart linking** - Auto-link parent-child relationships
- ✅ **SPA detection** - Tracks navigation in single-page apps
- ✅ **Secure API key management** - Encrypted local storage (BYOK)
- ✅ **Custom connection types** - Define your own branch relationships
- ✅ **Custom summarization prompts** - Tailor AI summaries to your needs

## 🤖 LLM Architecture

Arbor uses **Google Gemini 2.0 Flash-Lite** for context summarization when creating branches:

- **Model**: `gemini-2.0-flash-exp` (experimental, fast and efficient)
- **Context Window**: 100,000 tokens
- **Use Cases**:
  - Summarizing conversations for branch context
  - Extracting key points from conversations
  - Suggesting connection types between branches
- **Privacy**: API calls go directly from your browser to Google's API - no proxy servers
- **Cost**: Uses your own API key - you control billing and usage

### How It Works

1. User creates a branch from a conversation
2. Extension extracts recent messages from the chat
3. Messages are formatted and sent to Gemini API via background script
4. Gemini generates a concise summary (or uses custom prompt)
5. Summary is copied to clipboard and ready to paste in new chat

## 🔨 Development Commands

```bash
# Install dependencies
npm install

# Development mode (watch for changes)
npm run dev

# One-time build
npm run build

# Production build (minified)
npm run build:prod
```

## 🐛 Troubleshooting

**Extension not showing?**
- Check `chrome://extensions/` for errors
- Make sure `dist/` folder exists
- Try `npm run build` again

**Changes not appearing?**
- Click reload icon on `chrome://extensions/`
- Refresh the ChatGPT page
- Check if `npm run dev` is still running

**Sidebar not injecting?**
- Open DevTools Console
- Look for "Arbor extension" logs
- Check for JavaScript errors

**CSS not loading?**
- The CSS is inline in content.ts
- Check for syntax errors in the styles

## 🔒 Security & Privacy

- **API Key Storage**: Encrypted at rest using Web Crypto API (AES-GCM)
- **Local-Only**: API keys never leave your device except to authenticate with Google's API
- **No Tracking**: Extension doesn't send usage data to external servers
- **Open Source**: Codebase is transparent and auditable

## 📝 API Key Setup Guide

### Getting Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated key (starts with `AIza...`)

### Recommended API Key Restrictions

For security, restrict your API key in Google Cloud Console:
- **Application restrictions**: Restrict to Chrome extensions (optional)
- **API restrictions**: Limit to "Generative Language API" only
- **Monitor usage**: Set up billing alerts in Google Cloud

### Managing Your API Key

- **View/Edit**: Right-click extension icon → Options
- **Remove**: Click "Remove Key" button in options
- **Replace**: Enter new key and save (replaces old one)
- **Rotate**: If compromised, revoke in Google Cloud and create new one
