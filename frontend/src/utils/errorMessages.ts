/**
 * Translates HTTP status codes and error messages to user-friendly messages
 */
export function getUserFriendlyErrorMessage(statusCode: number, errorMessage?: string): string {
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
    case 0:
      // Network error (fetch failed completely)
      return 'Unable to connect to the server. Please check your internet connection and try again.';
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

