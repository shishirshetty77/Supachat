-- Minimal RLS Fix - Just disable RLS temporarily to test chat creation
-- Run this in your Supabase SQL Editor

-- Disable RLS on all tables temporarily for testing
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats DISABLE ROW LEVEL SECURITY;  
ALTER TABLE public.chat_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to authenticated users
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.chats TO authenticated;
GRANT ALL ON public.chat_members TO authenticated;
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.message_reads TO authenticated;
GRANT ALL ON public.typing_indicators TO authenticated;
