"use server";

import { swapCoffeeApiClient } from '@/lib/swap-coffee-api';
import { TONBalanceService } from '@/lib/ton-balance-service';

// Optional dependencies (only if installed)
let HfInference: any = null;
let groq: any = null;
let generateText: any = null;

try {
  const hfModule = require('@huggingface/inference');
  HfInference = hfModule.HfInference;
} catch (e) {
  console.log('Hugging Face Inference not installed');
}

try {
  const groqModule = require('@ai-sdk/groq');
  const aiModule = require('ai');
  groq = groqModule.groq;
  generateText = aiModule.generateText;
} catch (e) {
  console.log('Groq not installed');
}

/**
 * Wallet Assistant Bot - Free AI Chatbot
 * 
 * Features:
 * - Help with wallet connections and balances
 * - Analyze blockchain data and token holdings
 * - Provide swap recommendations
 * - Suggest earning strategies
 * 
 * Uses 100% free AI models (Groq/HF)
 */

interface WalletContext {
  walletAddress?: string;
  tonBalance?: string;
  userTokens?: Array<{
    symbol: string;
    balance: string;
    address: string;
    price?: number;
  }>;
  swapHistory?: Array<{
    from: string;
    to: string;
    amount: string;
    timestamp: string;
  }>;
}

interface WalletAssistantOptions {
  message: string;
  walletAddress?: string;
  context?: WalletContext;
}

interface WalletAssistantResponse {
  response: string;
  actionable?: {
    type: 'swap' | 'analyze' | 'connect_wallet' | 'info';
    data?: any;
  };
  source: string;
}

/**
 * Fetch wallet data for context
 */
async function fetchWalletData(walletAddress: string): Promise<WalletContext> {
  try {
    // Get TON balance
    const tonBalance = await TONBalanceService.getTONBalance(walletAddress);
    
    // Get user tokens
    const userTokens = await swapCoffeeApiClient.getUserJettons(walletAddress);
    
    const formattedTokens = userTokens.map(token => ({
      symbol: token.jetton.symbol,
      balance: token.balance,
      address: token.jetton.address,
      price: token.jetton.market_stats?.price_usd, // Price from market stats
    }));

    return {
      walletAddress,
      tonBalance: tonBalance.balanceFormatted,
      userTokens: formattedTokens,
    };
  } catch (error) {
    console.error('Failed to fetch wallet data:', error);
    return {
      walletAddress,
      tonBalance: '0',
      userTokens: [],
    };
  }
}

/**
 * Main wallet assistant function
 */
export async function walletAssistant({
  message,
  walletAddress,
  context,
}: WalletAssistantOptions): Promise<WalletAssistantResponse> {
  // Fetch wallet data if address provided and not in context
  let walletContext = context;
  if (walletAddress && !context?.walletAddress) {
    walletContext = await fetchWalletData(walletAddress);
  }

  // Build context-aware prompt
  const systemPrompt = `You are a helpful wallet assistant for What Swap, a TON blockchain DEX.

Your capabilities:
1. **Wallet Help**: Guide users on connecting wallets, checking balances, understanding addresses
2. **Blockchain Analysis**: Analyze token holdings, portfolio composition, token prices, market data
3. **Swap Recommendations**: Suggest optimal swap strategies based on:
   - Current holdings and balances
   - Market conditions and token prices
   - Slippage and liquidity considerations
   - Risk assessment
4. **Earning Strategies**: Suggest ways to earn:
   - Best swap opportunities for profit
   - Token farming/staking if available
   - Arbitrage opportunities
   - Portfolio optimization

Context available:
${walletContext?.walletAddress ? `- Wallet: ${walletContext.walletAddress.substring(0, 10)}...` : '- Wallet: Not connected'}
${walletContext?.tonBalance ? `- TON Balance: ${walletContext.tonBalance} TON` : ''}
${walletContext?.userTokens && walletContext.userTokens.length > 0 
  ? `- Holdings:\n${walletContext.userTokens.map(t => 
      `  * ${t.symbol}: ${t.balance}${t.price ? ` ($${t.price})` : ''}`
    ).join('\n')}`
  : '- Holdings: None or not loaded'}

Guidelines:
- Be concise and actionable
- When suggesting swaps, mention specific token pairs and amounts if context available
- Always emphasize DYOR (Do Your Own Research) and that this is NOT financial advice
- If wallet not connected, guide user on how to connect
- Reference actual balances and holdings when making recommendations
- For earning strategies, consider current market conditions and user's portfolio
- Use emojis sparingly but effectively (💰 🚀 📊 ⚠️)
- Format responses in a friendly, helpful tone`;

  const userPrompt = message;

  // Try free AI models - Prioritize Hugging Face (free GPU)
  try {
    // Try Hugging Face Inference API first (since user has token and wants HF focus)
    if (process.env.HF_API_TOKEN) {
      try {
        const hf = new HfInference(process.env.HF_API_TOKEN);
        const result = await hf.textGeneration({
          model: 'meta-llama/Meta-llama-3-8B-Instruct',
          inputs: `${systemPrompt}\n\nUser: ${userPrompt}\nAssistant:`,
          parameters: {
            max_new_tokens: 600,
            temperature: 0.7,
            return_full_text: false,
          },
        });

        const responseText = typeof result === 'string' 
          ? result 
          : result.generated_text || '';

        if (responseText) {
          return {
            response: responseText.trim(),
            actionable: detectActionableIntent(message, walletContext),
            source: 'huggingface',
          };
        }
      } catch (hfError) {
        console.warn('HF Inference API failed, trying Groq:', hfError);
      }
    }

    // Fallback to Groq (if available and installed)
    if (process.env.GROQ_API_KEY && groq && generateText) {
      try {
        const result = await generateText({
          model: groq('llama-3.3-70b-versatile'),
          system: systemPrompt,
          prompt: userPrompt,
          temperature: 0.7,
          maxTokens: 600,
        });

        return {
          response: result.text,
          actionable: detectActionableIntent(message, walletContext),
          source: 'groq',
        };
      } catch (groqError) {
        console.warn('Groq failed:', groqError);
      }
    }

  } catch (error) {
    console.error('AI assistant error:', error);
  }

  // Fallback response
  return {
    response: "I'm having trouble processing that right now. Please try connecting your wallet first or ask about a specific token.",
    source: 'fallback',
  };
}

