# Arbor Extension - Usage Guide

## 🎯 Getting Started

### 1. Install the Extension

1. Build the extension: `npm install && npm run build`
2. Open Chrome: `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select `extension/dist` folder

### 2. Visit ChatGPT

Go to https://chatgpt.com and start or open a conversation.

### 3. Track Your First Chat

You'll see a notification:
```
🌳 Track this chat in Arbor?  [Yes] [Not now]
```

Click **"Yes"** to create your first tree!

---

## 📖 Core Workflows

### **Organizing a Single Conversation**

1. Start a chat in ChatGPT
2. Click "Yes" when prompted
3. ✅ Chat is tracked in Arbor

**Left sidebar** shows:
```
🌳 My First Tree
  🤖 Your Chat Title
```

---

### **Creating a Branch (Deep Dive)**

You're in a chat about "Python Basics" and want to explore "Error Handling" in depth:

1. In the current chat, click **"Branch"** button
2. Arbor:
   - Extracts last 10 messages for context
   - Generates a context prompt
   - Copies it to clipboard
   - Opens new ChatGPT chat
3. **Paste** (Ctrl+V) the context
4. Continue your conversation about error handling
5. When prompted, click "Yes" to track
6. ✅ New branch created!

**Your tree now looks like:**
```
🌳 Python Learning
  🤖 Python Basics (root)
    └── 🤖 Error Handling Deep Dive (branch)
```

---

### **Creating a Branch with Selected Text**

Want to branch on a specific part of the conversation?

1. **Highlight/select** text in the chat
2. Click **"Branch"** button
3. Arbor includes the selected text in context:
   ```
   I want to focus on this specific part:
   "What about logging in production environments?"
   ```
4. Paste in new chat
5. Track when prompted
6. ✅ Focused branch created!

---

### **Navigating Your Tree**

**Left Sidebar (Tree View):**
- Click any node → Opens that chat
- See parent-child hierarchy
- Active chat is highlighted

**Right Sidebar (Graph View):**
- Visual representation of your tree
- Click nodes to navigate
- See connections between chats

---

### **Creating Multiple Trees**

Organize different projects/topics:

1. Click **"New Tree"** button
2. Enter name: "Work Projects"
3. ✅ New tree created
4. Start tracking chats in this tree

**Switch between trees:** (coming soon - dropdown selector)

---

## 🎨 Advanced Use Cases

### **Research Tree**

```
🌳 AI Research
  🤖 What is Machine Learning? (root)
    ├── 🤖 Supervised Learning (deepens)
    │   ├── 🤖 Decision Trees (explores)
    │   └── 🤖 Neural Networks (explores)
    ├── 🤖 Unsupervised Learning (contrasts)
    └── 🤖 Real-world Applications (applies)
```

**How to build:**
1. Start with broad question: "What is Machine Learning?"
2. Branch on "Supervised Learning"
3. From there, branch on specific algorithms
4. Repeat for other categories

---

### **Problem-Solving Tree**

```
🌳 Debug Database Issue
  🤖 Database slow queries (root)
    ├── 🤖 Check indexes (explores)
    │   └── 🤖 Add composite index solution (applies)
    ├── 🤖 Analyze query plans (explores)
    └── 🤖 Connection pooling (questions)
```

---

### **Learning Tree**

```
🌳 Learn React
  🤖 React Basics (root)
    ├── 🤖 Components & Props (deepens)
    │   ├── 🤖 Function vs Class components (contrasts)
    │   └── 🤖 Build Todo App component (examples)
    ├── 🤖 Hooks (deepens)
    └── 🤖 State Management (extends)
```

---

## ⌨️ Keyboard Shortcuts

**Coming soon:**
- `Ctrl+Shift+B` - Create branch
- `Ctrl+Shift+N` - New tree
- `Ctrl+Shift+S` - Toggle sidebars
- `Ctrl+Shift+F` - Search trees

---

## 💡 Pro Tips

### **Tip 1: Use Connection Labels**

When branching, think about the relationship:
- **Deepens** - Going deeper into same topic
- **Explores** - Related but different angle
- **Contrasts** - Alternative viewpoint
- **Examples** - Concrete examples
- **Applies** - Practical application
- **Questions** - Follow-up questions

### **Tip 2: Keep Root Conversations Broad**

Start with general topics, branch into specifics:
```
✅ Good:
   "Python Programming" → "Error Handling" → "Try/Except Best Practices"

