# Branch Context Management and Retrieval Flow

This document explains how the Arbor extension manages and retrieves context when creating branches from conversations.

## Overview

When a user creates a branch from a conversation, the extension:
1. Extracts recent messages from the current chat
2. Captures any selected text
3. Generates a formatted context prompt
4. Copies it to the clipboard
5. Opens a new chat where the user can paste the context

## Flow Diagram

```
User clicks "Branch" button
    ↓
BranchConnectionTypeDialog.show()
    ↓ (User selects connection type)
createBranch(connectionType)
    ↓
BranchContextManager.createBranchContext()
    ↓
Platform.getRecentMessages(10)
    ↓
Platform.extractMessages() - Scans DOM
    ↓
Format messages as summary
    ↓
Platform.getSelectedText() - Gets selection
    ↓
Platform.generateBranchContext() - Formats prompt
    ↓
Platform.copyToClipboard() - Copies to clipboard
    ↓
Platform.openNewChat() - Opens new chat
```

## Detailed Component Breakdown

### 1. Connection Type Selection (`BranchConnectionTypeDialog`)

**Location:** `src/content/modules/BranchConnectionTypeDialog.ts`

**Purpose:** Shows a modal dialog allowing users to select how the branch relates to the parent conversation.

**Connection Types:**
- `extends` - Extend to related areas (default)
- `deepens` - Explore topic in more depth
- `explores` - Explore a related aspect
- `examples` - Look at specific examples
- `applies` - Apply in practice
- `questions` - Ask questions about this
- `contrasts` - Consider alternative perspective
- `summarizes` - Summarize and consolidate

**Usage:**
```typescript
const connectionType = await BranchConnectionTypeDialog.show("extends");
if (connectionType) {
  // Proceed with branch creation
}
```

### 2. Branch Context Manager (`BranchContextManager`)

**Location:** `src/content/modules/BranchContextManager.ts`

**Purpose:** Orchestrates the context creation process.

**Key Methods:**
- `createBranchContext(options)` - Main method that:
  - Gets recent messages
  - Gets selected text
  - Generates formatted context
  - Copies to clipboard
  - Returns success/error status

### 3. Platform Integration (`ChatGPTPlatform`)

**Location:** `src/platforms/chatgpt.ts`

**Purpose:** Platform-specific implementation for ChatGPT DOM interaction.

#### Message Extraction (`extractMessages()`)

**How it works:**
1. Finds all message elements using `document.querySelectorAll('[data-message-author-role]')`
2. For each element:
   - Extracts role from `data-message-author-role` attribute
   - Finds content in element with class containing "markdown"
   - Extracts text content
3. Returns array of `{ role: 'user' | 'assistant', content: string }`

**Example:**
```typescript
const messages = platform.extractMessages();
// Returns:
// [
//   { role: 'user', content: 'How do I implement a binary search?' },
//   { role: 'assistant', content: 'A binary search tree...' },
//   ...
// ]
```

#### Getting Recent Messages (`getRecentMessages(count)`)

**How it works:**
1. Calls `extractMessages()` to get all messages
2. Uses `.slice(-count)` to get the last N messages
3. Default count is 10 messages

#### Getting Selected Text (`getSelectedText()`)

**How it works:**
1. Uses `window.getSelection()` to get current text selection
2. Returns `selection.toString().trim()` or `null` if nothing selected
3. Useful when user wants to focus on a specific part of the conversation

#### Generating Context (`generateBranchContext(params)`)

**How it works:**
1. Takes parameters:
   - `parentTitle` - Title of parent conversation
   - `summary` - Formatted recent messages
   - `selectedText` - Optional selected text
   - `connectionType` - Type of relationship
2. Formats a context prompt:
   ```
   This is a continuation of our previous conversation: "{parentTitle}".

   Previous conversation summary:
   {summary}

   I want to focus on this specific part:
   "{selectedText}"

   {connectionType description}

   Please continue from here.
   ```

