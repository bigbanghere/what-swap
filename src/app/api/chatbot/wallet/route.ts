import { NextRequest, NextResponse } from 'next/server';
import { walletAssistant } from '@/lib/wallet-assistant-bot';

/**
 * Wallet Assistant Chatbot API
 * POST /api/chatbot/wallet
 * 
 * Body: {
 *   message: string;
 *   walletAddress?: string;
 *   context?: WalletContext;
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, walletAddress, context } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Call wallet assistant
    const result = await walletAssistant({
      message,
      walletAddress,
      context,
    });

    return NextResponse.json({
      response: result.response,
      actionable: result.actionable,
      source: result.source,
    });
  } catch (error) {
    console.error('Wallet chatbot API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// CORS support
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

