import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Check if bot token is configured
    if (!process.env.BOT_TOKEN) {
      return NextResponse.json(
        { error: 'Bot token not configured' },
        { status: 500 }
      );
    }

    const { chatId, message, parseMode = 'HTML', replyToMessageId } = await request.json();

    // Validate required parameters
    if (!chatId || !message) {
      return NextResponse.json(
        { error: 'chatId and message are required' },
        { status: 400 }
      );
    }

    // Send message to Telegram
    const response = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: parseMode,
        reply_to_message_id: replyToMessageId,
        disable_web_page_preview: false
      })
    });

    const result = await response.json();

    if (!result.ok) {
      console.error('Telegram API error:', result);
      return NextResponse.json(
        { error: `Failed to send message: ${result.description}`, details: result },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      messageId: result.result.message_id,
      chat: result.result.chat
    });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Send message endpoint is running!',
    usage: {
      method: 'POST',
      endpoint: '/api/bot/send-message',
      body: {
        chatId: 'string (required) - Group/chat ID',
        message: 'string (required) - Message text',
        parseMode: 'string (optional) - HTML, Markdown, or MarkdownV2',
        replyToMessageId: 'number (optional) - ID of message to reply to'
      }
    }
  });
}
