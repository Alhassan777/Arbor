# CORS and Database Initialization Fixes

## Issues Fixed

### 1. CORS Error
**Problem**: Content scripts cannot directly call external APIs due to CORS policy restrictions.

**Error**: 
```
Access to fetch at 'https://api-inference.huggingface.co/models/...' from origin 'https://chatgpt.com' 
has been blocked by CORS policy
```

**Solution**: 
- Moved API calls to background script (service worker)
- Background script acts as proxy for Hugging Face API calls
- Content script sends messages to background script
- Background script makes fetch requests (no CORS restrictions)

### 2. Database Initialization Error
**Problem**: Database accessed before initialization completes.

**Error**:
```
Cannot read properties of null (reading 'transaction')
```

**Solution**:
- Added null checks in `getState()` and `saveState()` methods
- Added auto-initialization in `saveState()` if database not ready
- Delayed SLM initialization by 100ms to ensure DB is ready
- Added error handling in `SLMConfigManager.loadConfig()`

## Implementation Details

### Background Script Proxy

**File**: `src/background/background.ts`

**New Message Handlers**:
1. `huggingface-api-call` - Proxies API calls
2. `huggingface-check-availability` - Checks if API/model is available

**How it works**:
```typescript
// Content script sends message
const response = await chrome.runtime.sendMessage({
  action: 'huggingface-api-call',
  payload: { url, headers, body }
});

// Background script makes fetch (no CORS)
const data = await fetch(url, { method: 'POST', headers, body });
```

### Database Safety

**File**: `src/storage/indexeddb.ts`

**Changes**:
- `getState()`: Returns empty object if DB not initialized
- `saveState()`: Auto-initializes DB if needed
- Added null checks before accessing `this.db`

### SLM Initialization Delay

**File**: `src/content/modules/BranchContextManager.ts`

**Change**:
- Delayed SLM initialization by 100ms
- Ensures database is ready before accessing it

## Testing

After these fixes:

1. **CORS should be resolved**: API calls go through background script
2. **Database errors should be gone**: Proper initialization checks
3. **SLM should work**: If API is available, summarization should function

## Verification

Check browser console for:
- ✅ No CORS errors
- ✅ No database null errors
- ✅ "SLM service initialized and available" message (if API works)
- ✅ Or "SLM service configured but not available" (if API unavailable, but no errors)

## Notes

- Background script has `host_permissions` for Hugging Face API in manifest
- Service workers can make fetch requests to URLs in host_permissions
- Content scripts cannot, hence the proxy pattern
- Database initialization is async, so we delay SLM init to avoid race conditions
