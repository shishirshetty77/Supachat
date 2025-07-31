import { supabase } from '@/lib/supabase/client';

export async function createOrFindChat(otherUserId: string, currentUserId: string) {
  try {
    console.log('Starting createOrFindChat function');
    console.log('Current user ID:', currentUserId);
    console.log('Other user ID:', otherUserId);

    // Step 1: Check if a chat already exists between these two users
    // Get all chats where current user is a member
    console.log('Step 1: Checking for existing chats where current user is a member');
    const { data: myChats, error: myChatsError } = await supabase
      .from('chat_members')
      .select('chat_id')
      .eq('user_id', currentUserId);

    if (myChatsError) {
      console.error('Error fetching my chats:', myChatsError);
      throw new Error(`Failed to fetch current user's chats: ${myChatsError.message}`);
    }

    console.log('My chats found:', myChats?.length || 0);

    // Check each of my chats to see if the other user is also a member
    if (myChats && myChats.length > 0) {
      console.log('Step 2: Checking each chat for the other user');
      for (const chatMember of myChats) {
        console.log('Checking chat ID:', chatMember.chat_id);
        const { data: chatMembers, error: membersError } = await supabase
          .from('chat_members')
          .select('user_id')
          .eq('chat_id', chatMember.chat_id);

        if (membersError) {
          console.warn(`Error checking members for chat ${chatMember.chat_id}:`, membersError);
          continue; // Skip this chat if error
        }

        // Check if this is a 1-on-1 chat with exactly 2 members
        if (chatMembers && chatMembers.length === 2) {
          console.log(`Chat ${chatMember.chat_id} has ${chatMembers.length} members`);
          const userIds = chatMembers.map(m => m.user_id);
          console.log('User IDs in this chat:', userIds);
          
          if (userIds.includes(currentUserId) && userIds.includes(otherUserId)) {
            console.log('Found existing chat between the two users:', chatMember.chat_id);
            return chatMember.chat_id;
          } else {
            console.log('This chat does not contain both users');
          }
        } else {
          console.log(`Chat ${chatMember.chat_id} has ${chatMembers?.length || 0} members, not 2`);
        }
      }
    }

    console.log('Step 3: No existing chat found, creating new chat...');

    // Step 2: Create new chat if none exists
    console.log('Creating a new chat with is_group=false');
    const { data: newChat, error: chatError } = await supabase
      .from('chats')
      .insert({
        is_group: false,
      })
      .select()
      .single();

    if (chatError) {
      console.error('Error creating chat:', chatError);
      throw new Error(`Failed to create new chat: ${chatError.message}`);
    }

    console.log('Successfully created new chat with ID:', newChat.id);

    // Step 3: Add both users to the chat
    console.log('Step 4: Adding both users to the chat');
    console.log(`Adding user ${currentUserId} as admin and user ${otherUserId} as member`);
    
    const { error: membersError } = await supabase
      .from('chat_members')
      .insert([
        { chat_id: newChat.id, user_id: currentUserId, role: 'admin' },
        { chat_id: newChat.id, user_id: otherUserId, role: 'member' }
      ]);

    if (membersError) {
      console.error('Error adding members to chat:', membersError);
      throw new Error(`Failed to add users to chat: ${membersError.message}`);
    }

    console.log('Successfully added both members to chat');
    console.log('Chat creation complete - returning chat ID:', newChat.id);
    return newChat.id;
  } catch (error) {
    console.error('Error in createOrFindChat:', error);
    // Log full error details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
}
