'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

export default function TestSupabase() {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test if we can connect to Supabase
        const { data, error } = await supabase.from('users').select('count').limit(1);
        
        if (error) {
          setError(error.message);
          setStatus('Connection failed');
        } else {
          setStatus('Connection successful!');
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setStatus('Connection failed');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">Environment Variables:</h2>
          <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}</p>
          <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>
        </div>
        
        <div>
          <h2 className="font-semibold">Connection Status:</h2>
          <p className={status.includes('successful') ? 'text-green-600' : 'text-red-600'}>
            {status}
          </p>
        </div>
        
        {error && (
          <div>
            <h2 className="font-semibold text-red-600">Error:</h2>
            <p className="text-red-600 font-mono text-sm">{error}</p>
          </div>
        )}
        
        <div>
          <Link href="/" className="text-blue-600 underline">← Back to main app</Link>
        </div>
      </div>
    </div>
  );
}