**Example Output:**
```
This is a continuation of our previous conversation: "Binary Search Trees".

Previous conversation summary:
Recent context:
user: How do I implement a binary search tree?
assistant: A binary search tree (BST) is a data structure where each node...
user: What about deletion?
assistant: Deletion in a BST is more complex. You need to handle three cases...

I want to focus on this specific part:
"three cases"

Let's explore this topic in more depth.

Please continue from here.
```

### 4. Summary Formatting

**Location:** `BranchContextManager.createBranchContext()`

**How messages are formatted:**

1. Gets recent messages (default 10)
2. Maps each message to: `${role}: ${content.substring(0, 100)}`
   - Truncates content to 100 characters
   - Prefixes with role (user/assistant)
3. Joins with newlines
4. Prefixes with "Recent context:\n"

**Example:**
```typescript
const summary = recentMessages
  .map((m) => `${m.role}: ${m.content.substring(0, 100)}`)
  .join("\n");
// Result:
// "user: How do I implement a binary search tree?\nassistant: A binary search tree (BST) is a data structure where each node..."
```

### 5. Connection Type Descriptions

**Location:** `src/platforms/chatgpt.ts` - `generateBranchContext()`

Each connection type has a human-readable description:

```typescript
const relationshipDescriptions = {
  deepens: "Let's explore this topic in more depth.",
  explores: "Let's explore a related aspect of this.",
  contrasts: "Let's consider an alternative perspective on this.",
  examples: "Let's look at specific examples of this.",
  applies: "Let's discuss how to apply this in practice.",
  questions: "I have some questions about this.",
  extends: "Let's extend this discussion to related areas.",
  summarizes: "Let's summarize and consolidate what we've discussed.",
};
```

These descriptions are inserted into the context prompt based on the selected type.

## Complete Example Flow

### User Action
1. User is in a ChatGPT conversation about "Binary Search Trees"
2. User selects text: "three cases"
3. User clicks "Branch" button in sidebar

### Extension Processing
1. **Dialog shows** - User selects "deepens" as connection type
2. **Context creation:**
   - Gets last 10 messages from DOM
   - Formats: `user: ...\nassistant: ...`
   - Gets selected text: "three cases"
   - Generates context with "deepens" description
3. **Context copied** to clipboard
4. **New chat opens** - User pastes context to continue conversation

### Generated Context
```
This is a continuation of our previous conversation: "Binary Search Trees".

Previous conversation summary:
Recent context:
user: How do I implement a binary search tree?
assistant: A binary search tree (BST) is a data structure where each node has at most two children...
user: What about deletion?
assistant: Deletion in a BST is more complex. You need to handle three cases: when the node has no children...

I want to focus on this specific part:
"three cases"

Let's explore this topic in more depth.

Please continue from here.
```

## Technical Details

### DOM Selectors

The extension relies on ChatGPT's DOM structure:

- **Message elements:** `[data-message-author-role]`
- **Message content:** `[class*="markdown"]`
- **Role attribute:** `data-message-author-role="user"` or `"assistant"`

### Clipboard API

Uses modern Clipboard API:
```typescript
await navigator.clipboard.writeText(context);
```

Falls back to showing alert if clipboard fails.

### Platform Abstraction

The system uses a `Platform` interface, allowing different implementations for:
- ChatGPT (fully implemented)
- Gemini (planned)
- Perplexity (planned)

Each platform implements:
- `extractMessages()` - DOM-specific message extraction
- `getSelectedText()` - Text selection handling
- `generateBranchContext()` - Context formatting
- `copyToClipboard()` - Clipboard operations
- `openNewChat()` - Navigation

## Future Enhancements

1. **AI-generated summaries** - Instead of raw message dump, generate concise summaries
2. **Context length optimization** - Intelligently trim context to fit token limits
3. **Multi-platform support** - Implement for Gemini, Perplexity
4. **Context preview** - Show user what will be copied before proceeding
5. **Custom connection types** - Allow users to define custom relationship types
