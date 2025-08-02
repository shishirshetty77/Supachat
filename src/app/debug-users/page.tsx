'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';

export default function DebugUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // First, let's see all users in the database
        const { data: allUsers, error: allUsersError } = await supabase
          .from('users')
          .select('*');

        if (allUsersError) {
          setError(`Error fetching all users: ${allUsersError.message}`);
          return;
        }

        console.log('All users in database:', allUsers);
        setUsers(allUsers || []);

      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Unexpected error: ${errorMessage}`);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Users</h1>
        <p>Please log in first.</p>
        <Link href="/" className="text-blue-600 underline">← Back to main app</Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Users</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">Current User:</h2>
          <div className="bg-green-50 p-3 rounded">
            <p>ID: {currentUser.id}</p>
            <p>Username: {currentUser.username}</p>
            <p>Email: {currentUser.email}</p>
          </div>
        </div>

        <div>
          <h2 className="font-semibold">All Users in Database:</h2>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <div className="bg-red-50 p-3 rounded text-red-600">
              <p>Error: {error}</p>
            </div>
          ) : users.length === 0 ? (
            <p className="text-yellow-600">No users found in database!</p>
          ) : (
            <div className="space-y-2">
              {users.map((user, index) => (
                <div 
                  key={user.id} 
                  className={`p-3 rounded ${user.id === currentUser.id ? 'bg-blue-50' : 'bg-gray-50'}`}
                >
                  <p><strong>User {index + 1}:</strong></p>
                  <p>ID: {user.id}</p>
                  <p>Username: {user.username}</p>
                  <p>Email: {user.email}</p>
                  <p>Created: {user.created_at}</p>
                  {user.id === currentUser.id && <p className="text-blue-600">← This is you</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-semibold">Other Users (excluding current):</h2>
          {users.filter(u => u.id !== currentUser.id).length === 0 ? (
            <p className="text-yellow-600">No other users found!</p>
          ) : (
            <div className="space-y-2">
              {users.filter(u => u.id !== currentUser.id).map((user, index) => (
                <div key={user.id} className="p-3 rounded bg-green-50">
                  <p><strong>Other User {index + 1}:</strong></p>
                  <p>Username: {user.username}</p>
                  <p>Email: {user.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <Link href="/" className="text-blue-600 underline">← Back to main app</Link>
        </div>
      </div>
    </div>
  );
}
