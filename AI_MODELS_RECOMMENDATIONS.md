    # AI Models Recommendations for Agentic Finance Service

## Best Options for Free/Low-Cost Finance AI on Vercel

### 🏆 **Recommended Stack: Hybrid Approach**

### 1. **Vercel AI SDK + Multiple Free Providers**
Use Vercel's AI SDK to access multiple free/low-cost providers:

```bash
npm install ai @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/google
```

**Free Tier Options:**
- **Google Gemini Flash 1.5** (Free tier: 15 RPM, 1M tokens/day)
- **Anthropic Claude Haiku** (Via Vercel credits)
- **Groq API** (Free tier: 30 RPM, 14,400 requests/day) - Ultra fast, free!
- **Together AI** (Free tier: ~1M tokens/month)

### 2. **Open Source Models (Self-Hosted or via API)**

#### **Option A: Groq + Llama 3.3 70B (BEST for Free)**
```typescript
// Example: app/api/ai/route.ts
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    prompt: `You are a financial advisor AI. Analyze this request: ${prompt}`,
    temperature: 0.7,
  });
  
  return Response.json({ response: text });
}
```

**Groq Benefits:**
- ✅ Completely free tier (30 RPM)
- ✅ Ultra-fast inference (~200 tokens/sec)
- ✅ High-quality open models (Llama 3.3, Mixtral)
- ✅ No credit card required
- ✅ Works on Vercel serverless

#### **Option B: Together AI (Open Source Models)**
```typescript
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

const together = createOpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: 'https://api.together.xyz/v1',
});

// Free models available:
// - meta-llama/Llama-3-8b-chat-hf
// - mistralai/Mixtral-8x7B-Instruct-v0.1
```

#### **Option C: Hugging Face Inference API**
```typescript
// Free tier: 1,000 requests/month
const HF_MODELS = {
  financial: 'FinGPT/fingpt-forecaster_dow30_llama2-7b-lora',
  chat: 'meta-llama/Meta-Llama-3-8B-Instruct',
  analysis: 'google/gemma-7b-it',
};

// Use via @huggingface/inference package
```

### 3. **Finance-Specific Models**

#### **FinGPT** (Financial LLM)
```bash
# Option 1: Use FinGPT API if available
# Option 2: Fine-tune base model with financial data
# Option 3: Use prompting strategies with general models
```

**Implementation Strategy:**
```typescript
const FINANCE_SYSTEM_PROMPT = `You are an expert financial AI assistant specializing in:
- Token/coin analysis
- Swap recommendations
- Market sentiment analysis
- Risk assessment
- Portfolio optimization

Provide concise, actionable advice based on current market data.`;
```

### 4. **Recommended Architecture**

```
┌─────────────────┐
│  Telegram Bot   │
│  / Web App      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vercel API     │
│  Route Handler  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  AI Router (Cost Optimizer)    │
│  - Groq (primary - free)       │
│  - Together AI (fallback)      │
│  - Gemini Flash (heavy tasks)  │
└────────┬───────────────────────┘
         │
         ▼
┌─────────────────┐
│  Finance Agent  │
│  - Token analysis│
│  - Recommendations│
│  - Risk scoring  │
└─────────────────┘
```

### 5. **Implementation Example**

#### **Install Dependencies:**
```bash
pnpm add ai @ai-sdk/groq @ai-sdk/anthropic @ai-sdk/google zod
```

#### **Create AI Route:**
```typescript
// app/api/ai/finance/route.ts
import { groq } from '@ai-sdk/groq';
import { generateText, streamText } from 'ai';
import { z } from 'zod';

const FINANCE_PROMPT = `You are a financial AI assistant for What Swap.
Analyze token data, provide swap recommendations, and answer finance questions.
Be concise, accurate, and helpful.`;

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();
    
    // Use Groq for fast, free inference
    const result = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: FINANCE_PROMPT,
      prompt: buildPrompt(message, context),
      temperature: 0.7,
      maxTokens: 500,
    });
    
    return Response.json({
      response: result.text,
      usage: result.usage,
    });
  } catch (error) {
    // Fallback to cheaper model
    console.error('Groq error, using fallback:', error);
    // Implement fallback logic
  }
}

function buildPrompt(message: string, context: any) {
  return `
