/**
 * Telegram Group Management Utilities
 * Provides functions to manage bot in Telegram groups
 */

export interface GroupInfo {
  id: number;
  title: string;
  type: string;
  username?: string;
  description?: string;
  invite_link?: string;
}

export interface BotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
  supports_inline_queries: boolean;
}

export interface ChatMember {
  user: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username?: string;
  };
  status: 'creator' | 'administrator' | 'member' | 'restricted' | 'left' | 'kicked';
  can_be_edited?: boolean;
  can_manage_chat?: boolean;
  can_delete_messages?: boolean;
  can_manage_video_chats?: boolean;
  can_restrict_members?: boolean;
  can_promote_members?: boolean;
  can_change_info?: boolean;
  can_invite_users?: boolean;
  can_post_messages?: boolean;
  can_edit_messages?: boolean;
  can_pin_messages?: boolean;
  can_manage_topics?: boolean;
}

export class TelegramGroupManager {
  private botToken: string;
  private apiBaseUrl: string;

  constructor(botToken: string, apiBaseUrl: string = 'https://api.telegram.org') {
    this.botToken = botToken;
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Get bot information
   */
  async getBotInfo(): Promise<BotInfo> {
    const response = await fetch(`${this.apiBaseUrl}/bot${this.botToken}/getMe`);
    const result = await response.json();
    
    if (!result.ok) {
      throw new Error(`Failed to get bot info: ${result.description}`);
    }
    
    return result.result;
  }

  /**
   * Get group information
   */
  async getGroupInfo(chatId: string | number): Promise<GroupInfo> {
    const response = await fetch(`${this.apiBaseUrl}/bot${this.botToken}/getChat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId })
    });
    
    const result = await response.json();
    
    if (!result.ok) {
      throw new Error(`Failed to get group info: ${result.description}`);
    }
    
    return result.result;
  }

  /**
   * Get bot's status in a group
   */
  async getBotStatus(chatId: string | number): Promise<ChatMember | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/bot${this.botToken}/getChatMember`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: chatId,
          user_id: (await this.getBotInfo()).id
        })
      });
      
      const result = await response.json();
      
      if (!result.ok) {
        return null;
      }
      
      return result.result;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if bot is admin in the group
   */
  async isBotAdmin(chatId: string | number): Promise<boolean> {
    const status = await this.getBotStatus(chatId);
    return status?.status === 'administrator' || status?.status === 'creator';
  }

  /**
   * Check if bot can send messages in the group
   */
  async canBotSendMessages(chatId: string | number): Promise<boolean> {
    const status = await this.getBotStatus(chatId);
    return status?.can_post_messages === true || status?.status === 'creator';
  }

  /**
   * Send message to group
   */
  async sendMessage(
    chatId: string | number, 
    message: string, 
    options: {
      parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
      replyToMessageId?: number;
      disableWebPagePreview?: boolean;
    } = {}
  ): Promise<{ messageId: number; chat: GroupInfo }> {
    const response = await fetch(`${this.apiBaseUrl}/bot${this.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: options.parseMode || 'HTML',
        reply_to_message_id: options.replyToMessageId,
        disable_web_page_preview: options.disableWebPagePreview || false
      })
    });

    const result = await response.json();

    if (!result.ok) {
      throw new Error(`Failed to send message: ${result.description}`);
    }

    return {
      messageId: result.result.message_id,
      chat: result.result.chat
    };
  }

  /**
   * Get recent updates (useful for finding group chat IDs)
   */
  async getUpdates(offset?: number, limit: number = 10): Promise<any[]> {
    const response = await fetch(`${this.apiBaseUrl}/bot${this.botToken}/getUpdates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offset,
        limit,
        timeout: 0
      })
    });

    const result = await response.json();

    if (!result.ok) {
      throw new Error(`Failed to get updates: ${result.description}`);
    }

    return result.result;
  }

  /**
   * Generate group setup instructions
   */
  async generateSetupInstructions(chatId?: string | number): Promise<string> {
    const botInfo = await this.getBotInfo();
    let instructions = `🤖 Bot Setup Instructions for ${botInfo.first_name} (@${botInfo.username})\n\n`;
    
    instructions += `1. Add the bot to your group:\n`;
    instructions += `   - Search for @${botInfo.username} in Telegram\n`;
    instructions += `   - Add the bot to your group\n\n`;
    
    instructions += `2. Make the bot an admin:\n`;
    instructions += `   - Go to group settings\n`;
    instructions += `   - Administrators → Add Admin\n`;
    instructions += `   - Select @${botInfo.username}\n`;
    instructions += `   - Enable "Post Messages" permission\n`;
    instructions += `   - Enable "Edit Messages" permission (optional)\n`;
    instructions += `   - Enable "Delete Messages" permission (optional)\n\n`;
    
    instructions += `3. Get your group chat ID:\n`;
    instructions += `   - Send a message in the group\n`;
    instructions += `   - Visit: https://api.telegram.org/bot${this.botToken}/getUpdates\n`;
    instructions += `   - Look for "chat":{"id":-123456789} in the response\n`;
    instructions += `   - The negative number is your group chat ID\n\n`;
    
    if (chatId) {
      try {
        const groupInfo = await this.getGroupInfo(chatId);
        const botStatus = await this.getBotStatus(chatId);
        
        instructions += `📊 Current Status:\n`;
        instructions += `   Group: ${groupInfo.title}\n`;
        instructions += `   Bot Status: ${botStatus?.status || 'Not in group'}\n`;
        instructions += `   Can Send Messages: ${botStatus?.can_post_messages ? 'Yes' : 'No'}\n`;
        instructions += `   Is Admin: ${botStatus?.status === 'administrator' || botStatus?.status === 'creator' ? 'Yes' : 'No'}\n\n`;
      } catch (error) {
        instructions += `❌ Could not check current status. Make sure the bot is added to the group.\n\n`;
      }
    }
    
    instructions += `4. Test the setup:\n`;
    instructions += `   - Run: node send-group-message.js "Test message"\n`;
    instructions += `   - Or use the API: POST /api/bot/send-message\n\n`;
    
    return instructions;
  }
}
