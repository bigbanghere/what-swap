import { supabaseAdmin, type ConnectedChat, type BotMessage, type ScheduledMessage } from './supabase';

export class TelegramDatabaseService {
  
  /**
   * Store or update connected chat information
   */
  async upsertConnectedChat(chatData: {
    chat_id: string;
    chat_type: 'private' | 'group' | 'supergroup' | 'channel';
    title?: string;
    username?: string;
    description?: string;
    invite_link?: string;
    bot_status?: 'member' | 'administrator' | 'creator' | 'left' | 'kicked';
    can_post_messages?: boolean;
    can_edit_messages?: boolean;
    can_delete_messages?: boolean;
    can_manage_chat?: boolean;
  }): Promise<ConnectedChat | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('connected_chats')
        .upsert({
          ...chatData,
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'chat_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting connected chat:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Database error upserting connected chat:', error);
      return null;
    }
  }

  /**
   * Get connected chat by chat ID
   */
  async getConnectedChat(chatId: string): Promise<ConnectedChat | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('connected_chats')
        .select('*')
        .eq('chat_id', chatId)
        .single();

      if (error) {
        console.error('Error getting connected chat:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Database error getting connected chat:', error);
      return null;
    }
  }

  /**
   * Get all connected chats
   */
  async getAllConnectedChats(): Promise<ConnectedChat[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('connected_chats')
        .select('*')
        .order('last_activity', { ascending: false });

      if (error) {
        console.error('Error getting all connected chats:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Database error getting all connected chats:', error);
      return [];
    }
  }

  /**
   * Get active connected chats
   */
  async getActiveConnectedChats(): Promise<ConnectedChat[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('connected_chats')
        .select('*')
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (error) {
        console.error('Error getting active connected chats:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Database error getting active connected chats:', error);
      return [];
    }
  }

  /**
   * Update chat activity
   */
  async updateChatActivity(chatId: string): Promise<void> {
    try {
      await supabaseAdmin
        .from('connected_chats')
        .update({
          last_activity: new Date().toISOString(),
          message_count: supabaseAdmin.rpc('increment_message_count', { chat_id: chatId })
        })
        .eq('chat_id', chatId);
    } catch (error) {
      console.error('Database error updating chat activity:', error);
    }
  }

  /**
   * Store bot message
   */
  async storeBotMessage(messageData: {
    chat_id: string;
    message_id: number;
    template_id?: string;
    content: string;
    parse_mode: 'HTML' | 'Markdown' | 'MarkdownV2';
    variables?: Record<string, any>;
  }): Promise<BotMessage | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('bot_messages')
        .insert({
          ...messageData,
          sent_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error storing bot message:', error);
        return null;
      }

      // Update chat activity
      await this.updateChatActivity(messageData.chat_id);

      return data;
    } catch (error) {
      console.error('Database error storing bot message:', error);
      return null;
    }
  }

  /**
   * Get bot messages for a chat
   */
  async getBotMessages(chatId: string, limit: number = 50): Promise<BotMessage[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('bot_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('sent_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting bot messages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Database error getting bot messages:', error);
      return [];
    }
  }

  /**
   * Store scheduled message
   */
  async storeScheduledMessage(scheduledData: {
    chat_id: string;
    template_id: string;
    variables?: Record<string, any>;
    scheduled_for: string;
    repeat_interval_ms?: number;
  }): Promise<ScheduledMessage | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('scheduled_messages')
        .insert(scheduledData)
        .select()
        .single();

      if (error) {
        console.error('Error storing scheduled message:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Database error storing scheduled message:', error);
      return null;
    }
  }

  /**
   * Get scheduled messages
   */
  async getScheduledMessages(chatId?: string): Promise<ScheduledMessage[]> {
    try {
      let query = supabaseAdmin
        .from('scheduled_messages')
        .select('*')
        .eq('is_active', true)
        .order('scheduled_for', { ascending: true });

      if (chatId) {
        query = query.eq('chat_id', chatId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error getting scheduled messages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Database error getting scheduled messages:', error);
      return [];
    }
  }

  /**
   * Update scheduled message
   */
  async updateScheduledMessage(id: number, updates: Partial<ScheduledMessage>): Promise<ScheduledMessage | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('scheduled_messages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating scheduled message:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Database error updating scheduled message:', error);
      return null;
    }
  }

  /**
   * Delete scheduled message
   */
  async deleteScheduledMessage(id: number): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('scheduled_messages')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting scheduled message:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Database error deleting scheduled message:', error);
      return false;
    }
  }

  /**
   * Get chat statistics
   */
  async getChatStatistics(): Promise<{
    totalChats: number;
    activeChats: number;
    totalMessages: number;
    chatsByType: Record<string, number>;
  }> {
    try {
      const [chatsResult, messagesResult] = await Promise.all([
        supabaseAdmin
          .from('connected_chats')
          .select('chat_type, is_active'),
        supabaseAdmin
          .from('bot_messages')
          .select('id', { count: 'exact' })
      ]);

      const chats = chatsResult.data || [];
      const totalMessages = messagesResult.count || 0;

      const totalChats = chats.length;
      const activeChats = chats.filter(chat => chat.is_active).length;
      
      const chatsByType = chats.reduce((acc, chat) => {
        acc[chat.chat_type] = (acc[chat.chat_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalChats,
        activeChats,
        totalMessages,
        chatsByType
      };
    } catch (error) {
      console.error('Database error getting chat statistics:', error);
      return {
        totalChats: 0,
        activeChats: 0,
        totalMessages: 0,
        chatsByType: {}
      };
    }
  }
}
