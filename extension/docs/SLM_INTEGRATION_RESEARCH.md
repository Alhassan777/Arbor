# Small Language Model Integration Research

This document outlines open-source and free small language models (SLMs) that could enhance the Arbor extension's context management workflow.

## Current State

The extension currently uses basic text processing for context management:

- **MessageProcessor.generateBriefSummary()** - Simple text extraction (first/last sentences, message counting)
- No AI/LLM processing for intelligent summarization
- Manual text truncation and formatting

## Use Cases for SLM Integration

1. **Intelligent Summarization** - Generate concise, context-aware summaries instead of simple text extraction
2. **Key Information Extraction** - Extract important topics, entities, and concepts from conversations
3. **Connection Type Suggestions** - Auto-suggest connection types based on conversation content
4. **Context Optimization** - Intelligently trim context while preserving important information
5. **Semantic Search** - Find relevant past conversations based on meaning, not just keywords

## Recommended SLM Options

### Option 1: Hugging Face Inference API (Recommended for Quick Start)

**Pros:**

- ✅ Free tier available (1000 requests/day)
- ✅ No model download required
- ✅ Easy API integration
- ✅ Multiple model options
- ✅ Works in browser extensions

**Cons:**

- ❌ Requires internet connection
- ❌ Rate limits on free tier
- ❌ Privacy concerns (data sent to external API)

**Models Available:**

- `Xenova/distilbart-cnn-12-6` - ~200MB, good for summarization (default)
- `Xenova/distilbert-base-uncased-distilled-squad` - ~100MB, smaller alternative
- `mistralai/Mistral-7B-Instruct-v0.2` - 7B parameters, good for summarization (via API)
- `google/gemma-2b-it` - 2B parameters, lightweight

**Implementation:**

```typescript
// Simple API call
const response = await fetch(
  "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
  {
    headers: { Authorization: `Bearer ${API_KEY}` },
    method: "POST",
    body: JSON.stringify({ inputs: prompt }),
  }
);
```

**Cost:** Free tier: 1000 requests/day, then $0.0002 per 1K tokens

---

### Option 2: Transformers.js (Browser-Based)

**Pros:**

- ✅ Runs entirely in browser (no API calls)
- ✅ Complete privacy (data never leaves device)
- ✅ No rate limits
- ✅ Works offline

**Cons:**

- ❌ Large model downloads (100MB - 1GB+)
- ❌ Slower inference (CPU-based)
- ❌ Limited to smaller models
- ❌ Higher memory usage

**Models Available:**

- `Xenova/LaMini-Flan-T5-783M` - 783M parameters, good for summarization
- `Xenova/distilbert-base-uncased` - 66M parameters, very fast
- `Xenova/phi-2` - 2.7B parameters (if available)

**Implementation:**

```typescript
import { pipeline } from "@xenova/transformers";

const summarizer = await pipeline(
  "summarization",
  "Xenova/LaMini-Flan-T5-783M"
);
const summary = await summarizer(conversationText, { max_length: 150 });
```

**Bundle Size:** ~100-500MB for models

---

### Option 3: Ollama (Local Server)

**Pros:**

- ✅ Runs locally (privacy)
- ✅ No API costs
- ✅ Fast inference (GPU acceleration)
- ✅ Multiple model options

**Cons:**

- ❌ Requires users to install Ollama
- ❌ Requires local server running
- ❌ Not suitable for all users

**Models Available:**

- `llama3.2:1b` - 1B parameters, very fast
- `phi3:mini` - 3.8B parameters
- `gemma2:2b` - 2B parameters
- `mistral:7b` - 7B parameters

**Implementation:**

```typescript
const response = await fetch("http://localhost:11434/api/generate", {
  method: "POST",
  body: JSON.stringify({
    model: "phi3:mini",
    prompt: conversationText,
    stream: false,
  }),
});
```

**Setup Required:** Users must install Ollama and download models

---

### Option 4: Groq API (Free Tier)

**Pros:**

- ✅ Very fast inference (LPU acceleration)
- ✅ Generous free tier
- ✅ Multiple model options
- ✅ Easy API integration

