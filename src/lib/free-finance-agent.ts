"use server";

import { callDeployedHFModel } from './huggingface-deployed-agent';

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
 * 100% Free Finance AI Agent
 * 
 * Uses completely free APIs with no credit card required:
 * - Option 1: Your deployed HF Space (unlimited, free GPU)
 * - Option 2: Groq (30 RPM, Llama 3.3 70B)
 * - Option 3: Hugging Face Inference API (1K/month, Llama 3.3 8B)
 * 
 * Total cost: $0/month
 */

const FINANCE_SYSTEM_PROMPT = `You are a financial AI assistant for What Swap, a TON blockchain token swap service.

Your capabilities:
- Analyze tokens and provide insights
- Recommend swap strategies based on market conditions
- Explain token metrics and fundamentals
- Assess risk levels for swaps
- Provide personalized recommendations
- Answer questions about DeFi, tokens, and crypto trading

Guidelines:
- Be concise and actionable (max 3-4 sentences unless detailed analysis needed)
- Use emojis sparingly but effectively
- Always emphasize that this is NOT financial advice
- Reference specific token data when available
- If you don't know something, say so honestly

Format responses in a friendly, helpful tone suitable for a Telegram bot.`;

interface FreeAgentOptions {
  message: string;
  userId?: string;
  retryCount?: number;
}

interface FreeAgentResponse {
  response: string;
  source: 'groq' | 'huggingface' | 'fallback';
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
  };
}

/**
 * Free finance agent using only free-tier APIs
 * No credit card required for any provider
 */
export async function freeFinanceAgent({
  message,
  userId,
  retryCount = 0,
}: FreeAgentOptions): Promise<FreeAgentResponse> {
  // Try your deployed Hugging Face Space first (if configured)
  // This is YOUR model with unlimited requests (within GPU limits)
  if (process.env.HF_SPACE_API_URL || process.env.HF_DEPLOYED_MODEL) {
    try {
      const response = await callDeployedHFModel({
        message,
        spaceUrl: process.env.HF_SPACE_API_URL,
        modelName: process.env.HF_DEPLOYED_MODEL,
      });
      
      return {
        response,
        source: 'huggingface', // Your deployed model
      };
    } catch (error) {
      console.warn('Deployed HF model failed:', error);
      // Fall through to Groq
    }
  }

  // Try Groq (primary - best free option) - if available and installed
  // 30 RPM = 43,200 requests/day
  if (process.env.GROQ_API_KEY && groq && generateText && retryCount < 2) {
    try {
      const result = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        system: FINANCE_SYSTEM_PROMPT,
        prompt: message,
        temperature: 0.7,
        maxTokens: 500,
      });

      return {
        response: result.text,
        source: 'groq',
        usage: result.usage ? {
          promptTokens: result.usage.promptTokens,
          completionTokens: result.usage.completionTokens,
        } : undefined,
      };
    } catch (error: any) {
      // If rate limited, wait and retry once
      if (error.status === 429 && retryCount < 1) {
        console.log('Groq rate limited, waiting 2s and retrying...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return freeFinanceAgent({ message, userId, retryCount: retryCount + 1 });
      }
      
      console.warn('Groq failed:', error.message || error);
      // Fall through to next provider
    }
  }

  // Fallback to Hugging Face (1K requests/month free)
  // Reserve for special cases or when Groq is down
  if (process.env.HF_API_TOKEN && HfInference) {
    try {
      const hf = new HfInference(process.env.HF_API_TOKEN);
      
      const fullPrompt = `${FINANCE_SYSTEM_PROMPT}\n\nUser: ${message}\nAssistant:`;
      
      const result = await hf.textGeneration({
        model: 'meta-llama/Meta-llama-3-8B-Instruct',
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false,
        },
      });

      // Handle different response formats
      let responseText = '';
      if (typeof result === 'string') {
        responseText = result;
      } else if (result.generated_text) {
        responseText = result.generated_text;
      } else if (Array.isArray(result) && result[0]?.generated_text) {
        responseText = result[0].generated_text;
      }

      if (responseText) {
        return {
          response: responseText.trim(),
          source: 'huggingface',
        };
      }
    } catch (error: any) {
      console.warn('Hugging Face failed:', error.message || error);
      // Fall through to fallback
    }
  }

  // Final fallback - helpful error message
  return {
    response: "I'm experiencing high demand right now. Please try again in a moment, or use specific token addresses for faster responses.",
    source: 'fallback',
  };
}

/**
 * Check if free AI services are available
 */
export function isFreeAIAvailable(): boolean {
  return !!(process.env.GROQ_API_KEY || process.env.HF_API_TOKEN);
}

/**
 * Get usage stats for free tiers
 */
export async function getFreeAIUsage(): Promise<{
  groqAvailable: boolean;
  hfAvailable: boolean;
  recommendations: string[];
}> {
  const groqAvailable = !!process.env.GROQ_API_KEY;
  const hfAvailable = !!process.env.HF_API_TOKEN;

  const recommendations: string[] = [];

  if (!groqAvailable && !hfAvailable) {
    recommendations.push('Configure GROQ_API_KEY for best free experience (30 RPM)');
    recommendations.push('Or configure HF_API_TOKEN as fallback (1K/month)');
  } else if (!groqAvailable) {
    recommendations.push('Add GROQ_API_KEY for primary free AI (30 RPM, best quality)');
  } else if (!hfAvailable) {
    recommendations.push('Add HF_API_TOKEN for fallback (1K/month free)');
  }

  return {
    groqAvailable,
    hfAvailable,
    recommendations,
  };
}

