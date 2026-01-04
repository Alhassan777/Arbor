/**
 * Simple test script to verify error message utility function
 * Run with: node test-error-handling.mjs
 */

// Simulated error message function (copy from utils/errorMessages.ts)
function getUserFriendlyErrorMessage(statusCode, errorMessage) {
  // Check if error message contains specific API-related errors
  if (errorMessage) {
    const lowerError = errorMessage.toLowerCase();
    
    // API key errors
    if (lowerError.includes('api key') || lowerError.includes('api_key') || lowerError.includes('gemini_api_key')) {
      return 'There was an issue with the API key. Please check your API key settings and make sure it\'s valid.';
    }
    
    // Rate limit errors
    if (lowerError.includes('rate limit') || lowerError.includes('quota') || lowerError.includes('429')) {
      return 'You\'ve made too many requests. Please wait a moment and try again.';
    }
    
    // Network errors
    if (lowerError.includes('network') || lowerError.includes('fetch') || lowerError.includes('connection')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }
    
    // Timeout errors
    if (lowerError.includes('timeout')) {
      return 'The request took too long. Please try again.';
    }
  }
  
  // Map status codes to user-friendly messages
  switch (statusCode) {
    case 400:
      return 'Your request was invalid. Please check your message and try again.';
    case 401:
      return 'Authentication failed. Please check your API key settings.';
    case 403:
      return 'You don\'t have permission to perform this action. Please check your API key settings.';
    case 404:
      return 'The conversation could not be found. Please refresh and try again.';
    case 429:
      return 'You\'ve made too many requests. Please wait a moment and try again.';
    case 500:
      return 'An internal server error occurred. Please try again later.';
    case 502:
      return 'The server is temporarily unavailable. Please try again in a moment.';
    case 503:
      return 'The service is temporarily unavailable. Please try again later.';
    case 504:
      return 'The request timed out. Please try again.';
    default:
      return errorMessage || 'Something went wrong. Please try again.';
  }
}

// Test cases
const testCases = [
  { statusCode: 400, errorMessage: undefined, expected: 'Your request was invalid. Please check your message and try again.' },
  { statusCode: 404, errorMessage: undefined, expected: 'The conversation could not be found. Please refresh and try again.' },
  { statusCode: 429, errorMessage: undefined, expected: 'You\'ve made too many requests. Please wait a moment and try again.' },
  { statusCode: 500, errorMessage: undefined, expected: 'An internal server error occurred. Please try again later.' },
  { statusCode: 401, errorMessage: undefined, expected: 'Authentication failed. Please check your API key settings.' },
  { statusCode: 503, errorMessage: undefined, expected: 'The service is temporarily unavailable. Please try again later.' },
  { statusCode: 429, errorMessage: 'Rate limit exceeded', expected: 'You\'ve made too many requests. Please wait a moment and try again.' },
  { statusCode: 500, errorMessage: 'API key is invalid', expected: 'There was an issue with the API key. Please check your API key settings and make sure it\'s valid.' },
  { statusCode: 500, errorMessage: 'Network error', expected: 'Unable to connect to the server. Please check your internet connection and try again.' },
  { statusCode: 500, errorMessage: 'Request timeout', expected: 'The request took too long. Please try again.' },
  { statusCode: 999, errorMessage: 'Custom error', expected: 'Custom error' },
  { statusCode: 999, errorMessage: undefined, expected: 'Something went wrong. Please try again.' },
];

console.log('Testing error message utility function...\n');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = getUserFriendlyErrorMessage(testCase.statusCode, testCase.errorMessage);
  const success = result === testCase.expected;
  
  if (success) {
    passed++;
    console.log(`✓ Test ${index + 1}: PASSED`);
  } else {
    failed++;
    console.log(`✗ Test ${index + 1}: FAILED`);
    console.log(`  Status: ${testCase.statusCode}, Error: ${testCase.errorMessage || 'none'}`);
    console.log(`  Expected: ${testCase.expected}`);
    console.log(`  Got: ${result}`);
  }
});

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(50)}\n`);

if (failed === 0) {
  console.log('✅ All tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed');
  process.exit(1);
}

