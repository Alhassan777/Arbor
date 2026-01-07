# SLM Integration Usage Guide

This guide explains how to use the Small Language Model (SLM) integration in the Arbor extension for enhanced context management.

## Overview

The SLM integration enhances the extension's context management by:
- **Intelligent Summarization**: Generate AI-powered summaries instead of simple text extraction
- **Key Point Extraction**: Extract important topics and concepts
- **Connection Type Suggestions**: Auto-suggest branch connection types

## Quick Start

### Default Configuration (No Setup Required)

The extension uses a hybrid approach by default:
1. **Transformers.js** (primary): Local model, privacy-first, works offline
2. **Chrome Summarizer** (fallback): Built-in API, instant, Chrome 138+

**First Use:**
- Model downloads automatically on first use (~30-60 seconds, ~200MB)
- Cached in IndexedDB for future use
- No API keys needed

### Manual Configuration (Optional)

```typescript
// In your extension code or via settings UI
import { SLMConfigManager } from './modules/context/slm/SLMConfigManager';
   
await SLMConfigManager.saveConfig({
  provider: 'hybrid', // or 'transformers.js', 'chrome-summarizer'
  hybrid: {
    transformers: {
      model: 'Xenova/distilbart-cnn-12-6', // Default
      enabled: true
    },
    chromeSummarizer: {
      enabled: true
    }
  }
});
```

### Use in Branch Context

- The extension automatically uses SLM summarization when creating branches
- Select "summary" format type for AI-powered summaries
- Falls back gracefully: transformers.js → Chrome Summarizer → text-based

## Available Models

### Transformers.js Models (Local)

| Model | Size | Speed | Quality | Notes |
|-------|------|-------|---------|-------|
| `Xenova/distilbart-cnn-12-6` | ~200MB | ⚡ Moderate | ⭐⭐⭐⭐ | Default, good balance |
| `Xenova/distilbert-base-uncased-distilled-squad` | ~100MB | ⚡⚡ Fast | ⭐⭐⭐ | Smaller alternative |

### Chrome Summarizer (Built-in)

- **Model**: Gemini Nano (built into Chrome)
- **Context**: 1024 tokens (~4000 characters)
- **Speed**: Instant
- **Quality**: Good
- **Requires**: Chrome 138+

## Usage Examples

### Basic Usage

The SLM integration works automatically when using the "summary" format:

```typescript
import { BranchContextManager } from './modules/BranchContextManager';

const manager = new BranchContextManager('chatgpt');

// This will use SLM summarization if configured
const result = await manager.createBranchContext({
  parentTitle: 'My Conversation',
  formatType: 'summary', // Uses SLM if available
  connectionType: 'deepens'
});
```

### Manual SLM Service Usage

```typescript
import { SLMConfigManager } from './modules/context/slm/SLMConfigManager';
import type { Message } from './modules/context/ContextFormatter';

const slmService = await SLMConfigManager.getSLMService();

if (slmService) {
  // Generate summary
  const summary = await slmService.summarize(messages, {
    maxLength: 300,
    style: 'brief'
  });

  // Extract key points
  const keyPoints = await slmService.extractKeyPoints(messages);

  // Suggest connection type
  const connectionType = await slmService.suggestConnectionType(messages);
}
```

## Configuration

### Enable/Disable SLM

```typescript
// Disable SLM (use text-based processing)
await SLMConfigManager.saveConfig({
  provider: 'none'
});

// Enable Hybrid (default)
await SLMConfigManager.saveConfig({
  provider: 'hybrid',
  hybrid: {
    transformers: {
      enabled: true,
      model: 'Xenova/distilbart-cnn-12-6'
    },
    chromeSummarizer: {
      enabled: true
    }
  }
});

// Or use only transformers.js
await SLMConfigManager.saveConfig({
  provider: 'transformers.js',
  transformers: {
    enabled: true,
    model: 'Xenova/distilbart-cnn-12-6'
  }
});
```

### Change Model

```typescript
const config = await SLMConfigManager.loadConfig();
if (config.provider === 'hybrid' && config.hybrid) {
  config.hybrid.transformers!.model = 'Xenova/distilbert-base-uncased-distilled-squad';
  await SLMConfigManager.saveConfig(config);
}
```

## Error Handling

The extension gracefully handles SLM failures:

- **Transformers.js Errors**: Falls back to Chrome Summarizer, then text-based
- **Chrome Summarizer Errors**: Falls back to text-based summarization
- **Model Loading**: Model downloads and caches automatically on first use
- **Offline Mode**: Transformers.js works without internet after initial download

## Rate Limits

### Transformers.js (Local)
- ✅ **No rate limits** - Runs entirely locally
- ✅ **No API calls** - Complete privacy
- ⚠️ **Initial download**: ~200MB model on first use

### Chrome Summarizer
- ✅ **No rate limits** - Built into Chrome
- ✅ **No API calls** - Runs on-device
- ⚠️ **Context limit**: 1024 tokens (chunking handles longer conversations)

## Privacy Considerations

### Transformers.js (Default)
- ✅ **100% Local** - Models run in browser, no data sent to servers
- ✅ **Offline Support** - Works without internet after initial download
- ✅ **IndexedDB Caching** - Models cached locally for fast access
- ✅ **No API Keys** - No authentication needed

### Chrome Summarizer (Fallback)
- ✅ **On-Device** - Runs locally in Chrome
- ✅ **No External Calls** - Uses built-in Gemini Nano
- ⚠️ **Chrome Only** - Requires Chrome 138+

## Troubleshooting

### SLM Not Working

1. **Check Configuration**
   ```typescript
   const config = await SLMConfigManager.loadConfig();
   console.log(config);
   ```

2. **Check Model Download** (for transformers.js)
   - First use requires downloading model (~200MB)
   - Check IndexedDB storage quota
   - Verify "unlimitedStorage" permission in manifest

3. **Check Chrome Version** (for Chrome Summarizer)
   - Requires Chrome 138+ for built-in summarizer
   - Check browser console for availability

4. **Test Service Availability**
   ```typescript
   const service = await SLMConfigManager.getSLMService();
   if (service) {
     const available = await service.isAvailable();
     console.log('SLM available:', available);
   }
   ```

### Slow Performance

- **First Use**: Model download takes 30-60 seconds (one-time)
- **Subsequent Uses**: Model loads from cache (instant)
- Reduce summary length for faster inference
- Use Chrome Summarizer for instant results (if available)
- Check IndexedDB storage if model seems to reload each time

## Future Enhancements

- [ ] Transformers.js integration (browser-based, no API)
- [ ] Ollama integration (local processing)
- [ ] Groq API support (very fast inference)
- [ ] Caching layer for summaries
- [ ] Batch processing for multiple conversations
- [ ] Settings UI for configuration

## API Reference

See `SLM_INTEGRATION_RESEARCH.md` for detailed API documentation and model comparisons.
