"use server";

import { z } from 'zod';
import { getCustomFinanceModel } from './custom-finance-model';

// Optional Groq support (only if installed)
let groq: any = null;
let generateText: any = null;
let streamText: any = null;

try {
  const groqModule = require('@ai-sdk/groq');
  const aiModule = require('ai');
  groq = groqModule.groq;
  generateText = aiModule.generateText;
  streamText = aiModule.streamText;
} catch (e) {
  // Groq not installed, will only use Hugging Face
  console.log('Groq not installed, using Hugging Face only');
}

/**
 * Finance AI Agent for What Swap
 * 
 * PRIMARY: Uses Groq (completely free, 30 RPM, no credit card)
 * FALLBACK: Custom models or other free providers
 * 
 * Free tier supports:
 * - 30 requests/minute = 43,200 requests/day
 * - Llama 3.3 70B (high quality)
 * - Ultra-fast inference (~200 tokens/sec)
 */

const FINANCE_SYSTEM_PROMPT = `You are an expert financial AI assistant for What Swap, a TON blockchain token swap service.

Your capabilities:
- Analyze tokens and provide insights
- Recommend swap strategies based on market conditions
- Explain token metrics and fundamentals
- Assess risk levels for swaps
- Provide personalized recommendations based on user context
- Answer questions about DeFi, tokens, and crypto trading

Guidelines:
- Be concise and actionable (max 3-4 sentences unless detailed analysis needed)
- Use emojis sparingly but effectively
- Always emphasize that this is NOT financial advice
- Reference specific token data when available
- If you don't know something, say so honestly

Format responses in a friendly, helpful tone suitable for a Telegram bot.`;

interface FinanceAgentOptions {
  message: string;
  context?: {
    userWallet?: string;
    recentSwaps?: Array<{ from: string; to: string; amount: string }>;
    selectedTokens?: Array<{ symbol: string; address: string }>;
    tokenData?: any;
  };
  streaming?: boolean;
}

interface TokenAnalysis {
  symbol: string;
  address: string;
  price?: number;
  marketCap?: number;
  volume24h?: number;
  liquidity?: number;
}

/**
 * Main finance agent - handles all AI interactions
 */
export async function financeAgent({
  message,
  context = {},
  streaming = false,
}: FinanceAgentOptions) {
  try {
    const prompt = buildPrompt(message, context);

    // Try custom model first if enabled
    if (process.env.USE_CUSTOM_MODEL === 'true') {
      try {
        const customModel = getCustomFinanceModel();
        const customResult = await customModel.generate({
          prompt,
          systemPrompt: FINANCE_SYSTEM_PROMPT,
          temperature: 0.7,
          maxTokens: 500,
        });

        if (customResult.response && customResult.source !== 'fallback') {
          return {
            response: customResult.response,
            usage: customResult.usage ? {
              promptTokens: customResult.usage.promptTokens,
              completionTokens: customResult.usage.completionTokens,
            } : null,
            finishReason: 'stop',
            modelSource: customResult.source,
          };
        }
      } catch (error) {
        console.warn('Custom model failed, using Groq fallback:', error);
      }
    }

    // Fallback to Groq (free, fast) - if available
    if (process.env.GROQ_API_KEY && groq && generateText) {
      if (streaming && streamText) {
        try {
          const stream = streamText({
            model: groq('llama-3.3-70b-versatile'),
            system: FINANCE_SYSTEM_PROMPT,
            prompt,
            temperature: 0.7,
            maxTokens: 500,
          });
          return stream;
        } catch (error) {
          console.warn('Groq streaming failed:', error);
        }
      }

      try {
        const result = await generateText({
          model: groq('llama-3.3-70b-versatile'),
          system: FINANCE_SYSTEM_PROMPT,
          prompt,
          temperature: 0.7,
          maxTokens: 500,
        });

        return {
          response: result.text,
          usage: result.usage,
          finishReason: result.finishReason,
          modelSource: 'groq',
        };
      } catch (error) {
        console.warn('Groq failed:', error);
      }
    }
  } catch (error) {
    console.error('Finance agent error:', error);
    
    // Fallback to simpler response if AI fails
    return {
      response: "I'm having trouble processing that right now. Please try rephrasing your question or use specific token addresses.",
      usage: null,
      finishReason: 'error',
      modelSource: 'error',
    };
  }
}

