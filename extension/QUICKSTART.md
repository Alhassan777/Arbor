# 🚀 Quick Start Guide - Test Arbor Extension in 5 Minutes

## Step 1: Build the Extension (2 minutes)

```bash
cd /home/user/Arbor/extension
npm install
npm run dev
```

**What this does:**
- Installs webpack, TypeScript, and dependencies
- Compiles TypeScript → JavaScript
- Outputs everything to `dist/` folder
- Watches for file changes

**Expected output:**
```
✔ Compiled successfully
webpack is watching the files...
```

---

## Step 2: Load in Chrome (1 minute)

1. Open Chrome/Edge/Brave
2. Go to: `chrome://extensions/`
3. Enable **"Developer mode"** (toggle top-right)
4. Click **"Load unpacked"**
5. Navigate to and select: `/home/user/Arbor/extension/dist`

**You should see:**
- ✅ Arbor extension card appears
- ✅ No errors
- ✅ Green toggle (enabled)

---

## Step 3: Test It! (2 minutes)

### Visit ChatGPT
1. Go to: https://chatgpt.com
2. You should immediately see:
   - **Left sidebar**: "🌳 AI Research Project" with demo tree
   - **Right sidebar**: "📊 Graph View" with visual nodes

### Try the Demo Features

**Left Sidebar (Tree View):**
- Click different nodes (they highlight)
- See hierarchical structure
- Notice "deepens", "applies", "explores" labels

**Right Sidebar (Graph):**
- See nodes positioned hierarchically
- Blue connection lines between parent/child
- Click nodes to select them
- Hover to see effects

**Action Buttons:**
- Click **"+ Add Chat"** → Enter a title → See it added
- Click **"Branch"** → Create a sub-conversation

---

## Iterative Development Workflow

### Making Changes

1. **Edit a file** (e.g., `src/content/content.ts`)
   ```typescript
   // Change a color
   border-left: 3px solid #ff6b6b;  // was #4a9eff
   ```

2. **Webpack auto-rebuilds** (watch the terminal)
   ```
   ✔ Compiled successfully in 234ms
   ```

3. **Reload extension**:
   - Go to `chrome://extensions/`
   - Click the reload icon 🔄 on Arbor card

4. **Refresh ChatGPT page** (F5)

5. **See your changes!**

---

## Debugging Tools

### Content Script Console
```javascript
// In src/content/content.ts
console.log('Arbor: Current tree:', this.state.currentTreeId);
```

**View logs:**
- Right-click ChatGPT page → Inspect
- Go to Console tab
- Filter by "Arbor"

### Background Script Console
- Go to `chrome://extensions/`
- Find Arbor card
- Click "service worker" link
- Console opens in new window

### Check Storage
```javascript
// In browser console
chrome.storage.local.get('arborState', (data) => {
  console.log(data);
});
```

---

## Common Issues & Fixes

### Extension not appearing?
```bash
# Rebuild
cd /home/user/Arbor/extension
npm run build

# Check dist/ folder exists
ls dist/
# Should show: content.js, background.js, manifest.json
```

### Changes not showing?
1. ✅ Check webpack is still running (`npm run dev`)
2. ✅ Reload extension on `chrome://extensions/`
3. ✅ Hard refresh page (Cmd+Shift+R or Ctrl+Shift+R)
4. ✅ Check Console for JavaScript errors

### Sidebars not injecting?
**Open DevTools Console and check for:**
```
Arbor extension background script loaded
```

**If missing:**
- Extension didn't load properly
- Try disabling/re-enabling on `chrome://extensions/`

### CSS looks broken?
- Check for JavaScript errors in Console
- Look for the `<style id="arbor-extension-styles">` tag in Elements tab
- Try rebuilding: `npm run build`

---

## What's Working Right Now

✅ **Left sidebar** - Tree view with demo data
✅ **Right sidebar** - Graph visualization
✅ **Node selection** - Click to select nodes
✅ **Hierarchical layout** - Parent/child relationships
✅ **Add chat** - Create new nodes
✅ **Create branch** - Add child nodes
✅ **Connection labels** - Shows relationship types
✅ **Platform detection** - Detects ChatGPT/Gemini/Perplexity
✅ **Persistent storage** - Uses chrome.storage.local

---

## What's Coming Next

🚧 **Real chat detection** - Detect actual ChatGPT conversations
🚧 **Context generation** - AI-powered summaries
🚧 **Export/Import** - Save and share trees
🚧 **Multi-platform** - Full Gemini + Perplexity support
🚧 **Keyboard shortcuts** - Quick navigation
🚧 **Search** - Find chats across trees

---

## Pro Tips

### Fast Feedback Loop
Keep this setup:
- **Terminal 1**: `npm run dev` (watch mode)
- **Terminal 2**: Your code editor
- **Browser**: ChatGPT + DevTools Console open
- Make change → Auto-rebuild → Reload → See it!

### Test on Multiple Platforms
```bash
# ChatGPT
https://chatgpt.com

# Gemini
https://gemini.google.com/app

# Perplexity
https://perplexity.ai
```

### Reset Everything
```javascript
// In browser console
chrome.storage.local.clear();
location.reload();
```

---

## Next Steps

1. **Test the demo** - Play with the current UI
2. **Try changing colors** - Edit CSS in content.ts
3. **Add more demo data** - Edit createDemoTree()
4. **Experiment** - Break things and learn!

**Questions?** Check the main README.md or open an issue!
