import { NextRequest, NextResponse } from "next/server";
import { ChatDatabaseService } from "@/lib/chat-database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const chatId = searchParams.get('chatId');

    const chatDbService = new ChatDatabaseService();

    switch (action) {
      case 'all':
        const allChats = await chatDbService.getActiveChats();
        return NextResponse.json({ success: true, data: allChats });

      case 'active':
        const activeChats = await chatDbService.getActiveChats();
        return NextResponse.json({ success: true, data: activeChats });

      case 'single':
        if (!chatId) {
          return NextResponse.json(
            { error: 'chatId parameter is required' },
            { status: 400 }
          );
        }
        const chat = await chatDbService.getChat(chatId);
        return NextResponse.json({ success: true, data: chat });

      case 'statistics':
        const stats = await chatDbService.getChatStats();
        return NextResponse.json({ success: true, data: stats });

      default:
        return NextResponse.json({
          success: true,
          message: 'Chats API',
          availableActions: [
            'all - Get all chats',
            'active - Get active chats',
            'single?chatId=CHAT_ID - Get specific chat',
            'statistics - Get chat statistics'
          ]
        });
    }

  } catch (error) {
    console.error('Chats API error:', error);
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

    const chatDbService = new ChatDatabaseService();

    switch (action) {
      case 'update-chat':
        const { chatId: updateChatId, ...chatData } = data;
        
        if (!updateChatId) {
          return NextResponse.json(
            { error: 'chatId is required' },
            { status: 400 }
          );
        }

        const updatedChat = await chatDbService.upsertChat({
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

        await chatDbService.updateChatActivity(activityChatId);
        return NextResponse.json({ success: true, message: 'Activity updated' });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Chats POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
