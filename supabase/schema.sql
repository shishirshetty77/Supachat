-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    is_online BOOLEAN DEFAULT false,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chats table
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    description TEXT,
    avatar_url TEXT,
    is_group BOOLEAN DEFAULT false,
    last_message_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_members table
CREATE TABLE IF NOT EXISTS public.chat_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(chat_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'emoji')),
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message_reads table for read receipts
CREATE TABLE IF NOT EXISTS public.message_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Create typing_indicators table
CREATE TABLE IF NOT EXISTS public.typing_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(chat_id, user_id)
);

-- Add foreign key constraint for last_message_id in chats table
ALTER TABLE public.chats ADD CONSTRAINT fk_last_message
    FOREIGN KEY (last_message_id) REFERENCES public.messages(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_members_chat_id ON public.chat_members(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON public.chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_message_reads_message_id ON public.message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_chat_id ON public.typing_indicators(chat_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for chats table
CREATE POLICY "Users can view chats they are members of" ON public.chats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_members
            WHERE chat_id = id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create chats" ON public.chats
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Chat members can update chat details" ON public.chats
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.chat_members
            WHERE chat_id = id AND user_id = auth.uid()
        )
    );

-- RLS Policies for chat_members table
CREATE POLICY "Users can view chat members for their chats" ON public.chat_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_members cm2
            WHERE cm2.chat_id = chat_id AND cm2.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can add members to chats" ON public.chat_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chat_members
            WHERE chat_id = chat_members.chat_id AND user_id = auth.uid()
        ) OR auth.uid() = user_id
    );

-- RLS Policies for messages table
CREATE POLICY "Users can view messages in their chats" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_members
            WHERE chat_id = messages.chat_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to their chats" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.chat_members
            WHERE chat_id = messages.chat_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- RLS Policies for message_reads table
CREATE POLICY "Users can view read receipts for their chats" ON public.message_reads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.chat_members cm ON m.chat_id = cm.chat_id
            WHERE m.id = message_id AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can mark messages as read" ON public.message_reads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for typing_indicators table
CREATE POLICY "Users can view typing indicators for their chats" ON public.typing_indicators
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_members
            WHERE chat_id = typing_indicators.chat_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own typing indicators" ON public.typing_indicators
    FOR ALL USING (auth.uid() = user_id);

-- Functions to handle user creation and updates
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user's last active timestamp
CREATE OR REPLACE FUNCTION public.update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET last_active = NOW(), is_online = true
    WHERE id = auth.uid();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update chat's last message
CREATE OR REPLACE FUNCTION public.update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chats
    SET last_message_id = NEW.id, updated_at = NOW()
    WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update chat's last message
CREATE TRIGGER on_new_message
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.update_chat_last_message();

-- Function to clean up old typing indicators
CREATE OR REPLACE FUNCTION public.cleanup_typing_indicators()
RETURNS void AS $$
BEGIN
    DELETE FROM public.typing_indicators
    WHERE created_at < NOW() - INTERVAL '10 seconds';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's chats with last message and unread count
CREATE OR REPLACE FUNCTION public.get_user_chats(user_id UUID)
RETURNS TABLE (
    chat_id UUID,
    chat_name TEXT,
    chat_description TEXT,
    chat_avatar_url TEXT,
    is_group BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    last_message_content TEXT,
    last_message_created_at TIMESTAMP WITH TIME ZONE,
    last_message_sender_username TEXT,
    unread_count BIGINT,
    other_user_id UUID,
    other_user_username TEXT,
    other_user_avatar_url TEXT,
    other_user_is_online BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id as chat_id,
        c.name as chat_name,
        c.description as chat_description,
        c.avatar_url as chat_avatar_url,
        c.is_group,
        c.created_at,
        c.updated_at,
        lm.content as last_message_content,
        lm.created_at as last_message_created_at,
        sender.username as last_message_sender_username,
        COALESCE(unread.count, 0) as unread_count,
        other_user.id as other_user_id,
        other_user.username as other_user_username,
        other_user.avatar_url as other_user_avatar_url,
        other_user.is_online as other_user_is_online
    FROM public.chats c
    JOIN public.chat_members cm ON c.id = cm.chat_id
    LEFT JOIN public.messages lm ON c.last_message_id = lm.id
    LEFT JOIN public.users sender ON lm.sender_id = sender.id
    LEFT JOIN (
        SELECT
            m.chat_id,
            COUNT(*) as count
        FROM public.messages m
        LEFT JOIN public.message_reads mr ON m.id = mr.message_id AND mr.user_id = $1
        WHERE mr.id IS NULL AND m.sender_id != $1
        GROUP BY m.chat_id
    ) unread ON c.id = unread.chat_id
    LEFT JOIN (
        SELECT DISTINCT
            cm2.chat_id,
            u.id,
            u.username,
            u.avatar_url,
            u.is_online
        FROM public.chat_members cm2
        JOIN public.users u ON cm2.user_id = u.id
        WHERE cm2.user_id != $1
    ) other_user ON c.id = other_user.chat_id AND NOT c.is_group
    WHERE cm.user_id = $1
    ORDER BY c.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