**Cons:**

- ❌ Requires internet
- ❌ Privacy concerns
- ❌ Rate limits

**Models Available:**

- `llama-3.1-8b-instant` - 8B parameters
- `mixtral-8x7b-32768` - Mixture of experts
- `gemma2-9b-it` - 9B parameters

**Free Tier:** 14,400 requests/day

**Implementation:**

```typescript
const response = await fetch(
  "https://api.groq.com/openai/v1/chat/completions",
  {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
    }),
  }
);
```

---

### Option 5: Together AI (Free Tier)

**Pros:**

- ✅ Free tier available
- ✅ Multiple open-source models
- ✅ Good performance

**Cons:**

- ❌ Requires internet
- ❌ Privacy concerns
- ❌ Rate limits

**Free Tier:** $25 free credits

---

## Model Comparison

| Model            | Size      | Speed     | Quality | Privacy | Cost                |
| ---------------- | --------- | --------- | ------- | ------- | ------------------- |
| Hugging Face API | Various   | Fast      | High    | Low     | Free tier available |
| Transformers.js  | 100MB-1GB | Slow      | Medium  | High    | Free                |
| Ollama           | Various   | Fast      | High    | High    | Free                |
| Groq API         | Various   | Very Fast | High    | Low     | Free tier available |
| Together AI      | Various   | Fast      | High    | Low     | Free credits        |

## Recommended Approach

### Phase 1: Quick Win (Hugging Face API)

- Implement Hugging Face Inference API integration
- Use `microsoft/Phi-3-mini-4k-instruct` for fast, quality summaries
- Add configuration for API key (optional, works without for some models)
- Fallback to current text-based summarization if API fails

### Phase 2: Privacy Option (Transformers.js)

- Add optional Transformers.js integration
- Use smaller model like `Xenova/LaMini-Flan-T5-783M`
- Allow users to choose between API and local processing
- Lazy-load models only when needed

### Phase 3: Advanced (Ollama Support)

- Add Ollama integration for power users
- Auto-detect if Ollama is running
- Provide setup instructions

## Implementation Strategy

1. **Create SLM Service Interface**

   ```typescript
   interface SLMService {
     summarize(messages: Message[], options: SummaryOptions): Promise<string>;
     extractKeyPoints(messages: Message[]): Promise<string[]>;
     suggestConnectionType(messages: Message[]): Promise<ConnectionType>;
   }
   ```

2. **Implement Multiple Providers**

   - `HuggingFaceSLMService`
   - `TransformersJSSLMService`
   - `OllamaSLMService`
   - `GroqSLMService`

3. **Add Configuration**

   - Settings UI to choose provider
   - API key management
   - Enable/disable SLM features

4. **Graceful Degradation**
   - Fallback to current text-based processing
   - Show loading states
   - Handle errors gracefully

## Specific Models for Context Management

### Best for Summarization

1. **Phi-3-mini** (3.8B) - Fast, good quality
2. **Mistral-7B-Instruct** - High quality, slower
3. **Gemma-2B-IT** - Lightweight, decent quality

### Best for Key Extraction

1. **TinyLlama-1.1B** - Very fast, good for simple tasks
2. **Phi-3-mini** - Better quality extraction

### Best for Browser (Transformers.js)

1. **LaMini-Flan-T5-783M** - Optimized for summarization
2. **DistilBERT** - Very fast, smaller tasks

## Next Steps

1. ✅ Research complete
2. ⏳ Create SLM service interface
3. ⏳ Implement Hugging Face API integration
4. ⏳ Add to SummaryFormatter
5. ⏳ Test and iterate
6. ⏳ Add configuration UI
7. ⏳ Document usage

## Resources

- [Hugging Face Inference API Docs](https://huggingface.co/docs/api-inference)
- [Transformers.js Docs](https://huggingface.co/docs/transformers.js)
- [Ollama Docs](https://ollama.ai/docs)
- [Groq API Docs](https://console.groq.com/docs)
- [Awesome Open Workhorse Models](https://github.com/context-labs/awesome-open-workhorse-models)