/**
 * Analyze a specific token
 */
export async function analyzeToken(token: TokenAnalysis) {
  const message = `Analyze this token:
- Symbol: ${token.symbol}
- Address: ${token.address}
${token.price ? `- Price: $${token.price}` : ''}
${token.marketCap ? `- Market Cap: $${token.marketCap}` : ''}
${token.volume24h ? `- 24h Volume: $${token.volume24h}` : ''}
${token.liquidity ? `- Liquidity: $${token.liquidity}` : ''}

Provide a brief analysis including:
1. Overall assessment
2. Risk level (Low/Medium/High)
3. Recommendation for swapping`;

  return financeAgent({
    message,
    context: { tokenData: token },
  });
}

/**
 * Get swap recommendation
 */
export async function getSwapRecommendation(
  fromToken: string,
  toToken: string,
  amount?: string
) {
  const message = `Should I swap ${amount || ''} ${fromToken} to ${toToken}?
Consider:
- Current market conditions
- Slippage risks
- Best timing
- Alternative options`;

  return financeAgent({
    message,
    context: {
      selectedTokens: [
        { symbol: fromToken, address: '' },
        { symbol: toToken, address: '' },
      ],
    },
  });
}

/**
 * Personalized recommendations based on user history
 */
export async function getPersonalizedRecommendations(
  recentSwaps: Array<{ from: string; to: string; amount: string }>,
  walletBalance?: { token: string; amount: string }[]
) {
  const swapHistory = recentSwaps
    .slice(-5)
    .map(s => `${s.amount} ${s.from} → ${s.to}`)
    .join('\n');

  const message = `Based on this user's swap history:
${swapHistory}

${walletBalance ? `Current holdings: ${walletBalance.map(b => `${b.amount} ${b.token}`).join(', ')}` : ''}

Provide personalized swap recommendations and suggestions for portfolio optimization.`;

  return financeAgent({
    message,
    context: { recentSwaps },
  });
}

/**
 * Market sentiment analysis
 */
export async function analyzeMarketSentiment(tokens: string[]) {
  const message = `Analyze market sentiment for these tokens: ${tokens.join(', ')}
Consider:
- Overall market trends
- Risk factors
- Best opportunities
- Timing recommendations`;

  return financeAgent({
    message,
    context: {},
  });
}

/**
 * Build context-aware prompt
 */
function buildPrompt(message: string, context: FinanceAgentOptions['context']) {
  let contextString = '';

  if (context?.recentSwaps && context.recentSwaps.length > 0) {
    contextString += `\n\nUser's Recent Swap History:\n`;
    context.recentSwaps.forEach((swap, i) => {
      contextString += `${i + 1}. ${swap.amount} ${swap.from} → ${swap.to}\n`;
    });
  }

  if (context?.selectedTokens && context.selectedTokens.length > 0) {
    contextString += `\n\nCurrently Selected Tokens:\n`;
    context.selectedTokens.forEach((token) => {
      contextString += `- ${token.symbol} (${token.address.substring(0, 10)}...)\n`;
    });
  }

  if (context?.tokenData) {
    contextString += `\n\nToken Data:\n${JSON.stringify(context.tokenData, null, 2)}\n`;
  }

  return `${message}${contextString}`;
}

/**
 * Fallback to cheaper/alternative models if Groq fails
 */
export async function financeAgentWithFallback(options: FinanceAgentOptions) {
  try {
    return await financeAgent(options);
  } catch (error) {
    console.error('Groq failed, trying fallback...', error);
    
    // Here you can implement fallback to Together AI, Gemini Flash, etc.
    // For now, return error message
    return {
      response: "I'm currently experiencing high demand. Please try again in a moment.",
      usage: null,
      finishReason: 'error',
    };
  }
}

