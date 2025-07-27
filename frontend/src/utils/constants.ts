/**
 * Application constants
 */

export const API_ENDPOINTS = {
  ANALYZE: '/api/sentiment/analyze',
  BATCH_ANALYZE: '/api/sentiment/batch',
  HEALTH: '/health',
  HEALTH_DETAILED: '/health/detailed',
  MODELS: '/api/sentiment/models',
  STATS: '/api/sentiment/stats'
} as const;

export const SENTIMENT_TYPES = {
  POSITIVE: 'Positive',
  NEGATIVE: 'Negative',
  NEUTRAL: 'Neutral'
} as const;

export const SENTIMENT_COLORS = {
  [SENTIMENT_TYPES.POSITIVE]: '#10B981',
  [SENTIMENT_TYPES.NEGATIVE]: '#EF4444',
  [SENTIMENT_TYPES.NEUTRAL]: '#6B7280'
} as const;

export const SENTIMENT_EMOJIS = {
  [SENTIMENT_TYPES.POSITIVE]: '😊',
  [SENTIMENT_TYPES.NEGATIVE]: '😞',
  [SENTIMENT_TYPES.NEUTRAL]: '😐'
} as const;

export const CONFIDENCE_LEVELS = {
  HIGH: { min: 0.8, label: 'High', color: '#10B981' },
  MEDIUM: { min: 0.6, label: 'Medium', color: '#F59E0B' },
  LOW: { min: 0, label: 'Low', color: '#EF4444' }
} as const;

export const VALIDATION_RULES = {
  MAX_TEXT_LENGTH: 5000,
  MIN_TEXT_LENGTH: 1,
  MAX_BATCH_SIZE: 100
} as const;

export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  HEALTH_CHECK_INTERVAL: 30000,
  RETRY_ATTEMPTS: 3,
  REQUEST_TIMEOUT: 30000
} as const;

export const EXAMPLE_TEXTS = [
  "I absolutely love this new product! It's amazing and works perfectly!",
  "This is the worst experience I've ever had. Completely disappointed.",
  "The weather is nice today. Just had lunch at a restaurant.",
  "I'm so excited about this new opportunity! Can't wait to get started!",
  "The service was okay, nothing special but it gets the job done."
] as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
} as const;

export const SUCCESS_MESSAGES = {
  ANALYSIS_COMPLETE: 'Analysis completed successfully!',
  RESULT_COPIED: 'Result copied to clipboard!',
  DATA_EXPORTED: 'Data exported successfully!'
} as const;
