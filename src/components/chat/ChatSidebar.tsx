'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { Chat, User } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import { createOrFindChat } from '@/utils/chatHelpers';
import { UserSelector } from './UserSelector';
import { 
  Search, 
  MessageCircle, 
  Settings, 
  LogOut, 
  MoreVertical,
  User as UserIcon,
  Moon,
  Sun,
  Users,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatSidebar() {
  const { user, signOut } = useAuth();
  const { chats, activeChat, setActiveChat, loading } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const filteredChats = chats.filter((chat) =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatLastMessage = (chat: Chat) => {
    if (!chat.last_message) return 'No messages yet';
    
    const { content, sender } = chat.last_message;
    const senderName = sender?.username === user?.username ? 'You' : sender?.username;
    
    return `${senderName}: ${content.length > 30 ? content.slice(0, 30) + '...' : content}`;
  };

  return (
    <div className="flex flex-col h-full bg-background border-r">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary rounded-lg">
            <MessageCircle className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">Chatty</h1>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === 'light' ? (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark mode
                </>
              ) : (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  Light mode
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <Separator />
            <DropdownMenuItem onClick={signOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.username ? getInitials(user.username) : <UserIcon className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Start New Chat Button */}
      <UserSelector />

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <AnimatePresence>
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No chats found</p>
              <p className="text-xs">Start a new conversation</p>
            </div>
          ) : (
            filteredChats.map((chat, index) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-center space-x-3 p-4 cursor-pointer hover:bg-accent transition-colors",
                  activeChat?.id === chat.id && "bg-accent"
                )}
                onClick={() => setActiveChat(chat)}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={chat.avatar_url || chat.other_user?.avatar_url} />
                    <AvatarFallback className="bg-secondary">
                      {chat.name ? getInitials(chat.name) : <UserIcon className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  {!chat.is_group && chat.other_user?.is_online && (
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-background rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                      {chat.name}
                    </p>
                    {chat.last_message && (
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(chat.last_message.created_at), {
                          addSuffix: false,
                        })}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground truncate flex-1">
                      {formatLastMessage(chat)}  
                    </p>
                    {chat.unread_count && chat.unread_count > 0 && (
                      <Badge variant="default" className="ml-2 h-5 min-w-[20px] text-xs">
                        {chat.unread_count > 99 ? '99+' : chat.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}
