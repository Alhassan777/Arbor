# Production Features

This document explains the production-ready features of Arbor extension.

## 🎯 What's Different from Demo Version?

### Demo Version (`content.ts`)
- ✅ Shows hardcoded demo tree
- ✅ Good for testing UI/layout
- ❌ No real chat detection
- ❌ No persistent storage

### Production Version (`content-production.ts`) ← **NOW ACTIVE**
- ✅ Detects real ChatGPT conversations
- ✅ Persistent storage with IndexedDB
- ✅ Automatic chat tracking
- ✅ Context generation for branching
- ✅ Real URL navigation

---

## 🚀 New Production Features

### 1. **Automatic Chat Detection**

When you visit a ChatGPT conversation, Arbor:
1. Detects the chat ID from URL
2. Extracts the chat title from the page
3. Checks if it's already tracked
4. Shows a notification: "Track this chat in Arbor?"

**Example:**
```
🌳 Track this chat in Arbor?  [Yes] [Not now]
```

Click "Yes" to add it to your current tree!

---

### 2. **IndexedDB Persistent Storage**

Your trees are now saved to **browser IndexedDB**:
- **50MB+ storage** (vs 5MB chrome.storage limit)
- Persists across browser sessions
- Fast local access
- No server needed

**Storage breakdown:**
- `trees` - Your conversation trees
- `nodes` - Individual chat nodes
- `state` - Current tree/node selection

---

### 3. **Real Chat Navigation**

Click any node in the tree or graph → **Navigates to that chat!**

No more demo URLs - actual ChatGPT links:
```
https://chatgpt.com/c/abc123def456
```

---

### 4. **Context Generation for Branching**

When you click **"Branch"**:

1. **Extracts recent messages** from current chat (last 10)
2. **Generates context prompt** including:
   - Parent conversation summary
   - Recent message history
   - Selected text (if any)
   - Relationship type (deepens, explores, etc.)
3. **Copies to clipboard** automatically
4. **Opens new chat** in ChatGPT
5. **You paste** (Ctrl+V) to continue with context!

**Example generated context:**
```
This is a continuation of our previous conversation: "Python Best Practices".

Previous conversation summary:
user: How do I handle errors in Python?
assistant: You can use try/except blocks...
user: What about logging?
assistant: Python's logging module...

I want to focus on this specific part:
"What about logging in production environments?"

Let's explore this topic in more depth.

Please continue from here.
```

---

### 5. **Smart Chat Linking**

Arbor automatically links parent-child relationships:

1. You're in chat A
2. Click "Branch"
3. Start new chat B
4. Arbor detects you navigated from A
5. **Automatically makes B a child of A!**

Your tree grows organically as you explore topics.

---

### 6. **SPA Navigation Detection**

ChatGPT is a Single-Page App (no full page reloads).

Arbor uses **MutationObserver** to detect:
- ✅ URL changes
- ✅ New chat navigation
- ✅ Back/forward button
- ✅ Sidebar chat clicks

You're always on the right node!

---

### 7. **Platform-Specific Integration**

**ChatGPT-specific features:**
- Extracts chat ID from URL pattern: `/c/[chatId]`
- Scrapes title from multiple DOM locations
- Detects when you're in a conversation vs homepage
- Gets selected text for focused branching
- Extracts all messages for context

**Coming soon:**
- Gemini integration
- Perplexity integration

---

## 📋 Usage Guide

### **First Time Setup**

1. Load extension in Chrome (`chrome://extensions/`)
2. Visit any ChatGPT conversation
3. See notification: "Track this chat in Arbor?"
4. Click "Yes"
5. ✅ Your first tree is created!

---

### **Adding More Chats**

**Method 1: Automatic**
1. Navigate to a new ChatGPT chat
2. Click "Yes" when prompted
3. ✅ Added as child of your current node

**Method 2: Manual**
1. Click a node in the tree (sets it as parent)
2. Navigate to a new chat
3. Click "Yes" when prompted
4. ✅ Linked as child of selected node

---

### **Creating Branches**

1. In an existing chat, click **"Branch"** button
2. Context is copied to clipboard
3. New chat opens in ChatGPT
4. **Paste** (Ctrl+V) the context
5. Continue your conversation!
6. When you get the tracking prompt, click "Yes"
7. ✅ Branch created with context!

---

### **Navigating Your Tree**

**Left Sidebar:**
- Click any node → Navigate to that chat
- See hierarchy: parent → children
- Active chat highlighted

**Right Sidebar (Graph):**
- Visual map of your tree
- Click nodes to navigate
- See connections between chats

---

### **Creating Multiple Trees**

1. Click **"New Tree"** button
2. Enter a name (e.g., "Work Projects", "Research", "Learning")
3. Start tracking chats in that tree
4. Switch between trees via dropdown (coming soon!)

---

## 🔧 Developer Notes

### **Architecture**

```
ArborExtensionProduction
├── IndexedDB Storage (persistent)
├── ChatGPT Platform (detection)
├── UI Injection (sidebars)
└── Context Generation (branching)
```

### **Key Files**

| File | Purpose |
|------|---------|
| `content-production.ts` | Main extension logic |
| `storage/indexeddb.ts` | Database operations |
| `platforms/chatgpt.ts` | ChatGPT integration |
| `types/index.ts` | TypeScript interfaces |

### **Data Flow**

```
ChatGPT Page Load
  ↓
Detect Chat ID
  ↓
Check if tracked (IndexedDB)
  ↓
Show prompt if new
  ↓
User clicks "Yes"
  ↓
Save to IndexedDB
  ↓
Update UI
```

---

## 🐛 Troubleshooting

### Extension not detecting chats?

**Check Console:**
```javascript
// Right-click page → Inspect → Console
// Look for:
🌳 Arbor Extension: Initializing...
✅ IndexedDB initialized
📚 Loaded X trees from storage
📄 Page ready
💬 Current chat: { chatId, title, url }
```

### IndexedDB not saving?

**Check Storage:**
```javascript
// In Console:
// Open IndexedDB in Application tab
// Look for "ArborDB" database
// Check trees, nodes, state stores
```

### Context not copying?

**Check Permissions:**
- Extension needs clipboard access
- Allow when prompted
- Or manually copy the context from alert

---

## 🎨 Customization

### Change colors:

Edit `injectStyles()` in `content-production.ts`:
```typescript
border-left-color: #4a9eff; // Blue
// Change to:
border-left-color: #10b981; // Green
```

### Change notification duration:

```typescript
setTimeout(() => {
  banner.remove();
}, 3000); // 3 seconds
```

### Change context template:

Edit `generateBranchContext()` in `platforms/chatgpt.ts`

---

## 🚀 Next Steps

**Phase 1 (Current):**
- ✅ Real chat detection
- ✅ IndexedDB storage
- ✅ Context generation
- ✅ Automatic tracking

**Phase 2 (Coming):**
- 🚧 AI-powered summarization (Gemini Flash)
- 🚧 Tree switcher dropdown
- 🚧 Export/import trees
- 🚧 Gemini & Perplexity support

**Phase 3 (Future):**
- 🔮 Cloud sync
- 🔮 Collaborative trees
- 🔮 Advanced search
- 🔮 Analytics dashboard

---

**Ready to use!** Load the extension and start organizing your AI conversations! 🌳
