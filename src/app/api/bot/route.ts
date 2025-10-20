import { Bot } from "grammy";
import { NextRequest, NextResponse } from "next/server";
import { TelegramDatabaseService } from "@/lib/telegram-database";

// Function to create and configure the bot
async function createBot(token: string) {
  // Fetch bot info from Telegram API
  const botInfoResponse = await fetch(`https://api.telegram.org/bot${token}/getMe`);
  const botInfo = await botInfoResponse.json();
  
  if (!botInfo.ok) {
    throw new Error(`Failed to get bot info: ${botInfo.description}`);
  }
  
  const bot = new Bot(token, {
    botInfo: botInfo.result
  });

  // Initialize database service
  const dbService = new TelegramDatabaseService();

  // Middleware to store chat data on every update
  bot.use(async (ctx, next) => {
    try {
      // Store chat information if available
      if (ctx.chat) {
        const chatData = {
          chat_id: ctx.chat.id.toString(),
          chat_type: ctx.chat.type as 'private' | 'group' | 'supergroup' | 'channel',
          title: 'title' in ctx.chat ? ctx.chat.title : undefined,
          username: 'username' in ctx.chat ? ctx.chat.username : undefined,
          description: 'description' in ctx.chat ? (ctx.chat.description as string) : undefined,
          invite_link: 'invite_link' in ctx.chat ? (ctx.chat.invite_link as string) : undefined,
        };

        await dbService.upsertConnectedChat(chatData);
      }
    } catch (error) {
      console.error('Error storing chat data:', error);
    }
    
    await next();
  });

  // Add some basic commands
  bot.command("start", async (ctx) => {
    try {
      const message = await ctx.reply("Nice to meet you here. Swap any tokens at best rate with What Swap!", {
        reply_markup: {
          inline_keyboard: [
            [{
              text: "Go To What Swap!",
              url: "https://t.me/what_swap_bot/whatswap?mode=compact"
            }]
          ]
        }
      });

      // Store the bot message
      if (message && ctx.chat) {
        await dbService.storeBotMessage({
          chat_id: ctx.chat.id.toString(),
          message_id: message.message_id,
          template_id: 'start',
          content: message.text || '',
          parse_mode: 'HTML'
        });
      }
    } catch (error) {
      console.log('Could not send start message to chat:', ctx.chat?.id, error instanceof Error ? error.message : String(error));
    }
  });

  bot.command("help", async (ctx) => {
    try {
      await ctx.reply("🤖 Bot Help\n\nCommands:\n• /start - Welcome message\n• /help - Show this help\n• /ping - Test bot response\n\nThis bot is powered by Next.js and Grammy!", {
        reply_markup: {
          inline_keyboard: [
            [{
              text: "🚀 Go To What Swap",
              url: "https://t.me/what_swap_bot/whatswap?mode=compact"
            }]
          ]
        }
      });
    } catch (error) {
      console.log('Could not send help message to chat:', ctx.chat?.id, error instanceof Error ? error.message : String(error));
    }
  });

  bot.command("ping", async (ctx) => {
    try {
      await ctx.reply("🏓 Pong! Bot is working perfectly!");
    } catch (error) {
      console.log('Could not send ping message to chat:', ctx.chat?.id, error instanceof Error ? error.message : String(error));
    }
  });

  // Handle any other text messages (but not commands)
  bot.on("message:text", async (ctx) => {
    try {
      const message = ctx.message.text;
      
      // Skip if it's a command (starts with /)
      if (message.startsWith('/')) {
        return;
      }
      
      // Simple responses based on message content
      if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
        await ctx.reply('Hello there! 👋 How can I help you today?');
      } else if (message.toLowerCase().includes('thanks') || message.toLowerCase().includes('thank you')) {
        await ctx.reply('You\'re welcome! 😊');
      } else if (message.toLowerCase().includes('bot')) {
        await ctx.reply('Yes, I\'m a bot! 🤖 I\'m running on Next.js with Grammy framework.');
      } else {
        await ctx.reply('I received your message! Use /help to see available commands.');
      }
    } catch (error) {
      console.log('Could not send text message to chat:', ctx.chat?.id, error instanceof Error ? error.message : String(error));
    }
  });

  // Error handling
  bot.catch((err) => {
    console.error('Bot error:', err);
  });

  return bot;
}

export async function POST(request: NextRequest) {
  try {
    // Check if bot token is configured
    if (!process.env.BOT_TOKEN) {
      return NextResponse.json(
        { error: 'Bot token not configured' },
        { status: 500 }
      );
    }

    // Create bot instance
    const bot = await createBot(process.env.BOT_TOKEN);

    // Parse the webhook update
    const update = await request.json();
    
    // Process the update
    await bot.handleUpdate(update);
    
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Bot webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Telegram bot webhook endpoint is running!',
    timestamp: new Date().toISOString(),
    endpoints: {
      webhook: 'POST /api/bot',
      health: 'GET /api/bot'
    }
  });
}
