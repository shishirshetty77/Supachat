'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';

export default function TestChat() {
  const { user: currentUser } = useAuth();
  const [otherUserId, setOtherUserId] = useState('');
  const [otherUsername, setOtherUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const testCreateChat = async () => {
    if (!currentUser || !otherUserId.trim()) {
      setResult('Error: Missing current user or other user ID');
      return;
    }

    try {
      setLoading(true);
      setResult('Testing basic database connection...');

      console.log('Testing basic database queries first');
      
      // Test 1: Simple users query
      setResult('Step 1: Testing users table access...');
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, username')
        .limit(3);

      if (usersError) {
        setResult(`Users query failed: ${usersError.message}`);
        return;
      }

      console.log('Users query success:', usersData);
      
      // Test 2: Simple chats query
      setResult('Step 2: Testing chats table access...');
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('id, is_group')
        .limit(3);

      if (chatsError) {
        setResult(`Chats query failed: ${chatsError.message}`);
        return;
      }

      console.log('Chats query success:', chatsData);
      
      // Test 3: Simple chat_members query
      setResult('Step 3: Testing chat_members table access...');
      const { data: membersData, error: membersError } = await supabase
        .from('chat_members')
        .select('chat_id, user_id')
        .limit(3);

      if (membersError) {
        setResult(`Chat members query failed: ${membersError.message}`);
        return;
      }

      console.log('Chat members query success:', membersData);
      
      // Test 4: Try to find current user's chats (the query that was hanging)
      setResult('Step 4: Testing current user chat members query...');
      const { data: myChats, error: myChatsError } = await supabase
        .from('chat_members')
        .select('chat_id')
        .eq('user_id', currentUser.id)
        .limit(5);

      if (myChatsError) {
        setResult(`My chats query failed: ${myChatsError.message}`);
        return;
      }

      console.log('My chats query success:', myChats);
      
      setResult(`All database tests passed! ✅
Users found: ${usersData?.length || 0}
Chats found: ${chatsData?.length || 0}
Members found: ${membersData?.length || 0}
My chats: ${myChats?.length || 0}`);

    } catch (error: unknown) {
      console.error('Database test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResult(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const testDbQueries = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setResult('Testing database queries...');

      // Test 1: Can we read from chats table?
      const { data: chats, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .limit(5);

      if (chatsError) {
        setResult(`Chats query error: ${chatsError.message}`);
        return;
      }

      // Test 2: Can we read from chat_members table?
      const { data: members, error: membersError } = await supabase
        .from('chat_members')
        .select('*')
        .limit(5);

      if (membersError) {
        setResult(`Chat members query error: ${membersError.message}`);
        return;
      }

      // Test 3: Can we create a chat?
      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert({ is_group: false })
        .select()
        .single();

      if (createError) {
        setResult(`Create chat error: ${createError.message}`);
        return;
      }

      // Test 4: Can we add members?
      const { error: addMemberError } = await supabase
        .from('chat_members')
        .insert({ 
          chat_id: newChat.id, 
          user_id: currentUser.id, 
          role: 'admin' 
        });

      if (addMemberError) {
        setResult(`Add member error: ${addMemberError.message}`);
        return;
      }

      setResult(`All tests passed! Created test chat: ${newChat.id}`);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResult(`Unexpected error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Chat Creation</h1>
        <p>Please log in first.</p>
        <Link href="/" className="text-blue-600 underline">← Back to main app</Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Test Chat Creation</h1>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded">
          <h2 className="font-semibold mb-2">Current User:</h2>
          <p>ID: {currentUser.id}</p>
          <p>Username: {currentUser.username}</p>
        </div>

        <div className="space-y-2">
          <h2 className="font-semibold">Test Chat Creation:</h2>
          <Input 
            placeholder="Other user ID (get from debug-users page)"
            value={otherUserId}
            onChange={(e) => setOtherUserId(e.target.value)}
          />
          <Input 
            placeholder="Other user's username (optional)"
            value={otherUsername}
            onChange={(e) => setOtherUsername(e.target.value)}
          />
          <div className="space-x-2">
            <Button 
              onClick={testCreateChat} 
              disabled={loading || !otherUserId.trim()}
            >
              {loading ? 'Testing...' : 'Test Create Chat'}
            </Button>
            <Button 
              onClick={testDbQueries} 
              disabled={loading}
              variant="outline"
            >
              Test DB Queries
            </Button>
          </div>
        </div>

        {result && (
          <div className={`p-4 rounded ${result.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            <h3 className="font-semibold">Result:</h3>
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}

        <div className="space-y-2">
          <Link href="/debug-users" className="text-blue-600 underline block">→ Go to Debug Users (to get user IDs)</Link>
          <Link href="/" className="text-blue-600 underline block">← Back to main app</Link>
        </div>
      </div>
    </div>
  );
}