❌ Too specific from start:
   "Try/Except Best Practices" (nowhere to branch from!)
```

### **Tip 3: Use Selected Text for Precision**

When a conversation covers multiple topics:
1. Highlight the specific part you want to explore
2. Click "Branch"
3. The context will emphasize that selection

### **Tip 4: Regular Cleanup**

Periodically review your trees:
- Remove dead branches (chats you no longer need)
- Merge similar branches
- Export important trees for backup

---

## 🔧 Customization

### **Change Sidebar Position**

Edit `content-production.ts`:
```typescript
// Move left sidebar to right
#arbor-sidebar-container {
  left: 0;  // Change to: right: 0;
  ...
}
```

### **Change Colors**

```typescript
// Tree node highlight color
border-left-color: #4a9eff;  // Blue
// Change to your preference:
border-left-color: #10b981;  // Green
border-left-color: #f59e0b;  // Orange
```

### **Change Context Template**

Edit `platforms/chatgpt.ts` → `generateBranchContext()`:
```typescript
let context = `[Your custom template here]`;
```

---

## 🐛 Troubleshooting

### **Q: Extension not detecting my chat?**

**A:** Check Console (F12):
- Look for: `💬 Current chat: { chatId, title, url }`
- If missing, the chat might not have loaded yet
- Try refreshing the page

### **Q: "Track this chat" prompt not showing?**

**A:** The chat is probably already tracked!
- Check left sidebar
- Or check console: `✅ Chat already tracked: [title]`

### **Q: Context not copying to clipboard?**

**A:** Browser might block clipboard access:
- Allow clipboard permission when prompted
- Or manually copy from the alert that appears

### **Q: Can't see my trees?**

**A:** Check IndexedDB:
- F12 → Application tab → IndexedDB → ArborDB
- Check `trees`, `nodes`, `state` stores
- If empty, create a new tree

### **Q: Sidebars overlapping content?**

**A:** ChatGPT's layout changed:
- Adjust margin in `adjustMainContent()` method
- Or hide one sidebar with toggle buttons

---

## 📊 Data Management

### **Export Tree (Coming Soon)**

```javascript
// Manual export via console:
const tree = await db.getTree('your-tree-id');
console.log(JSON.stringify(tree, null, 2));
// Copy and save to file
```

### **Import Tree (Coming Soon)**

```javascript
// Manual import via console:
const tree = { /* paste your tree JSON */ };
await db.saveTree(tree);
location.reload();
```

### **Clear All Data**

```javascript
// In console:
indexedDB.deleteDatabase('ArborDB');
location.reload();
```

---

## 🎓 Example Workflows

### **Workflow 1: Research Paper**

1. Start: "Explain quantum computing"
2. Branch: "Quantum algorithms" (deepens)
3. Branch: "Shor's algorithm example" (examples)
4. Branch: "Practical applications" (applies)
5. Result: Complete research tree!

### **Workflow 2: Code Review**

1. Start: Paste code → "Review this code"
2. Branch: "Explain line 15-20" (questions)
3. Branch: "Alternative approach" (contrasts)
4. Branch: "Implement suggestion" (applies)
5. Result: Complete code improvement path!

### **Workflow 3: Learning Path**

1. Start: "I want to learn [topic]"
2. Branch on each subtopic
3. Branch on practice examples
4. Branch on challenges encountered
5. Result: Complete learning journey!

---

## 🚀 Next Steps

1. **Use it daily** - Track your important conversations
2. **Experiment** - Try different tree structures
3. **Share** - Export and share trees with colleagues
4. **Feedback** - Report issues and suggest features

**Happy organizing!** 🌳
