'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Chat, Message, ChatContextType, User, TypingIndicator } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);

  // Fetch user's chats
  const fetchChats = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_user_chats', {
        user_id: user.id,
      });

      if (error) throw error;

      const formattedChats: Chat[] = data.map((chat: any) => ({
        id: chat.chat_id,
        name: chat.is_group ? chat.chat_name : chat.other_user_username,
        description: chat.chat_description,
        avatar_url: chat.is_group ? chat.chat_avatar_url : chat.other_user_avatar_url,
        is_group: chat.is_group,
        created_at: chat.created_at,
        updated_at: chat.updated_at,
        unread_count: parseInt(chat.unread_count),
        last_message: chat.last_message_content
          ? {
              id: '',
              chat_id: chat.chat_id,
              sender_id: '',
              content: chat.last_message_content,
              message_type: 'text',
              is_edited: false,
              created_at: chat.last_message_created_at,
              updated_at: chat.last_message_created_at,
              sender: { username: chat.last_message_sender_username } as User,
            }
          : undefined,
        other_user: chat.is_group
          ? undefined
          : {
              id: chat.other_user_id,
              username: chat.other_user_username,
              avatar_url: chat.other_user_avatar_url,
              is_online: chat.other_user_is_online,
            } as User,
      }));

      setChats(formattedChats);
    } catch (error: any) {
      console.error('Error fetching chats:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch messages for active chat
  const fetchMessages = useCallback(async (chatId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(
            id,
            username,
            avatar_url
          ),
          read_by:message_reads(
            id,
            user_id,
            read_at,
            user:users!message_reads_user_id_fkey(
              id,
              username,
              avatar_url
            )
          )
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      const unreadIds = data
        ?.filter((msg) => 
          msg.sender_id !== user.id && 
          !msg.read_by?.some((read: any) => read.user_id === user.id)
        )
        .map((msg) => msg.id) || [];

      if (unreadIds.length > 0) {
        await Promise.all(
          unreadIds.map((messageId) =>
            supabase.from('message_reads').insert({
              message_id: messageId,
              user_id: user.id,
            })
          )
        );
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      setError(error.message);
    }
  }, [user]);

  // Send a message
  const sendMessage = useCallback(
    async (content: string, type: Message['message_type'] = 'text') => {
      if (!user || !activeChat) return;

      try {
        const { error } = await supabase.from('messages').insert({
          chat_id: activeChat.id,
          sender_id: user.id,
          content,
          message_type: type,
        });

        if (error) throw error;
      } catch (error: any) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
        throw error;
      }
    },
    [user, activeChat]
  );

  // Mark message as read
  const markAsRead = useCallback(
    async (messageId: string) => {
      if (!user) return;

      try {
        await supabase.from('message_reads').insert({
          message_id: messageId,
          user_id: user.id,
        });
      } catch (error: any) {
        console.error('Error marking message as read:', error);
      }
    },
    [user]
  );

  // Upload file to Supabase Storage
  const uploadFile = useCallback(async (file: File): Promise<string> => {
    if (!user || !activeChat) throw new Error('User or active chat not found');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `chat-files/${activeChat.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      throw error;
    }
  }, [user, activeChat]);

  // Handle typing indicators
  const handleTyping = useCallback(async () => {
    if (!user || !activeChat) return;

    try {
      await supabase.from('typing_indicators').upsert({
        chat_id: activeChat.id,
        user_id: user.id,
      });

      // Remove typing indicator after 3 seconds
      setTimeout(async () => {
        await supabase
          .from('typing_indicators')
          .delete()
          .eq('chat_id', activeChat.id)
          .eq('user_id', user.id);
      }, 3000);
    } catch (error) {
      console.error('Error handling typing indicator:', error);
    }
  }, [user, activeChat]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to chat changes
    const chatsSubscription = supabase
      .channel('chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
        },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    // Subscribe to messages changes
    const messagesSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Only add message if it's for the active chat
          if (activeChat && newMessage.chat_id === activeChat.id) {
            setMessages((prev) => [...prev, newMessage]);
          }

          // Update chat list
          fetchChats();

          // Show notification for new messages from others
          if (newMessage.sender_id !== user.id) {
            toast.success('New message received');
          }
        }
      )
      .subscribe();

    // Subscribe to typing indicators
    const typingSubscription = supabase
      .channel('typing_indicators')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
        },
        async () => {
          if (!activeChat) return;

          const { data } = await supabase
            .from('typing_indicators')
            .select(`
              *,
              user:users!typing_indicators_user_id_fkey(
                id,
                username,
                avatar_url
              )
            `)
            .eq('chat_id', activeChat.id)
            .neq('user_id', user.id);

          setTypingUsers(data || []);
        }
      )
      .subscribe();

    return () => {
      chatsSubscription.unsubscribe();
      messagesSubscription.unsubscribe();
      typingSubscription.unsubscribe();
    };
  }, [user, activeChat, fetchChats]);

  // Load chats when user is available
  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user, fetchChats]);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
      setTypingUsers([]);
    } else {
      setMessages([]);
      setTypingUsers([]);
    }
  }, [activeChat, fetchMessages]);

  const value: ChatContextType = {
    chats,
    activeChat,
    messages,
    loading,
    error,
    setActiveChat,
    sendMessage,
    markAsRead,
    uploadFile,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
