import { NextRequest, NextResponse } from "next/server";
import { TelegramGroupManager } from "@/lib/telegram-group-manager";

export async function GET(request: NextRequest) {
  try {
    if (!process.env.BOT_TOKEN) {
      return NextResponse.json(
        { error: 'Bot token not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const chatId = searchParams.get('chatId');

    const manager = new TelegramGroupManager(process.env.BOT_TOKEN);

    switch (action) {
      case 'bot-info':
        const botInfo = await manager.getBotInfo();
        return NextResponse.json({ success: true, data: botInfo });

      case 'group-info':
        if (!chatId) {
          return NextResponse.json(
            { error: 'chatId parameter is required' },
            { status: 400 }
          );
        }
        const groupInfo = await manager.getGroupInfo(chatId);
        return NextResponse.json({ success: true, data: groupInfo });

      case 'bot-status':
        if (!chatId) {
          return NextResponse.json(
            { error: 'chatId parameter is required' },
            { status: 400 }
          );
        }
        const botStatus = await manager.getBotStatus(chatId);
        return NextResponse.json({ success: true, data: botStatus });

      case 'setup-instructions':
        const instructions = await manager.generateSetupInstructions(chatId || undefined);
        return NextResponse.json({ success: true, data: { instructions } });

      case 'updates':
        const offset = searchParams.get('offset');
        const updates = await manager.getUpdates(
          offset ? parseInt(offset) : undefined,
          20
        );
        return NextResponse.json({ success: true, data: updates });

      default:
        return NextResponse.json({
          success: true,
          message: 'Group management API',
          availableActions: [
            'bot-info - Get bot information',
            'group-info?chatId=CHAT_ID - Get group information',
            'bot-status?chatId=CHAT_ID - Get bot status in group',
            'setup-instructions?chatId=CHAT_ID - Get setup instructions',
            'updates?offset=OFFSET - Get recent updates'
          ]
        });
    }

  } catch (error) {
    console.error('Group management error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.BOT_TOKEN) {
      return NextResponse.json(
        { error: 'Bot token not configured' },
        { status: 500 }
      );
    }

    const { action, chatId, message, options = {} } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: 'action is required' },
        { status: 400 }
      );
    }

    const manager = new TelegramGroupManager(process.env.BOT_TOKEN);

    switch (action) {
      case 'send-message':
        if (!chatId || !message) {
          return NextResponse.json(
            { error: 'chatId and message are required' },
            { status: 400 }
          );
        }

        // Check if bot can send messages
        const canSend = await manager.canBotSendMessages(chatId);
        if (!canSend) {
          return NextResponse.json(
            { error: 'Bot cannot send messages in this group. Make sure it is admin with "Post Messages" permission.' },
            { status: 403 }
          );
        }

        const result = await manager.sendMessage(chatId, message, options);
        return NextResponse.json({ success: true, data: result });

      case 'check-permissions':
        if (!chatId) {
          return NextResponse.json(
            { error: 'chatId is required' },
            { status: 400 }
          );
        }

        const isAdmin = await manager.isBotAdmin(chatId);
        const canSendMessages = await manager.canBotSendMessages(chatId);
        const botStatus = await manager.getBotStatus(chatId);

        return NextResponse.json({
          success: true,
          data: {
            isAdmin,
            canSendMessages,
            status: botStatus?.status,
            permissions: {
              canPostMessages: botStatus?.can_post_messages,
              canEditMessages: botStatus?.can_edit_messages,
              canDeleteMessages: botStatus?.can_delete_messages,
              canManageChat: botStatus?.can_manage_chat
            }
          }
        });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Group management POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
