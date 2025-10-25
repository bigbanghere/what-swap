import { supabaseAdmin, Chat } from './supabase';

export class ChatDatabaseService {
  /**
   * Upsert chat data (insert or update if exists)
   */
  async upsertChat(chatData: {
    chat_id: string;
    chat_type: 'private' | 'group' | 'supergroup' | 'channel';
    title?: string;
    username?: string;
    description?: string;
    invite_link?: string;
  }): Promise<Chat | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('chats')
        .upsert({
          chat_id: chatData.chat_id,
          chat_type: chatData.chat_type,
          title: chatData.title,
          username: chatData.username,
          description: chatData.description,
          invite_link: chatData.invite_link,
          last_activity: new Date().toISOString(),
          message_count: 1, // Increment message count
        }, {
          onConflict: 'chat_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting chat:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertChat:', error);
      return null;
    }
  }

  /**
   * Get chat by chat_id
   */
  async getChat(chatId: string): Promise<Chat | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('chats')
        .select('*')
        .eq('chat_id', chatId)
        .single();

      if (error) {
        console.error('Error getting chat:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getChat:', error);
      return null;
    }
  }

  /**
   * Update chat's last activity and increment message count
   */
  async updateChatActivity(chatId: string): Promise<boolean> {
    try {
      // First get current message count
      const { data: currentChat } = await supabaseAdmin
        .from('chats')
        .select('message_count')
        .eq('chat_id', chatId)
        .single();

      const newMessageCount = (currentChat?.message_count || 0) + 1;

      const { error } = await supabaseAdmin
        .from('chats')
        .update({
          last_activity: new Date().toISOString(),
          message_count: newMessageCount
        })
        .eq('chat_id', chatId);

      if (error) {
        console.error('Error updating chat activity:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateChatActivity:', error);
      return false;
    }
  }

  /**
   * Get all active chats
   */
  async getActiveChats(): Promise<Chat[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('chats')
        .select('*')
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (error) {
        console.error('Error getting active chats:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveChats:', error);
      return [];
    }
  }

  /**
   * Get chat statistics
   */
  async getChatStats(): Promise<{
    total_chats: number;
    active_chats: number;
    private_chats: number;
    group_chats: number;
    channel_chats: number;
  }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('chats')
        .select('is_active, chat_type');

      if (error) {
        console.error('Error getting chat stats:', error);
        return {
          total_chats: 0,
          active_chats: 0,
          private_chats: 0,
          group_chats: 0,
          channel_chats: 0
        };
      }

      const stats = data?.reduce((acc, chat) => {
        acc.total_chats++;
        if (chat.is_active) acc.active_chats++;
        if (chat.chat_type === 'private') acc.private_chats++;
        if (chat.chat_type === 'group' || chat.chat_type === 'supergroup') acc.group_chats++;
        if (chat.chat_type === 'channel') acc.channel_chats++;
        return acc;
      }, {
        total_chats: 0,
        active_chats: 0,
        private_chats: 0,
        group_chats: 0,
        channel_chats: 0
      });

      return stats || {
        total_chats: 0,
        active_chats: 0,
        private_chats: 0,
        group_chats: 0,
        channel_chats: 0
      };
    } catch (error) {
      console.error('Error in getChatStats:', error);
      return {
        total_chats: 0,
        active_chats: 0,
        private_chats: 0,
        group_chats: 0,
        channel_chats: 0
      };
    }
  }
}
