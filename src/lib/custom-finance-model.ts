"use server";

// Optional dependencies (only if installed)
let Together: any = null;
let createOpenAI: any = null;
let generateText: any = null;

try {
  const togetherModule = require('@together-ai/sdk');
  const openaiModule = require('@ai-sdk/openai');
  const aiModule = require('ai');
  Together = togetherModule.Together;
  createOpenAI = openaiModule.createOpenAI;
  generateText = aiModule.generateText;
} catch (e) {
  // Dependencies not installed
  console.log('Custom finance model dependencies not installed');
}

/**
 * Custom Finance Model Wrapper
 * Supports multiple deployment options:
 * 1. Fine-tuned model on Together AI
 * 2. Hugging Face Inference Endpoints
 * 3. Replicate
 * 4. Self-hosted on RunPod
 */

interface CustomModelOptions {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

interface ModelResponse {
  response: string;
  source: 'together' | 'huggingface' | 'replicate' | 'runpod' | 'fallback';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latency?: number;
}

export class CustomFinanceModel {
  private together: any = null;
  private modelName: string;

  constructor() {
    // Use your fine-tuned model name or base model
    this.modelName = process.env.CUSTOM_FINANCE_MODEL || 
                     'meta-llama/Llama-3-8b-chat-hf';
    
    if (process.env.TOGETHER_API_KEY && Together) {
      try {
        this.together = new Together({
          apiKey: process.env.TOGETHER_API_KEY,
        });
      } catch (error) {
        console.warn('Failed to initialize Together AI:', error);
      }
    }
  }

  /**
   * Generate response using custom fine-tuned model
   */
  async generate(options: CustomModelOptions): Promise<ModelResponse> {
    const startTime = Date.now();

    // Try Together AI first (supports fine-tuned models)
    if (this.together && process.env.USE_CUSTOM_MODEL === 'true') {
      try {
        const response = await this.together.chat.completions.create({
          model: this.modelName,
          messages: [
            {
              role: 'system',
              content: options.systemPrompt || 'You are a financial AI expert.',
            },
            { role: 'user', content: options.prompt },
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 500,
        });

        return {
          response: response.choices[0].message.content || '',
          source: 'together',
          usage: {
            promptTokens: response.usage?.prompt_tokens || 0,
            completionTokens: response.usage?.completion_tokens || 0,
            totalTokens: response.usage?.total_tokens || 0,
          },
          latency: Date.now() - startTime,
        };
      } catch (error) {
        console.error('Together AI error:', error);
        // Fall through to other methods
      }
    }

    // Fallback to Hugging Face Inference
    if (process.env.HF_API_TOKEN) {
      try {
        const response = await this.useHuggingFace(options);
        return {
          ...response,
          latency: Date.now() - startTime,
        };
      } catch (error) {
        console.error('Hugging Face error:', error);
      }
    }

    // Fallback to Replicate
    if (process.env.REPLICATE_API_TOKEN && process.env.REPLICATE_MODEL) {
      try {
        const response = await this.useReplicate(options);
        return {
          ...response,
          latency: Date.now() - startTime,
        };
      } catch (error) {
        console.error('Replicate error:', error);
      }
    }

    // Fallback to RunPod
    if (process.env.RUNPOD_ENDPOINT) {
      try {
        const response = await this.useRunPod(options);
        return {
          ...response,
          latency: Date.now() - startTime,
        };
      } catch (error) {
        console.error('RunPod error:', error);
      }
    }

    // Final fallback - return error
    return {
      response: 'Model service unavailable. Please try again later.',
      source: 'fallback',
      latency: Date.now() - startTime,
    };
  }

  /**
   * Use Hugging Face Inference Endpoints
   */
  private async useHuggingFace(
    options: CustomModelOptions
  ): Promise<Omit<ModelResponse, 'latency'>> {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${this.modelName}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: `${options.systemPrompt || ''}\n\n${options.prompt}`,
          parameters: {
            max_new_tokens: options.maxTokens || 500,
            temperature: options.temperature || 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HF API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      response: Array.isArray(data) ? data[0].generated_text : data.generated_text || '',
      source: 'huggingface',
    };
  }

  /**
   * Use Replicate
   */
  private async useReplicate(
    options: CustomModelOptions
  ): Promise<Omit<ModelResponse, 'latency'>> {
    const Replicate = require('replicate');
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const output = await replicate.run(process.env.REPLICATE_MODEL!, {
      input: {
        prompt: `${options.systemPrompt || ''}\n\n${options.prompt}`,
        max_length: options.maxTokens || 500,
        temperature: options.temperature || 0.7,
      },
    });

    return {
      response: Array.isArray(output) ? output.join('') : String(output),
      source: 'replicate',
    };
  }

  /**
   * Use RunPod serverless endpoint
   */
  private async useRunPod(
    options: CustomModelOptions
  ): Promise<Omit<ModelResponse, 'latency'>> {
    const response = await fetch(process.env.RUNPOD_ENDPOINT!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RUNPOD_API_TOKEN}`,
      },
      body: JSON.stringify({
        input: {
          prompt: `${options.systemPrompt || ''}\n\n${options.prompt}`,
          max_new_tokens: options.maxTokens || 500,
          temperature: options.temperature || 0.7,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`RunPod error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      response: data.output || data.text || '',
      source: 'runpod',
    };
  }

  /**
   * Analyze a specific token
   */
  async analyzeToken(token: string, tokenData: any): Promise<ModelResponse> {
    const prompt = `Analyze the ${token} token with the following data:
${JSON.stringify(tokenData, null, 2)}

Provide:
1. Overall assessment
2. Risk level (Low/Medium/High)
3. Recommendation for swapping
4. Market outlook`;

    return this.generate({
      prompt,
      systemPrompt: 'You are an expert token analyst for a DeFi swap platform.',
      maxTokens: 600,
    });
  }

  /**
   * Get swap recommendation
   */
  async getSwapRecommendation(
    fromToken: string,
    toToken: string,
    amount: string,
    marketContext: any
  ): Promise<ModelResponse> {
    const prompt = `Should I swap ${amount} ${fromToken} to ${toToken}?

Market Context:
${JSON.stringify(marketContext, null, 2)}

Provide a concise recommendation with risk assessment.`;

    return this.generate({
      prompt,
      systemPrompt: 'You are a DeFi swap advisor. Provide actionable recommendations.',
      maxTokens: 400,
    });
  }

  /**
   * Get personalized recommendations based on user history
   */
  async getPersonalizedRecommendations(
    userHistory: Array<{ from: string; to: string; amount: string; timestamp: string }>,
    currentHoldings: Array<{ token: string; amount: string }>
  ): Promise<ModelResponse> {
    const historySummary = userHistory
      .slice(-10)
      .map(h => `${h.amount} ${h.from} → ${h.to}`)
      .join('\n');

    const holdingsSummary = currentHoldings
      .map(h => `${h.amount} ${h.token}`)
      .join(', ');

    const prompt = `Based on this user's swap history and current holdings, provide personalized recommendations:

Swap History:
${historySummary}

Current Holdings: ${holdingsSummary}

Suggest:
1. Potential swap opportunities
2. Portfolio optimization
3. Risk diversification`;

    return this.generate({
      prompt,
      systemPrompt: 'You are a personalized financial advisor for DeFi users.',
      maxTokens: 500,
    });
  }
}

// Singleton instance
let customModelInstance: CustomFinanceModel | null = null;

export function getCustomFinanceModel(): CustomFinanceModel {
  if (!customModelInstance) {
    customModelInstance = new CustomFinanceModel();
  }
  return customModelInstance;
}

