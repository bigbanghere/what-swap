-- Telegram Bot Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Create connected_chats table
CREATE TABLE IF NOT EXISTS connected_chats (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  chat_id TEXT NOT NULL UNIQUE,
  chat_type TEXT NOT NULL CHECK (chat_type IN ('private', 'group', 'supergroup', 'channel')),
  title TEXT,
  username TEXT,
  description TEXT,
  invite_link TEXT,
  bot_status TEXT CHECK (bot_status IN ('member', 'administrator', 'creator', 'left', 'kicked')),
  can_post_messages BOOLEAN DEFAULT FALSE,
  can_edit_messages BOOLEAN DEFAULT FALSE,
  can_delete_messages BOOLEAN DEFAULT FALSE,
  can_manage_chat BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bot_messages table
CREATE TABLE IF NOT EXISTS bot_messages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  chat_id TEXT NOT NULL,
  message_id INTEGER NOT NULL,
  template_id TEXT,
  content TEXT NOT NULL,
  parse_mode TEXT DEFAULT 'HTML' CHECK (parse_mode IN ('HTML', 'Markdown', 'MarkdownV2')),
  variables JSONB,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (chat_id) REFERENCES connected_chats(chat_id) ON DELETE CASCADE
);

-- Create scheduled_messages table
CREATE TABLE IF NOT EXISTS scheduled_messages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  chat_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  variables JSONB,
  scheduled_for TIMESTAMPTZ NOT NULL,
  repeat_interval_ms BIGINT,
  is_active BOOLEAN DEFAULT TRUE,
  last_sent TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (chat_id) REFERENCES connected_chats(chat_id) ON DELETE CASCADE
);

-- Create message_templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  parse_mode TEXT DEFAULT 'HTML' CHECK (parse_mode IN ('HTML', 'Markdown', 'MarkdownV2')),
  variables TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_connected_chats_chat_id ON connected_chats(chat_id);
CREATE INDEX IF NOT EXISTS idx_connected_chats_chat_type ON connected_chats(chat_type);
CREATE INDEX IF NOT EXISTS idx_connected_chats_is_active ON connected_chats(is_active);
CREATE INDEX IF NOT EXISTS idx_bot_messages_chat_id ON bot_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_bot_messages_sent_at ON bot_messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_chat_id ON scheduled_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_is_active ON scheduled_messages(is_active);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_next_run ON scheduled_messages(next_run);
CREATE INDEX IF NOT EXISTS idx_message_templates_is_active ON message_templates(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_connected_chats_updated_at 
    BEFORE UPDATE ON connected_chats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_messages_updated_at 
    BEFORE UPDATE ON scheduled_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at 
    BEFORE UPDATE ON message_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default message templates
INSERT INTO message_templates (id, name, content, parse_mode, variables) VALUES
('welcome', 'Welcome Message', '🎉 Welcome to {{groupName}}!\n\nWe''re excited to have you here. Feel free to ask any questions!', 'HTML', ARRAY['groupName']),
('daily-update', 'Daily Update', '📊 Daily Update - {{date}}\n\n{{content}}', 'HTML', ARRAY['date', 'content']),
('announcement', 'Announcement', '📢 **{{title}}**\n\n{{message}}\n\n_Posted on {{date}}_', 'Markdown', ARRAY['title', 'message', 'date']),
('reminder', 'Reminder', '⏰ Reminder: {{message}}\n\nTime: {{time}}', 'HTML', ARRAY['message', 'time'])
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE connected_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for service role access
CREATE POLICY "Service role can do everything on connected_chats" ON connected_chats
    FOR ALL USING (true);

CREATE POLICY "Service role can do everything on bot_messages" ON bot_messages
    FOR ALL USING (true);

CREATE POLICY "Service role can do everything on scheduled_messages" ON scheduled_messages
    FOR ALL USING (true);

CREATE POLICY "Service role can do everything on message_templates" ON message_templates
    FOR ALL USING (true);

-- Create RLS policies for anonymous read access (optional)
CREATE POLICY "Anonymous can read message_templates" ON message_templates
    FOR SELECT USING (is_active = true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
