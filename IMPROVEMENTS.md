# BranchChat Improvements & Enhancements

This document outlines all the improvements made to BranchChat for better UI/UX and functionality.

## ✅ Completed Improvements

### 1. **API Key Management** 🔑
- **Settings Modal**: Added a comprehensive settings modal for users to input their own Anthropic API key
- **Model Selection**: Users can choose between Claude models (Sonnet, Haiku, Opus)
- **Local Storage**: API keys are stored securely in browser's localStorage
- **Privacy First**: Keys are sent directly to Anthropic's servers, never stored on our backend
- **Auto-prompt**: Settings modal automatically opens if no API key is configured

**Files Changed:**
- `frontend/src/components/Settings.tsx` - New settings modal component
- `frontend/src/store/settingsStore.ts` - Zustand store with persist middleware
- `frontend/src/api/client.ts` - Updated to send API key and model in headers
- `backend/src/services/claude.ts` - Accept API key and model as parameters
- `backend/src/routes/conversation.ts` - Extract API key/model from request headers

### 2. **Toast Notifications** 📬
- **User Feedback**: Real-time toast notifications for success, error, info, and warning messages
- **Auto-dismiss**: Toasts automatically disappear after 3 seconds
- **Manual Close**: Users can manually dismiss toasts
- **Animated**: Smooth slide-up animation for better UX

**Files Changed:**
- `frontend/src/components/Toast.tsx` - Toast notification component
- `frontend/src/store/toastStore.ts` - Toast state management
- `frontend/src/index.css` - Slide-up animation keyframes

### 3. **Settings Access** ⚙️
- **Sidebar Integration**: Settings gear icon added to the graph sidebar header
- **Easy Access**: One-click access to settings from anywhere in the app

**Files Changed:**
- `frontend/src/components/GraphSidebar.tsx` - Added settings button
- `frontend/src/App.tsx` - Integrated Settings and Toast components

### 4. **Improved Error Handling** 🚨
- **Better Error Messages**: API errors now show descriptive messages
- **User-Friendly**: Errors are displayed via toast notifications instead of console logs

## 🚧 Planned Improvements

### High Priority

1. **Dark Mode Support** 🌙
   - Toggle between light and dark themes
   - Theme preference saved to localStorage
   - Consistent styling across all components

2. **Editable Conversation Titles** ✏️
   - Click on conversation title to edit inline
   - Auto-save on blur or Enter key
   - Visual feedback during editing

3. **Markdown Support for Messages** 📝
   - Render markdown in AI responses
   - Support for code blocks with syntax highlighting
   - Tables, lists, and formatting

4. **Copy Message Feature** 📋
   - Copy button on each message
   - One-click copy to clipboard
   - Toast confirmation

### Medium Priority

5. **Message Timestamps** ⏰
   - Display relative time (e.g., "2 minutes ago")
   - Full timestamp on hover
   - Formatted dates for older messages

6. **Delete Conversation** 🗑️
   - Delete button for each conversation node
   - Confirmation modal before deletion
   - Cascade delete children nodes

7. **Export Conversations** 💾
   - Export as JSON (structured data)
   - Export as Markdown (readable format)
   - Download or copy to clipboard

8. **Retry Failed Messages** 🔄
   - Retry button for failed API calls
   - Automatic retry with exponential backoff
   - Clear error indicators

### Low Priority

9. **Keyboard Shortcuts** ⌨️
   - `Ctrl/Cmd + Enter` to send message
   - `Ctrl/Cmd + K` to open settings
   - `Esc` to close modals
   - Navigation shortcuts

10. **Mobile Responsive Design** 📱
    - Collapsible sidebar by default on mobile
    - Touch-friendly button sizes
    - Optimized layout for small screens

11. **Search Conversations** 🔍
    - Search across all messages
    - Filter by conversation node
    - Highlight search results

12. **Conversation Analytics** 📊
    - Token usage tracking
    - Cost estimation
    - Message count statistics

## Technical Improvements

### State Management
- ✅ Settings persisted to localStorage using Zustand persist middleware
- ✅ Centralized state management for toasts
- ✅ API key and model selection integrated with API calls

### Security
- ✅ API keys stored only in browser localStorage
- ✅ Direct API calls to Anthropic (no backend storage of keys)
- ✅ Optional fallback to backend environment variable

### Developer Experience
- Type-safe API client with TypeScript
- Reusable Toast system for notifications
- Modular component architecture

## Implementation Notes

### For Dark Mode (Next Priority)
```typescript
// Already implemented in settingsStore.ts
theme: 'light' | 'dark'
toggleTheme: () => void

// Already added in App.tsx
useEffect(() => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [theme]);

// Next: Update all components to support dark mode classes
```

### For Markdown Support
- Install `react-markdown` and `react-syntax-highlighter`
- Create `MarkdownMessage` component
- Update `MessageBubble` to use markdown renderer

### For Export Feature
```typescript
// Export as JSON
const exportJSON = () => {
  const data = JSON.stringify(tree, null, 2);
  downloadFile(data, 'conversation.json', 'application/json');
};

// Export as Markdown
const exportMarkdown = () => {
  const markdown = generateMarkdown(tree);
  downloadFile(markdown, 'conversation.md', 'text/markdown');
};
```

## UI/UX Philosophy

- **Minimal but Powerful**: Keep the interface clean while providing advanced features
- **Keyboard First**: Support keyboard shortcuts for power users
- **Mobile Friendly**: Responsive design that works on all devices
- **Accessible**: WCAG compliant with proper ARIA labels
- **Fast Feedback**: Immediate visual feedback for all user actions

## Future Considerations

1. **User Authentication**: Save conversations to cloud
2. **Collaboration**: Share conversation trees with others
3. **Custom System Prompts**: User-defined prompts per branch
4. **Conversation Templates**: Pre-configured conversation starters
5. **AI Model Comparison**: Run same conversation with different models
6. **Version History**: Track changes to conversation nodes
7. **Rich Media**: Support for images in messages
8. **Voice Input**: Speech-to-text for messages

---

**Last Updated**: 2025-12-29
**Version**: 1.1.0
