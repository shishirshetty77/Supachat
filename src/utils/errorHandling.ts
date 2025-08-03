// Error handling utilities for Chatty application

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export class ChattyError extends Error {
  public code: string;
  public details?: any;
  public timestamp: Date;

  constructor(code: string, message: string, details?: any) {
    super(message);
    this.name = 'ChattyError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }
}

export const ERROR_CODES = {
  // Authentication errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Chat errors
  MESSAGE_TOO_LONG: 'MESSAGE_TOO_LONG',
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
} as const;

export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_REQUIRED]: 'Authentication required to access this resource',
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password',
  [ERROR_CODES.SESSION_EXPIRED]: 'Your session has expired. Please log in again',
  [ERROR_CODES.MESSAGE_TOO_LONG]: 'Message exceeds maximum length',
  [ERROR_CODES.ROOM_NOT_FOUND]: 'Chat room not found',
  [ERROR_CODES.PERMISSION_DENIED]: 'You do not have permission to perform this action',
  [ERROR_CODES.NETWORK_ERROR]: 'Network connection error. Please check your internet connection',
  [ERROR_CODES.SERVER_ERROR]: 'Internal server error. Please try again later',
  [ERROR_CODES.VALIDATION_ERROR]: 'Validation failed',
  [ERROR_CODES.REQUIRED_FIELD]: 'This field is required',
} as const;

export function createError(code: keyof typeof ERROR_CODES, details?: any): ChattyError {
  const message = ERROR_MESSAGES[code] || 'An unknown error occurred';
  return new ChattyError(code, message, details);
}

export function handleApiError(error: any): ChattyError {
  if (error instanceof ChattyError) {
    return error;
  }
  
  // Handle Supabase errors
  if (error?.code) {
    switch (error.code) {
      case 'PGRST116':
        return createError(ERROR_CODES.PERMISSION_DENIED, error);
      case 'PGRST301':
        return createError(ERROR_CODES.ROOM_NOT_FOUND, error);
      default:
        return createError(ERROR_CODES.SERVER_ERROR, error);
    }
  }
  
  // Handle network errors
  if (error?.name === 'NetworkError' || error?.code === 'NETWORK_ERROR') {
    return createError(ERROR_CODES.NETWORK_ERROR, error);
  }
  
  // Default error
  return createError(ERROR_CODES.SERVER_ERROR, error);
}

export function logError(error: AppError | ChattyError | Error): void {
  console.error('[Chatty Error]', {
    name: error instanceof Error ? error.name : 'AppError',
    message: error.message,
    code: 'code' in error ? error.code : 'UNKNOWN',
    details: 'details' in error ? error.details : undefined,
    timestamp: 'timestamp' in error ? error.timestamp : new Date(),
    stack: error instanceof Error ? error.stack : undefined,
  });
}
