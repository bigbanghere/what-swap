#!/usr/bin/env node

/**
 * Supabase Setup Guide
 * Provides step-by-step instructions for setting up Supabase tables
 */

const fs = require('fs');

function displaySQL() {
  console.log('📋 Supabase Table Setup Guide');
  console.log('=============================\n');
  
  console.log('🔧 Step-by-Step Instructions:');
  console.log('1. Go to: https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Click "SQL Editor" in the left sidebar');
  console.log('4. Click "New Query"');
  console.log('5. Copy the SQL below and paste it into the editor');
  console.log('6. Click "Run" to execute the SQL');
  console.log('7. Come back here and run: node test-supabase-connection.js\n');
  
  console.log('📄 SQL to Copy:');
  console.log('='.repeat(80));
  
  try {
    const schema = fs.readFileSync('supabase-schema.sql', 'utf8');
    console.log(schema);
  } catch (error) {
    console.log('Error reading schema file. Here is the SQL:');
    console.log(`
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
  created_at TIMESTAMPTZ DEFAULT NOW()
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
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

-- Insert default templates
INSERT INTO message_templates (id, name, content, parse_mode, variables) VALUES
('welcome', 'Welcome Message', '🎉 Welcome to {{groupName}}!', 'HTML', ARRAY['groupName']),
('daily-update', 'Daily Update', '📊 Daily Update - {{date}}', 'HTML', ARRAY['date', 'content']),
('announcement', 'Announcement', '📢 **{{title}}**', 'Markdown', ARRAY['title', 'message', 'date']),
('reminder', 'Reminder', '⏰ Reminder: {{message}}', 'HTML', ARRAY['message', 'time'])
ON CONFLICT (id) DO NOTHING;
    `);
  }
  
  console.log('='.repeat(80));
  console.log('\n✅ After running the SQL, test with: node test-supabase-connection.js');
}

function main() {
  displaySQL();
}

main();
