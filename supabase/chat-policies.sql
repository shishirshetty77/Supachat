-- Additional RLS Policies for Chat Functionality

-- Chat policies
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

-- Chat members policies
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

-- Messages policies
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

-- Message reads policies
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

-- Typing indicators policies
CREATE POLICY "Users can view typing indicators for their chats" ON public.typing_indicators
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_members 
            WHERE chat_id = typing_indicators.chat_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own typing indicators" ON public.typing_indicators
    FOR ALL USING (auth.uid() = user_id);

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
DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.update_chat_last_message();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_members_chat_id ON public.chat_members(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON public.chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_message_reads_message_id ON public.message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_chat_id ON public.typing_indicators(chat_id);
