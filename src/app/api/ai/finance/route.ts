import { NextRequest, NextResponse } from 'next/server';
import { financeAgent, financeAgentWithFallback } from '@/lib/ai-finance-agent';

/**
 * Finance AI API Route
 * POST /api/ai/finance
 * 
 * Body: {
 *   message: string;
 *   context?: {
 *     userWallet?: string;
 *     recentSwaps?: Array<{from: string, to: string, amount: string}>;
 *     selectedTokens?: Array<{symbol: string, address: string}>;
 *     tokenData?: any;
 *   };
 *   streaming?: boolean;
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Check for API key (optional, for rate limiting)
    const authHeader = req.headers.get('authorization');
    if (process.env.AI_API_KEY && authHeader !== `Bearer ${process.env.AI_API_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { message, context, streaming = false } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Rate limiting could be added here using @upstash/ratelimit

    // Use fallback for reliability
    const result = await financeAgentWithFallback({
      message,
      context,
      streaming,
    });

    if (streaming && 'toDataStreamResponse' in result) {
      // Return streaming response
      return (result as any).toDataStreamResponse();
    }

    return NextResponse.json({
      response: result.response,
      usage: result.usage,
      finishReason: result.finishReason,
    });
  } catch (error) {
    console.error('Finance AI API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Allow CORS for browser requests (optional)
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

