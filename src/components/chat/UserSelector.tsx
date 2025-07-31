'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { supabase } from '@/lib/supabase/client';
import { createOrFindChat } from '@/utils/chatHelpers';
import { User } from '@/types';
import { Users, Search, MessageCircle, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

export function UserSelector() {
  const { user: currentUser } = useAuth();
  const { setActiveChat } = useChat();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchUsers = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', currentUser.id)
        .limit(20);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, currentUser]);

  const handleStartChat = async (otherUser: User) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const chatId = await createOrFindChat(otherUser.id, currentUser.id);
      
      // Create a temporary chat object to set as active
      const tempChat = {
        id: chatId,
        name: otherUser.username,
        is_group: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        other_user: otherUser,
      };

      setActiveChat(tempChat);
      setIsOpen(false);
      toast.success(`Started conversation with ${otherUser.username}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mb-4 mx-4">
          <Users className="h-4 w-4 mr-2" />
          Start New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a conversation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Users list */}
          <ScrollArea className="h-64">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleStartChat(user)}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="bg-secondary">
                          {getInitials(user.username)}
                        </AvatarFallback>
                      </Avatar>
                      {user.is_online && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
