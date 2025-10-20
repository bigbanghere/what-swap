import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uyrpbsxummoqlgnsqjla.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cnBic3h1bW1vcWxnbnNxamxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4ODg1OTUsImV4cCI6MjA3NjQ2NDU5NX0.nQBeilxuMgdNwL77mkveJ0Z5V7a_cEXTNmzgIAmSqrM';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cnBic3h1bW1vcWxnbnNxamxhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg4ODU5NSwiZXhwIjoyMDc2NDY0NTk1fQ.HhJExcOhUWXoUP_r6YzBnAWD7uGlmLT6gdweN35xewY';

// Client for server-side operations with service role key
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Client for client-side operations with anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface ConnectedChat {
  id: number
  chat_id: string
  chat_type: 'private' | 'group' | 'supergroup' | 'channel'
  title?: string
  username?: string
  description?: string
  invite_link?: string
  bot_status?: 'member' | 'administrator' | 'creator' | 'left' | 'kicked'
  can_post_messages?: boolean
  can_edit_messages?: boolean
  can_delete_messages?: boolean
  can_manage_chat?: boolean
  is_active: boolean
  first_seen: string
  last_activity: string
  message_count: number
  created_at: string
  updated_at: string
}

export interface BotMessage {
  id: number
  chat_id: string
  message_id: number
  template_id?: string
  content: string
  parse_mode: 'HTML' | 'Markdown' | 'MarkdownV2'
  variables?: Record<string, any>
  sent_at: string
  created_at: string
}

export interface ScheduledMessage {
  id: number
  chat_id: string
  template_id: string
  variables?: Record<string, any>
  scheduled_for: string
  repeat_interval_ms?: number
  is_active: boolean
  last_sent?: string
  next_run?: string
  created_at: string
  updated_at: string
}
