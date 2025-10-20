import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('Missing required Supabase environment variables');
}

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
export interface User {
  id: number
  user_id: number
  username?: string
  first_name?: string
  last_name?: string
  language_code?: string
  is_bot: boolean
  is_premium: boolean
  first_seen: string
  last_activity: string
  message_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Chat {
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
