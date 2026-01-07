# SLM Context Details - What Gets Sent to the API

This document explains exactly what data is sent to the SLM API when using AI-powered summarization.

## Summary Format - What Gets Sent

### Message Processing

1. **Default: Last 6 Messages**: By default, only the last 6 messages are sent (sliding window approach)
2. **User Configurable**: Users can increase message count (1-50) in the branch dialog
3. **Auto-Limiting**: Messages are automatically limited if they exceed the context window
4. **Filtered**: Only valid messages (user/assistant with content) are kept
5. **Formatted**: Messages are formatted as:

   ```
   User: [message content]

   Assistant: [message content]

   User: [message content]
   ...
   ```

### API Call Details

**When "Summary" format is selected:**

- **Input**: Last 6 messages by default (configurable up to 50)
- **Auto-Limiting**: Automatically reduces message count if exceeds 3,500 tokens
- **Token Estimation**: Estimates tokens before sending to prevent overflow
- **Prompt**: `"Write a brief summary of this conversation in 400 words or less:\n\n[formatted conversation]"`
- **Model**: `Xenova/distilbart-cnn-12-6` (default, local via transformers.js)
- **Fallback**: Chrome Summarizer API (Chrome 138+, 1024 token limit)
- **Context Window**: Varies by service (transformers.js: higher, Chrome: 1024 tokens)
- **Safe Limit**: 3,500 tokens (leaves room for prompt and response)
- **Output Limit**: 200 tokens (~150 words)

### Context Limits

**Transformers.js (DistilBART):**

- **Input Context**: Higher limit (model-dependent)
- **Output Limit**: 200 tokens (~150 words)
- **Privacy**: 100% local, works offline

**Chrome Summarizer (Fallback):**

- **Input Context**: 1024 tokens (~4000 characters)
- **Output Limit**: Varies
- **Chunking**: Automatic for longer conversations

**Important Notes:**

- If conversation exceeds context window, the API may truncate or fail
- No automatic message limiting is applied - ALL messages are sent
- Users should be aware of context limits when using long conversations

### What Type of Messages

**Included:**

- All user messages
- All assistant messages
- Messages with any content (even if short)

**Excluded:**

- Empty messages
- Messages without role
- Invalid message formats

### Example API Payload

```json
{
  "inputs": "Write a brief summary of this conversation in 400 words or less:\n\nUser: How do I implement a binary search tree?\n\nAssistant: A binary search tree (BST) is a data structure...\n\nUser: What about deletion?\n\nAssistant: Deletion in a BST is more complex...",
  "parameters": {
    "max_new_tokens": 200,
    "temperature": 0.7,
    "return_full_text": false
  }
}
```

## Recommendations

1. **For Long Conversations**: Consider using "Hybrid" or "Conversation" format instead
2. **Message Truncation**: Use "Message Length" options to limit per-message size
3. **Context Awareness**: Be aware that very long conversations may exceed model limits
4. **Fallback**: System automatically falls back to text-based summarization if API fails

## Future Improvements

- Add automatic message limiting based on token count
- Estimate token usage before sending
- Warn users when conversation exceeds context window
- Implement smart truncation (keep most recent + important messages)
