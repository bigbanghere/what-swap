import { supabaseAdmin, User } from './supabase';

export class UserDatabaseService {
  /**
   * Upsert user data (insert or update if exists)
   */
  async upsertUser(userData: {
    user_id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    language_code?: string;
    is_bot?: boolean;
    is_premium?: boolean;
  }): Promise<User | null> {
    try {
      // First check if user exists
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('message_count')
        .eq('user_id', userData.user_id)
        .single();

      const newMessageCount = (existingUser?.message_count || 0) + 1;

      const { data, error } = await supabaseAdmin
        .from('users')
        .upsert({
          user_id: userData.user_id,
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          language_code: userData.language_code,
          is_bot: userData.is_bot || false,
          is_premium: userData.is_premium || false,
          last_activity: new Date().toISOString(),
          message_count: newMessageCount,
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertUser:', error);
      return null;
    }
  }

  /**
   * Get user by user_id
   */
  async getUser(userId: number): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error getting user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUser:', error);
      return null;
    }
  }

  /**
   * Update user's last activity and increment message count
   */
  async updateUserActivity(userId: number): Promise<boolean> {
    try {
      // First get current message count
      const { data: currentUser } = await supabaseAdmin
        .from('users')
        .select('message_count')
        .eq('user_id', userId)
        .single();

      const newMessageCount = (currentUser?.message_count || 0) + 1;

      const { error } = await supabaseAdmin
        .from('users')
        .update({
          last_activity: new Date().toISOString(),
          message_count: newMessageCount
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user activity:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateUserActivity:', error);
      return false;
    }
  }

  /**
   * Get all active users
   */
  async getActiveUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (error) {
        console.error('Error getting active users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveUsers:', error);
      return [];
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    total_users: number;
    active_users: number;
    premium_users: number;
    bot_users: number;
  }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('is_active, is_premium, is_bot');

      if (error) {
        console.error('Error getting user stats:', error);
        return {
          total_users: 0,
          active_users: 0,
          premium_users: 0,
          bot_users: 0
        };
      }

      const stats = data?.reduce((acc, user) => {
        acc.total_users++;
        if (user.is_active) acc.active_users++;
        if (user.is_premium) acc.premium_users++;
        if (user.is_bot) acc.bot_users++;
        return acc;
      }, {
        total_users: 0,
        active_users: 0,
        premium_users: 0,
        bot_users: 0
      });

      return stats || {
        total_users: 0,
        active_users: 0,
        premium_users: 0,
        bot_users: 0
      };
    } catch (error) {
      console.error('Error in getUserStats:', error);
      return {
        total_users: 0,
        active_users: 0,
        premium_users: 0,
        bot_users: 0
      };
    }
  }
}
