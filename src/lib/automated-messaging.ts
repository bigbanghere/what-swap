/**
 * Automated Messaging System for Telegram Groups
 * Provides scheduled and event-based message sending
 */

import { TelegramGroupManager } from './telegram-group-manager';

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  parseMode: 'HTML' | 'Markdown' | 'MarkdownV2';
  variables?: string[]; // Variables that can be replaced in the template
}

export interface ScheduledMessage {
  id: string;
  chatId: string | number;
  templateId: string;
  variables?: Record<string, string>;
  scheduledFor: Date;
  repeatInterval?: number; // in milliseconds
  isActive: boolean;
  lastSent?: Date;
  nextRun?: Date;
}

export interface MessageEvent {
  id: string;
  name: string;
  trigger: 'time' | 'interval' | 'webhook' | 'manual';
  templateId: string;
  chatIds: (string | number)[];
  config: Record<string, any>;
  isActive: boolean;
}

export class AutomatedMessagingSystem {
  private manager: TelegramGroupManager;
  private templates: Map<string, MessageTemplate> = new Map();
  private scheduledMessages: Map<string, ScheduledMessage> = new Map();
  private events: Map<string, MessageEvent> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(botToken: string) {
    this.manager = new TelegramGroupManager(botToken);
  }

  /**
   * Add a message template
   */
  addTemplate(template: MessageTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Get all templates
   */
  getTemplates(): MessageTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): MessageTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Process template with variables
   */
  processTemplate(templateId: string, variables: Record<string, string> = {}): string {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    let content = template.content;
    
    // Replace variables in the template
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      content = content.replace(regex, value);
    });

    return content;
  }

  /**
   * Schedule a message
   */
  scheduleMessage(scheduledMessage: ScheduledMessage): void {
    this.scheduledMessages.set(scheduledMessage.id, scheduledMessage);
    this.scheduleNextRun(scheduledMessage.id);
  }

  /**
   * Cancel a scheduled message
   */
  cancelScheduledMessage(id: string): void {
    const scheduled = this.scheduledMessages.get(id);
    if (scheduled) {
      scheduled.isActive = false;
      const interval = this.intervals.get(id);
      if (interval) {
        clearInterval(interval);
        this.intervals.delete(id);
      }
    }
  }

  /**
   * Send a message immediately
   */
  async sendMessage(
    chatId: string | number, 
    templateId: string, 
    variables: Record<string, string> = {}
  ): Promise<{ messageId: number; chat: any }> {
    const content = this.processTemplate(templateId, variables);
    return await this.manager.sendMessage(chatId, content, {
      parseMode: this.getTemplate(templateId)?.parseMode || 'HTML'
    });
  }

  /**
   * Send message to multiple chats
   */
  async sendToMultipleChats(
    chatIds: (string | number)[], 
    templateId: string, 
    variables: Record<string, string> = {}
  ): Promise<Array<{ chatId: string | number; success: boolean; result?: any; error?: string }>> {
    const results = [];
    
    for (const chatId of chatIds) {
      try {
        const result = await this.sendMessage(chatId, templateId, variables);
        results.push({ chatId, success: true, result });
      } catch (error) {
        results.push({ 
          chatId, 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    }
    
    return results;
  }

  /**
   * Create a recurring message
   */
  createRecurringMessage(
    id: string,
    chatId: string | number,
    templateId: string,
    intervalMs: number,
    variables: Record<string, string> = {}
  ): void {
    const scheduledMessage: ScheduledMessage = {
      id,
      chatId,
      templateId,
      variables,
      scheduledFor: new Date(Date.now() + intervalMs),
      repeatInterval: intervalMs,
      isActive: true
    };

    this.scheduleMessage(scheduledMessage);
  }

  /**
   * Create a one-time scheduled message
   */
  createScheduledMessage(
    id: string,
    chatId: string | number,
    templateId: string,
    scheduledFor: Date,
    variables: Record<string, string> = {}
  ): void {
    const scheduledMessage: ScheduledMessage = {
      id,
      chatId,
      templateId,
      variables,
      scheduledFor,
      isActive: true
    };

    this.scheduleMessage(scheduledMessage);
  }

  /**
   * Get all scheduled messages
   */
  getScheduledMessages(): ScheduledMessage[] {
    return Array.from(this.scheduledMessages.values());
  }

  /**
   * Get active scheduled messages
   */
  getActiveScheduledMessages(): ScheduledMessage[] {
    return Array.from(this.scheduledMessages.values()).filter(msg => msg.isActive);
  }

  /**
   * Schedule the next run for a message
   */
  private scheduleNextRun(id: string): void {
    const scheduled = this.scheduledMessages.get(id);
    if (!scheduled || !scheduled.isActive) return;

    const now = new Date();
    const nextRun = scheduled.repeatInterval 
      ? new Date(now.getTime() + scheduled.repeatInterval)
      : scheduled.scheduledFor;

    if (nextRun <= now) {
      // Run immediately
      this.executeScheduledMessage(id);
      return;
    }

    scheduled.nextRun = nextRun;
    const delay = nextRun.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      this.executeScheduledMessage(id);
    }, delay);

    this.intervals.set(id, timeout);
  }

  /**
   * Execute a scheduled message
   */
  private async executeScheduledMessage(id: string): Promise<void> {
    const scheduled = this.scheduledMessages.get(id);
    if (!scheduled || !scheduled.isActive) return;

    try {
      await this.sendMessage(scheduled.chatId, scheduled.templateId, scheduled.variables);
      scheduled.lastSent = new Date();
      
      console.log(`✅ Scheduled message ${id} sent successfully`);
      
      // Schedule next run if it's a recurring message
      if (scheduled.repeatInterval) {
        this.scheduleNextRun(id);
      } else {
        // One-time message, remove it
        this.scheduledMessages.delete(id);
        const interval = this.intervals.get(id);
        if (interval) {
          clearInterval(interval);
          this.intervals.delete(id);
        }
      }
    } catch (error) {
      console.error(`❌ Failed to send scheduled message ${id}:`, error);
      
      // For recurring messages, schedule retry
      if (scheduled.repeatInterval) {
        // Retry in 5 minutes
        setTimeout(() => this.scheduleNextRun(id), 5 * 60 * 1000);
      }
    }
  }

  /**
   * Create default templates
   */
  createDefaultTemplates(): void {
    const templates: MessageTemplate[] = [
      {
        id: 'welcome',
        name: 'Welcome Message',
        content: '🎉 Welcome to {{groupName}}!\n\nWe\'re excited to have you here. Feel free to ask any questions!',
        parseMode: 'HTML',
        variables: ['groupName']
      },
      {
        id: 'daily-update',
        name: 'Daily Update',
        content: '📊 Daily Update - {{date}}\n\n{{content}}',
        parseMode: 'HTML',
        variables: ['date', 'content']
      },
      {
        id: 'announcement',
        name: 'Announcement',
        content: '📢 **{{title}}**\n\n{{message}}\n\n_Posted on {{date}}_',
        parseMode: 'Markdown',
        variables: ['title', 'message', 'date']
      },
      {
        id: 'reminder',
        name: 'Reminder',
        content: '⏰ Reminder: {{message}}\n\nTime: {{time}}',
        parseMode: 'HTML',
        variables: ['message', 'time']
      }
    ];

    templates.forEach(template => this.addTemplate(template));
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    this.scheduledMessages.clear();
    this.templates.clear();
    this.events.clear();
  }
}
