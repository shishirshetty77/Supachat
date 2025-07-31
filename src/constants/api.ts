// API Constants and Configuration

export const API_ENDPOINTS = {
  // Chat endpoints
  CHAT_ROOMS: '/api/chat/rooms',
  CHAT_MESSAGES: '/api/chat/messages',
  CHAT_USERS: '/api/chat/users',
  
  // User endpoints
  USER_PROFILE: '/api/user/profile',
  USER_SETTINGS: '/api/user/settings',
  
  // Authentication endpoints
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_REGISTER: '/api/auth/register',
} as const;

export const SUPABASE_TABLES = {
  USERS: 'users',
  CHAT_ROOMS: 'chat_rooms',
  CHAT_MESSAGES: 'chat_messages',
  ROOM_PARTICIPANTS: 'room_participants',
} as const;

export const REALTIME_CHANNELS = {
  CHAT_MESSAGES: 'chat_messages',
  USER_PRESENCE: 'user_presence',
  ROOM_UPDATES: 'room_updates',
} as const;

export const DEFAULT_PAGINATION = {
  PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
} as const;

export const CHAT_LIMITS = {
  MAX_MESSAGE_LENGTH: 2000,
  MAX_ROOM_NAME_LENGTH: 100,
  MAX_PARTICIPANTS_PER_ROOM: 50,
} as const;
