# Arbor Browser Extension

Organize your AI chats hierarchically across ChatGPT, Gemini, and Perplexity.

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

### 3. Test It!

1. Visit **ChatGPT**: https://chatgpt.com
2. You should see:
   - **Left sidebar**: Tree view of chats
   - **Right sidebar**: Graph visualization
3. Try clicking:
   - **"Add Chat"** button
   - **Tree nodes** to navigate
   - **Graph nodes** to see connections

### 4. Iterative Development

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

### 5. Debugging

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
│   │   ├── content.ts      # Main sidebar injection
│   │   └── sidebar.html    # Sidebar HTML/CSS
│   ├── background/
│   │   └── background.ts   # Service worker
│   └── types/
│       └── index.ts        # TypeScript types
├── dist/                   # Built files (load this in browser)
├── package.json
├── webpack.config.js
└── tsconfig.json
```

## 🎨 Current Features (Demo)

- ✅ Left sidebar with tree view
- ✅ Right sidebar with graph visualization
- ✅ Demo data showing hierarchical structure
- ✅ Click nodes to navigate
- ✅ Add new chats
- ✅ Create branches
- ✅ Platform detection (ChatGPT/Gemini/Perplexity)

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

## 📝 Next Steps

1. **Connect to real chats**: Detect actual ChatGPT conversations
2. **Context generation**: Implement AI summarization
3. **IndexedDB storage**: Replace demo data with persistent storage
4. **Multi-platform**: Test on Gemini and Perplexity
5. **Export/Import**: Save and share trees
