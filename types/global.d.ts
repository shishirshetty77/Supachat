// Global type definitions for Chatty application

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  user_id: string;
  chat_room_id: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  participants?: User[];
}

export interface ChatSidebarProps {
  currentUserId: string;
  onRoomSelect: (roomId: string) => void;
  selectedRoomId?: string;
}

export interface UserSelectorProps {
  onUserSelect: (userId: string) => void;
  selectedUserId?: string;
  users: User[];
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
