// Validation utilities for Chatty application

import { CHAT_LIMITS } from '../constants/api';
import { createError, ERROR_CODES } from './errorHandling';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface UserValidationData {
  email?: string;
  name?: string;
  password?: string;
}

export interface ChatValidationData {
  message?: string;
  roomName?: string;
}

// Email validation
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
}

// Password validation
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length === 0) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' };
  }
  
  return { isValid: true };
}

// Name validation
export function validateName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, error: 'Name must be less than 50 characters' };
  }
  
  return { isValid: true };
}

// Message validation
export function validateMessage(message: string): ValidationResult {
  if (!message || message.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }
  
  if (message.length > CHAT_LIMITS.MAX_MESSAGE_LENGTH) {
    return { isValid: false, error: `Message must be less than ${CHAT_LIMITS.MAX_MESSAGE_LENGTH} characters` };
  }
  
  return { isValid: true };
}

// Room name validation
export function validateRoomName(roomName: string): ValidationResult {
  if (!roomName || roomName.trim().length === 0) {
    return { isValid: false, error: 'Room name is required' };
  }
  
  if (roomName.trim().length < 3) {
    return { isValid: false, error: 'Room name must be at least 3 characters long' };
  }
  
  if (roomName.length > CHAT_LIMITS.MAX_ROOM_NAME_LENGTH) {
    return { isValid: false, error: `Room name must be less than ${CHAT_LIMITS.MAX_ROOM_NAME_LENGTH} characters` };
  }
  
  return { isValid: true };
}

// Comprehensive user validation
export function validateUser(userData: UserValidationData): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  if (userData.email !== undefined) {
    results.push(validateEmail(userData.email));
  }
  
  if (userData.name !== undefined) {
    results.push(validateName(userData.name));
  }
  
  if (userData.password !== undefined) {
    results.push(validatePassword(userData.password));
  }
  
  return results;
}

// Comprehensive chat validation
export function validateChat(chatData: ChatValidationData): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  if (chatData.message !== undefined) {
    results.push(validateMessage(chatData.message));
  }
  
  if (chatData.roomName !== undefined) {
    results.push(validateRoomName(chatData.roomName));
  }
  
  return results;
}

// Utility function to check if all validations passed
export function allValidationsPassed(results: ValidationResult[]): boolean {
  return results.every(result => result.isValid);
}

// Utility function to get first validation error
export function getFirstValidationError(results: ValidationResult[]): string | null {
  const failedResult = results.find(result => !result.isValid);
  return failedResult?.error || null;
}
