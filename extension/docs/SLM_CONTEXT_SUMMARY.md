# SLM Context Summary - User Information

## What Gets Sent to the API

### When "Summary" Format is Selected

**Messages Sent:**

- **Default: Last 6 messages** from the current conversation
- **Configurable**: Users can increase to 1-50 messages in the dialog
- **Auto-Limited**: Automatically reduced if exceeds context window
- Both user and assistant messages
- Only valid messages (non-empty, with proper role)

**Message Format:**

```
User: [message content]

Assistant: [message content]

User: [message content]
...
```

**API Details:**

- **Model**: DistilBART (transformers.js, local) with Chrome Summarizer fallback
- **Input Context Limit**: Varies (transformers.js: higher, Chrome: 1024 tokens)
- **Safe Limit**: 3,500 tokens (prevents overflow)
- **Output Limit**: 200 tokens (~150 words)
- **Default**: 6 messages (~900 tokens estimated)
- **Estimated Capacity**: ~20-30 messages (depending on length)

### Context Limits

**Important Features:**

1. **Default Limiting**: Only last 6 messages sent by default
2. **User Configuration**: Can increase to 1-50 messages in dialog
3. **Auto-Limiting**: Automatically reduces if exceeds 3,500 tokens
4. **Token Estimation**: Estimates tokens before sending
5. **User Notifications**: Warns when truncation occurs
6. **Context Window**: 4,000 tokens maximum input
7. **Safe Limit**: 3,500 tokens (prevents overflow)
8. **Output Limit**: 200 tokens maximum output

### User Warnings

The extension now shows context limit warnings in the branch creation dialog:

**When "Summary" format is selected:**

- Warning box appears with:
  - Information that last 6 messages are sent by default
  - Model context limits (varies by service)
  - Output limits (200 tokens)
  - Auto-limiting behavior explanation
- Message count input appears:
  - Default: 6 messages
  - Range: 1-50 messages
  - Real-time token estimation
  - Warning if exceeds safe limit

**Recommendations Shown:**

- Use "Message Length" truncation options for long conversations
- Consider "Hybrid" or "Conversation" formats for very long chats
- Be aware that exceeding context limits will cause fallback to text-based summarization

## Configuration Options

Users can control context size through:

1. **Message Length Options:**

   - Full messages (no truncation) - default
   - 500 characters per message
   - 200 characters per message
   - 100 characters per message

2. **Format Type:**

   - **Summary**: AI-powered (default: 6 messages, configurable 1-50)
   - **Hybrid**: Brief summary + last few pairs (limited messages)
   - **Conversation**: Full format (limited messages)

3. **Message Count (Summary Format Only):**
   - Default: 6 messages
   - Range: 1-50 messages
   - Real-time token estimation
   - Auto-limiting if exceeds context window

## Best Practices

1. **Short Conversations (< 6 messages)**: Use "Summary" with default 6 messages
2. **Medium Conversations (6-20 messages)**: Use "Summary" and increase message count to 10-15
3. **Long Conversations (20-50 messages)**: Use "Summary" with message count 15-30 (will auto-limit if needed)
4. **Very Long Conversations (> 50 messages)**: Use "Hybrid" or "Conversation" format, or increase message count (auto-limiting will apply)
5. **Very Long Single Messages**: System will auto-limit to fit context window

## Automatic Fallback

If the API call fails due to context limits or other errors:

- System automatically falls back to text-based summarization
- User experience is not interrupted
- No error messages shown to user