/**
 * Detect actionable intent from user message
 */
function detectActionableIntent(
  message: string,
  context?: WalletContext
): WalletAssistantResponse['actionable'] {
  const lowerMessage = message.toLowerCase();

  // Swap intent
  if (lowerMessage.includes('swap') || lowerMessage.includes('exchange') || lowerMessage.includes('trade')) {
    // Try to extract tokens from message
    const tokens = extractTokensFromMessage(message);
    return {
      type: 'swap',
      data: {
        from: tokens.from,
        to: tokens.to,
        amount: tokens.amount,
        hasWallet: !!context?.walletAddress,
      },
    };
  }

  // Analyze intent
  if (lowerMessage.includes('analyze') || lowerMessage.includes('portfolio') || lowerMessage.includes('holdings')) {
    return {
      type: 'analyze',
      data: {
        hasWallet: !!context?.walletAddress,
        tokenCount: context?.userTokens?.length || 0,
      },
    };
  }

  // Connect wallet intent
  if (lowerMessage.includes('connect') || lowerMessage.includes('wallet') && !context?.walletAddress) {
    return {
      type: 'connect_wallet',
      data: {},
    };
  }

  // Info intent (default)
  return {
    type: 'info',
    data: {},
  };
}

/**
 * Extract token information from message
 */
function extractTokensFromMessage(message: string): {
  from?: string;
  to?: string;
  amount?: string;
} {
  // Simple regex patterns
  const swapPattern = /swap\s+(\w+)\s+to\s+(\w+)/i;
  const amountPattern = /(\d+\.?\d*)\s*(?:TON|USDT|NOT|etc)/i;

  const swapMatch = message.match(swapPattern);
  const amountMatch = message.match(amountPattern);

  return {
    from: swapMatch?.[1],
    to: swapMatch?.[2],
    amount: amountMatch?.[1],
  };
}

/**
 * Analyze user's portfolio and suggest optimizations
 */
export async function analyzePortfolio(walletAddress: string): Promise<string> {
  const context = await fetchWalletData(walletAddress);

  const analysisPrompt = `Analyze this wallet portfolio and provide recommendations:

Wallet: ${walletAddress.substring(0, 10)}...
TON Balance: ${context.tonBalance || '0'} TON
Holdings:
${context.userTokens?.map(t => `- ${t.symbol}: ${t.balance}${t.price ? ` ($${t.price})` : ''}`).join('\n') || 'None'}

Provide:
1. Portfolio composition analysis
2. Risk assessment
3. Swap optimization suggestions
4. Earning opportunities
5. Diversification recommendations`;

  const result = await walletAssistant({
    message: analysisPrompt,
    walletAddress,
    context,
  });

  return result.response;
}

/**
 * Suggest swap opportunities based on holdings
 */
export async function suggestSwaps(walletAddress: string): Promise<string> {
  const context = await fetchWalletData(walletAddress);

  if (!context.userTokens || context.userTokens.length === 0) {
    return "You don't have any tokens to swap. Consider buying TON or other tokens first.";
  }

  const swapPrompt = `Based on my current holdings, suggest the best swap opportunities:

TON Balance: ${context.tonBalance || '0'} TON
Holdings: ${context.userTokens.map(t => `${t.symbol} (${t.balance})`).join(', ')}

Suggest:
1. Which tokens to swap FROM
2. Which tokens to swap TO
3. Suggested amounts
4. Expected benefits/risks
5. Best timing considerations`;

  const result = await walletAssistant({
    message: swapPrompt,
    walletAddress,
    context,
  });

  return result.response;
}

/**
 * Suggest earning strategies
 */
export async function suggestEarningStrategies(walletAddress: string): Promise<string> {
  const context = await fetchWalletData(walletAddress);

  const earningPrompt = `Suggest ways I can earn more with my current holdings:

TON Balance: ${context.tonBalance || '0'} TON
Holdings: ${context.userTokens?.map(t => `${t.symbol} (${t.balance})`).join(', ') || 'None'}

Suggest:
1. Best swap opportunities for profit
2. Token farming/staking opportunities (if available)
3. Arbitrage opportunities
4. Portfolio rebalancing for better returns
5. Risk management strategies`;

  const result = await walletAssistant({
    message: earningPrompt,
    walletAddress,
    context,
  });

  return result.response;
}

