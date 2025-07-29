export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  last_active: string;
  is_online: boolean;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  is_group: boolean;
  name?: string;
  description?: string;
  avatar_url?: string;
  last_message_id?: string;
  created_at: string;
  updated_at: string;
  last_message?: Message;
  unread_count?: number;
  other_user?: User; // For 1-on-1 chats
}

export interface ChatMember {
  id: string;
  chat_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  user?: User;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'emoji';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  sender?: User;
  is_read?: boolean;
  read_by?: MessageRead[];
}

export interface MessageRead {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
  user?: User;
}

export interface TypingIndicator {
  id: string;
  chat_id: string;
  user_id: string;
  created_at: string;
  user?: User;
}

export interface OnlineStatus {
  user_id: string;
  is_online: boolean;
  last_seen: string;
}

export interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  setActiveChat: (chat: Chat | null) => void;
  sendMessage: (content: string, type?: Message['message_type']) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  uploadFile: (file: File) => Promise<string>;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}
