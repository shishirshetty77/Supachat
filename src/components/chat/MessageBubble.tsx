'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Check, CheckCheck, User as UserIcon, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
  isConsecutive?: boolean;
}

export function MessageBubble({ 
  message, 
  showAvatar = true, 
  isConsecutive = false 
}: MessageBubbleProps) {
  const { user } = useAuth();
  const isOwn = message.sender_id === user?.id;
  const isRead = message.read_by && message.read_by.length > 0;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m`;
    if (diffInMinutes < 1440) return format(date, 'HH:mm');
    return format(date, 'MMM d, HH:mm');
  };

  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'image':
        return (
          <div className="relative">
            <Image 
              src={message.file_url || ''} 
              alt="Shared image"
              width={300}
              height={200}
              className="rounded-lg max-w-xs max-h-64 object-cover"
            />
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        );
      
      case 'file':
        return (
          <div className="flex items-center space-x-3 p-3 bg-accent/20 rounded-lg">
            <File className="h-6 w-6 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {message.file_name || 'Unknown file'}
              </p>
              {message.file_size && (
                <p className="text-xs text-muted-foreground">
                  {(message.file_size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>
        );
      
      case 'emoji':
        return (
          <span className="text-4xl">{message.content}</span>
        );
      
      default:
        return (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex items-end space-x-2 mb-4",
        isOwn ? "justify-end" : "justify-start",
        isConsecutive && "mb-1"
      )}
    >
      {/* Avatar for received messages */}
      {!isOwn && showAvatar && !isConsecutive && (
        <Avatar className="h-8 w-8 mb-1">
          <AvatarImage src={message.sender?.avatar_url} />
          <AvatarFallback className="bg-secondary text-xs">
            {message.sender?.username 
              ? getInitials(message.sender.username) 
              : <UserIcon className="h-3 w-3" />
            }
          </AvatarFallback>
        </Avatar>
      )}
      
      {/* Spacer for consecutive messages */}
      {!isOwn && (!showAvatar || isConsecutive) && (
        <div className="w-8" />
      )}

      <div className={cn(
        "max-w-xs lg:max-w-md",
        isOwn ? "order-1" : "order-2"
      )}>
        {/* Sender name for received messages */}
        {!isOwn && showAvatar && !isConsecutive && (
          <p className="text-xs text-muted-foreground mb-1 ml-3">
            {message.sender?.username}
          </p>
        )}

        {/* Message bubble */}
        <div className={cn(
          "relative px-4 py-2 rounded-2xl shadow-sm",
          isOwn 
            ? "bg-primary text-primary-foreground ml-auto" 
            : "bg-secondary text-secondary-foreground",
          message.message_type === 'emoji' && "bg-transparent shadow-none px-2 py-1"
        )}>
          {renderMessageContent()}
          
          {message.is_edited && (
            <p className="text-xs opacity-70 mt-1">(edited)</p>
          )}
        </div>

        {/* Timestamp and read status */}
        <div className={cn(
          "flex items-center mt-1 space-x-1 text-xs text-muted-foreground",
          isOwn ? "justify-end" : "justify-start"
        )}>
          <span>{formatTime(message.created_at)}</span>
          
          {/* Read receipts for own messages */}
          {isOwn && (
            <div className="flex items-center">
              {isRead ? (
                <CheckCheck className="h-3 w-3 text-blue-500" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
