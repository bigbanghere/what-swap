import { NextRequest, NextResponse } from "next/server";
import { ChatDatabaseService } from "@/lib/chat-database";

const chatDbService = new ChatDatabaseService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        const stats = await chatDbService.getChatStats();
        return NextResponse.json({ success: true, data: stats });

      case 'active':
        const activeChats = await chatDbService.getActiveChats();
        return NextResponse.json({ success: true, data: activeChats });

      case 'get':
        const chatId = searchParams.get('chatId');
        if (!chatId) {
          return NextResponse.json(
            { error: 'Chat ID is required' },
            { status: 400 }
          );
        }
        const chat = await chatDbService.getChat(chatId);
        if (!chat) {
          return NextResponse.json(
            { error: 'Chat not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: chat });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: stats, active, or get' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in chats API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
