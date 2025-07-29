'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { formatDistanceToNow } from 'date-fns';
import { 
  Phone, 
  Video, 
  MoreVertical, 
  User as UserIcon,
  MessageCircle,
  Search,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatWindow() {
  const { user } = useAuth();
  const { activeChat, messages, loading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getLastSeen = (lastActive: string) => {
    const date = new Date(lastActive);
    return `Last seen ${formatDistanceToNow(date, { addSuffix: true })}`;
  };

  const shouldShowAvatar = (currentMessage: any, previousMessage: any) => {
    if (!previousMessage) return true;
    if (currentMessage.sender_id !== previousMessage.sender_id) return true;
    
    const timeDiff = new Date(currentMessage.created_at).getTime() - 
                    new Date(previousMessage.created_at).getTime();
    return timeDiff > 5 * 60 * 1000; // Show avatar if messages are 5+ minutes apart
  };

  const isConsecutiveMessage = (currentMessage: any, previousMessage: any) => {
    if (!previousMessage) return false;
    if (currentMessage.sender_id !== previousMessage.sender_id) return false;
    
    const timeDiff = new Date(currentMessage.created_at).getTime() - 
                    new Date(previousMessage.created_at).getTime();
    return timeDiff < 2 * 60 * 1000; // Consider consecutive if within 2 minutes
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/10">
        <div className="text-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto">
            <MessageCircle className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Welcome to Chatty</h3>
            <p className="text-muted-foreground">
              Select a chat to start messaging or create a new conversation
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={activeChat.avatar_url || activeChat.other_user?.avatar_url} />
              <AvatarFallback className="bg-secondary">
                {activeChat.name ? getInitials(activeChat.name) : <UserIcon className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            {!activeChat.is_group && activeChat.other_user?.is_online && (
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate">
              {activeChat.name}
            </h2>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              {activeChat.is_group ? (
                <span>Group chat</span>
              ) : activeChat.other_user?.is_online ? (
                <>
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Online</span>
                </>
              ) : (
                activeChat.other_user?.last_active && (
                  <span>{getLastSeen(activeChat.other_user.last_active)}</span>
                )
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-1">
          <AnimatePresence initial={false}>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="p-4 bg-muted/20 rounded-full mb-4">
                  <MessageCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                <p className="text-muted-foreground text-sm">
                  Start the conversation by sending a message below
                </p>
              </motion.div>
            ) : (
              messages.map((message, index) => {
                const previousMessage = messages[index - 1];
                const showAvatar = shouldShowAvatar(message, previousMessage);
                const isConsecutive = isConsecutiveMessage(message, previousMessage);

                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    showAvatar={showAvatar}
                    isConsecutive={isConsecutive}
                  />
                );
              })
            )}
          </AnimatePresence>
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <MessageInput />
    </div>
  );
}
