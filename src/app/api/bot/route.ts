import { Bot } from "grammy";
import { NextRequest, NextResponse } from "next/server";
import { ChatDatabaseService } from "@/lib/chat-database";
import { UserDatabaseService } from "@/lib/user-database";
import { swapCoffeeApiClient } from "@/lib/swap-coffee-api";

// Function to validate TON address format
function isValidTONAddress(text: string): boolean {
  // Remove whitespace
  const cleanText = text.trim();
  
  // TON addresses can be in different formats:
  // 1. Raw format: 0:83dfd552e63729b472fcbcc8c45ebcc6691702558b68ec7527e1ba403a0f31a8
  // 2. User-friendly format: UQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH
  // 3. Base64 format: EQAjWFZaH0Xib0VGEwe3148Hg7arST5mhJwDB3YTIS0OFUxJ
  // 4. Other formats: QBKMfjX_a_dsOLm-juxyVZytFP7_KKnzGv6J01kGc72gVBp
  
  // Check for raw format (0: followed by 64 hex characters)
  if (/^0:[0-9a-fA-F]{64}$/.test(cleanText)) {
    return true;
  }
  
  // Check for user-friendly format (UQ followed by base64-like characters)
  if (/^UQ[A-Za-z0-9_-]{46}$/.test(cleanText)) {
    return true;
  }
  
  // Check for base64 format (48 characters, base64-like, no underscores or dashes)
  if (/^[A-Za-z0-9+/]{48}$/.test(cleanText)) {
    return true;
  }
  
  // Check for other TON address formats (47-48 characters, alphanumeric + underscore + dash)
  if (/^[A-Za-z0-9_-]{47,48}$/.test(cleanText)) {
    return true;
  }
  
  return false;
}

// Function to validate token exists via API
async function validateTokenExists(address: string): Promise<{ exists: boolean; token?: any }> {
  try {
    console.log(`🔍 Validating token: ${address}`);
    const token = await swapCoffeeApiClient.getJettonByAddress(address);
    console.log(`✅ Token found: ${token.symbol} (${token.name})`);
    return { exists: true, token };
  } catch (error) {
    console.log(`❌ Token not found: ${address}`, error);
    return { exists: false };
  }
}

// Function to create swap link with startapp parameter
function createSwapLink(tokenAddress: string): string {
  const baseUrl = "https://t.me/what_swap_bot/whatswap";
  const params = new URLSearchParams({
    mode: "compact",
    startapp: tokenAddress
  });
  return `${baseUrl}?${params.toString()}`;
}

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

  // Initialize database services
  const chatDbService = new ChatDatabaseService();
  const userDbService = new UserDatabaseService();

  // Middleware to store chat data and user activity on every update
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

        await chatDbService.upsertChat(chatData);
      }

      // Register/update user data if user is present
      if (ctx.from) {
        await userDbService.upsertUser({
          user_id: ctx.from.id,
          username: ctx.from.username,
          first_name: ctx.from.first_name,
          last_name: ctx.from.last_name,
          language_code: ctx.from.language_code,
          is_bot: ctx.from.is_bot || false,
          is_premium: ctx.from.is_premium || false,
        });
      }
    } catch (error) {
      console.error('Error storing chat/user data:', error);
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
    } catch (error) {
      console.log('Could not send start message to chat:', ctx.chat?.id, error instanceof Error ? error.message : String(error));
    }
  });

  bot.command("help", async (ctx) => {
    try {
      await ctx.reply("🤖 **What Swap Bot Help**\n\n**Commands:**\n• /start - Welcome message\n• /help - Show this help\n• /ping - Test bot response\n\n**Features:**\n• Send any TON token address to get a direct swap link\n• Supports all TON address formats (raw, user-friendly, base64)\n• Automatically validates tokens via API\n\n**Examples:**\n• Send: `EQAjWFZaH0Xib0VGEwe3148Hg7arST5mhJwDB3YTIS0OFUxJ`\n• Send: `0:83dfd552e63729b472fcbcc8c45ebcc6691702558b68ec7527e1ba403a0f31a8`\n\nThis bot is powered by Next.js and Grammy!", {
        parse_mode: 'Markdown',
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
      
      // Check if the message looks like a TON address
      if (isValidTONAddress(message)) {
        console.log(`🔍 Detected TON address: ${message}`);
        
        // Show typing indicator
        await ctx.replyWithChatAction('typing');
        
        // Validate token exists
        const validation = await validateTokenExists(message);
        
        if (validation.exists && validation.token) {
          const token = validation.token;
          const swapLink = createSwapLink(message);
          
          await ctx.reply(
            `[Swap ${token.symbol} on What Swap](${swapLink})`,
            { parse_mode: 'Markdown' }
          );
        } else {
          await ctx.reply(
            `❌ **Token Not Found**\n\n` +
            `The address \`${message}\` does not correspond to a valid token in our database.\n\n` +
            `Please check the address and try again.`,
            { parse_mode: 'Markdown' }
          );
        }
        
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