Context:
${JSON.stringify(context, null, 2)}

User Question: ${message}

Provide a helpful financial analysis or recommendation.`;
}
```

#### **Telegram Bot Integration:**
```typescript
// app/api/bot/route.ts (enhanced)
import { AutomatedMessagingSystem } from '@/lib/automated-messaging';

bot.on('message:text', async (ctx) => {
  const message = ctx.message.text;
  
  // Skip commands
  if (message.startsWith('/')) return;
  
  // Check if it's a token address
  if (isValidTONAddress(message)) {
    // Existing logic...
    return;
  }
  
  // NEW: AI Finance Assistant
  await ctx.replyWithChatAction('typing');
  
  try {
    const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/finance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        context: {
          userWallet: ctx.from?.id,
          recentSwaps: [], // Get from DB
        },
      }),
    });
    
    const { response } = await aiResponse.json();
    await ctx.reply(response);
  } catch (error) {
    await ctx.reply('Sorry, I encountered an error. Please try again.');
  }
});
```

### 6. **Use Cases for Your Service**

1. **Token Analysis Agent**
   - "Analyze NOT token for me"
   - "Should I swap TON to USDT now?"
   - "What's the best time to swap?"

2. **Personalized Recommendations**
   - Based on user's swap history
   - Based on portfolio composition
   - Market sentiment analysis

3. **Risk Assessment**
   - Slippage warnings
   - Price impact analysis
   - Token risk scoring

4. **Market Insights**
   - Trending tokens
   - Price predictions (limited)
   - Arbitrage opportunities

### 7. **Cost Optimization Strategies**

#### **Tier 1: Free Services (Start Here)**
- **Groq**: Primary service (completely free, 30 RPM)
- **Rate Limiting**: Implement per-user rate limits
- **Caching**: Cache common queries

#### **Tier 2: Low-Cost Fallbacks**
- **Together AI**: $0.0001/1K tokens for Llama models
- **Gemini Flash**: Free tier + pay-as-you-go

#### **Tier 3: Premium (Optional)**
- **Anthropic Claude**: For complex analysis ($0.25/1M tokens)
- Only use for power users or paid tiers

### 8. **Rate Limiting & Usage Management**

```typescript
// lib/rate-limiter.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requests per hour per user
});

export async function checkRateLimit(userId: string) {
  const { success, limit, remaining } = await ratelimit.limit(userId);
  return { success, limit, remaining };
}
```

### 9. **Deployment Checklist**

- [ ] Set up Groq account (free, no credit card)
- [ ] Get API key from Groq
- [ ] Add to Vercel env vars: `GROQ_API_KEY`
- [ ] Install `ai` and `@ai-sdk/groq` packages
- [ ] Create `/api/ai/finance` route
- [ ] Implement rate limiting
- [ ] Add caching layer
- [ ] Test with Telegram bot
- [ ] Monitor usage and costs

### 10. **Monitoring & Costs**

**Expected Costs (Free Tier):**
- Groq: $0 (up to 30 RPM)
- Vercel: $0 (hobby plan, reasonable usage)
- Redis (rate limiting): $0 (Upstash free tier)

**Scaling Plan:**
- First 1,000 users: Free (Groq)
- Next 10,000 users: ~$10-50/month (Together AI fallback)
- 100K+ users: Consider premium tier pricing

### 11. **Quick Start Code**

```typescript
// app/api/ai/finance/route.ts
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { message } = await req.json();
  
  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    system: 'You are a helpful financial assistant for token swaps.',
    prompt: message,
  });
  
  return NextResponse.json({ response: text });
}
```

### 12. **Additional Resources**

- **Vercel AI SDK Docs**: https://sdk.vercel.ai/docs
- **Groq API**: https://console.groq.com
- **Together AI**: https://together.ai
- **FinGPT**: https://github.com/AI4Finance-Foundation/FinGPT

---

## 🎯 Recommendation

**Start with Groq + Llama 3.3 70B**:
- ✅ Completely free
- ✅ Fast inference
- ✅ High quality
- ✅ Works perfectly on Vercel
- ✅ No credit card needed

**Add Together AI as fallback** when you exceed Groq limits.

**Upgrade to paid models** (Claude, GPT-4) only for premium features or paid users.

