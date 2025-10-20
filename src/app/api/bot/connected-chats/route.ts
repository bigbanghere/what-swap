import { NextRequest, NextResponse } from "next/server";
import { TelegramDatabaseService } from "@/lib/telegram-database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const chatId = searchParams.get('chatId');
    const limit = searchParams.get('limit');

    const dbService = new TelegramDatabaseService();

    switch (action) {
      case 'all':
        const allChats = await dbService.getAllConnectedChats();
        return NextResponse.json({ success: true, data: allChats });

      case 'active':
        const activeChats = await dbService.getActiveConnectedChats();
        return NextResponse.json({ success: true, data: activeChats });

      case 'single':
        if (!chatId) {
          return NextResponse.json(
            { error: 'chatId parameter is required' },
            { status: 400 }
          );
        }
        const chat = await dbService.getConnectedChat(chatId);
        return NextResponse.json({ success: true, data: chat });

      case 'messages':
        if (!chatId) {
          return NextResponse.json(
            { error: 'chatId parameter is required' },
            { status: 400 }
          );
        }
        const messages = await dbService.getBotMessages(chatId, limit ? parseInt(limit) : 50);
        return NextResponse.json({ success: true, data: messages });

      case 'statistics':
        const stats = await dbService.getChatStatistics();
        return NextResponse.json({ success: true, data: stats });

      default:
        return NextResponse.json({
          success: true,
          message: 'Connected chats API',
          availableActions: [
            'all - Get all connected chats',
            'active - Get active connected chats',
            'single?chatId=CHAT_ID - Get specific chat',
            'messages?chatId=CHAT_ID&limit=LIMIT - Get chat messages',
            'statistics - Get chat statistics'
          ]
        });
    }

  } catch (error) {
    console.error('Connected chats API error:', error);
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
    const { action, ...data } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: 'action is required' },
        { status: 400 }
      );
    }

    const dbService = new TelegramDatabaseService();

    switch (action) {
      case 'update-chat':
        const { chatId: updateChatId, ...chatData } = data;
        
        if (!updateChatId) {
          return NextResponse.json(
            { error: 'chatId is required' },
            { status: 400 }
          );
        }

        const updatedChat = await dbService.upsertConnectedChat({
          chat_id: updateChatId,
          ...chatData
        });

        return NextResponse.json({ success: true, data: updatedChat });

      case 'update-activity':
        const { chatId: activityChatId } = data;
        
        if (!activityChatId) {
          return NextResponse.json(
            { error: 'chatId is required' },
            { status: 400 }
          );
        }

        await dbService.updateChatActivity(activityChatId);
        return NextResponse.json({ success: true, message: 'Activity updated' });

      case 'store-message':
        const { chatId: messageChatId, messageId, templateId, content, parseMode, variables } = data;
        
        if (!messageChatId || !messageId || !content) {
          return NextResponse.json(
            { error: 'chatId, messageId, and content are required' },
            { status: 400 }
          );
        }

        const storedMessage = await dbService.storeBotMessage({
          chat_id: messageChatId,
          message_id: messageId,
          template_id: templateId,
          content,
          parse_mode: parseMode || 'HTML',
          variables
        });

        return NextResponse.json({ success: true, data: storedMessage });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Connected chats POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
