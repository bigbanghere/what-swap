# Completely Free AI Models (No Credit Card Required)

## 🏆 Top Free Tier Models for Your Finance AI Service

### **1. Groq API** ⭐ **BEST OPTION**

**✅ Completely Free:**
- **30 requests per minute** (RPM)
- **14,400 requests per day** (432,000/month!)
- **No credit card required**
- **No expiration** (as long as free tier exists)

**Models Available:**
- `llama-3.3-70b-versatile` (Best quality)
- `llama-3.1-70b-versatile`
- `llama-3.1-8b-instant`
- `mixtral-8x7b-32768`

**Setup:**
```bash
# 1. Sign up at https://console.groq.com (free, no CC)
# 2. Get API key
# 3. Install:
pnpm add @ai-sdk/groq ai
```

**Usage:**
```typescript
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    prompt: prompt,
    temperature: 0.7,
    maxTokens: 500,
  });
  
  return Response.json({ response: text });
}
```

**Rate Limits:**
- ✅ 30 requests/minute = 2 requests/second
- ✅ Enough for most bot use cases
- ✅ Can implement queue for burst handling

**Cost:** **$0 forever** (as long as free tier exists)

---

### **2. Hugging Face Inference API**

**✅ Completely Free:**
- **1,000 requests/month** free tier
- **No credit card required**
- **Open source models only**

**Best Models:**
- `meta-llama/Meta-llama-3-8B-Instruct` (Free)
- `mistralai/Mistral-7B-Instruct-v0.2`
- `google/gemma-2b-it`

**Setup:**
```bash
# 1. Sign up at https://huggingface.co (free, no CC)
# 2. Get token from Settings > Access Tokens
# 3. Install:
pnpm add @huggingface/inference
```

**Usage:**
```typescript
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_API_TOKEN);

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  const result = await hf.textGeneration({
    model: 'meta-llama/Meta-llama-3-8B-Instruct',
    inputs: prompt,
    parameters: {
      max_new_tokens: 500,
      temperature: 0.7,
    },
  });
  
  return Response.json({ response: result.generated_text });
}
```

**Rate Limits:**
- ⚠️ 1,000 requests/month = ~33 requests/day
- ⚠️ Limited for high-traffic apps
- ✅ Good for development/testing

**Cost:** **$0** (1K requests/month)

---

### **3. Google Gemini Flash 1.5** (via Vercel AI SDK)

**✅ Free Tier:**
- **15 requests per minute**
- **1,500 requests per day** (45,000/month)
- **No credit card required** (via Google Cloud free tier)

**Setup:**
```bash
# 1. Get Google AI Studio API key: https://aistudio.google.com/apikey
# 2. Install:
pnpm add @ai-sdk/google ai
```

**Usage:**
```typescript
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  const { text } = await generateText({
    model: google('gemini-1.5-flash'),
    prompt: prompt,
  });
  
  return Response.json({ response: text });
}
```

**Rate Limits:**
- ✅ 15 RPM = 1 request/4 seconds
- ✅ Good for moderate usage
- ⚠️ Requires Google account

**Cost:** **$0** (free tier)

---

### **4. Together AI** (Open Source Models)

**⚠️ Check Current Status:**
- Previously had free tier, check current policy
- May require credit card now (varies)
- Good for fine-tuning if available

**If Free Tier Available:**
```typescript
import { Together } from '@together-ai/sdk';

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

// Use open source models
const result = await together.chat.completions.create({
  model: 'meta-llama/Llama-3-8b-chat-hf',
  messages: [{ role: 'user', content: prompt }],
});
```

**Cost:** Check current pricing (may have changed)

---

### **5. Local Models (100% Free, Self-Hosted)**

**Option A: RunPod Free Tier**
- Check if they have free credits for new users
- Deploy your own model

**Option B: Hugging Face Spaces (Free GPU)**
- Deploy models on HF Spaces
- Free GPU hours for public spaces
- Access via API

---

## 🎯 **Recommended Setup: Multi-Provider Fallback**

Use multiple free providers with fallback strategy:

```typescript
// src/lib/free-ai-agent.ts
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export async function freeFinanceAgent(prompt: string): Promise<string> {
  // Try Groq first (best free option)
  try {
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt,
      temperature: 0.7,
      maxTokens: 500,
    });
    return text;
  } catch (error) {
    console.warn('Groq failed:', error);
  }

  // Fallback to Hugging Face (if within limits)
  try {
    const hf = new HfInference(process.env.HF_API_TOKEN);
    const result = await hf.textGeneration({
      model: 'meta-llama/Meta-llama-3-8B-Instruct',
      inputs: prompt,
      parameters: { max_new_tokens: 500 },
    });
    return result.generated_text;
  } catch (error) {
    console.warn('HF failed:', error);
  }

  // Final fallback: Simple response
  return "I'm currently experiencing high demand. Please try again in a moment.";
}
```

---

## 📊 **Comparison Table**

| Provider | Free Tier | Rate Limit | Quality | Credit Card |
|----------|-----------|------------|---------|-------------|
| **Groq** | ✅ Yes | 30 RPM | ⭐⭐⭐⭐⭐ | ❌ No |
| **HF Inference** | ✅ Yes | 1K/month | ⭐⭐⭐⭐ | ❌ No |
| **Gemini Flash** | ✅ Yes | 15 RPM | ⭐⭐⭐⭐ | ❌ No |
| **Together AI** | ⚠️ Check | Varies | ⭐⭐⭐⭐ | ⚠️ Maybe |

---

## 🚀 **Best Strategy for What Swap**

### **Primary: Groq** (30 RPM)
- Best free tier
- Highest quality (Llama 3.3 70B)
- Fastest inference
- No credit card

### **Fallback: Hugging Face** (1K/month)
- Use for special requests
- When Groq rate limit hit
- Reserve for high-priority users

### **Backup: Simple Rules**
- If both fail, use rule-based responses
- Or cache common queries

---

## 💻 **Complete Free Implementation**

```typescript
// src/lib/free-finance-agent.ts
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { HfInference } from '@huggingface/inference';

const FINANCE_PROMPT = `You are a financial AI assistant for What Swap.
Provide helpful, concise advice about token swaps, analysis, and DeFi.
Be friendly and professional.`;

interface FreeAgentOptions {
  message: string;
  userId?: string;
  retryCount?: number;
}

export async function freeFinanceAgent({
  message,
  userId,
  retryCount = 0,
}: FreeAgentOptions): Promise<{
  response: string;
  source: 'groq' | 'huggingface' | 'fallback';
}> {
  // Try Groq (primary - best free option)
  if (retryCount < 2) {
    try {
      const { text } = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        system: FINANCE_PROMPT,
        prompt: message,
        temperature: 0.7,
        maxTokens: 500,
      });

      return {
        response: text,
        source: 'groq',
      };
    } catch (error: any) {
      // If rate limited, wait and retry
      if (error.status === 429 && retryCount < 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
        return freeFinanceAgent({ message, userId, retryCount: retryCount + 1 });
      }
      
      console.warn('Groq failed:', error.message);
    }
  }

  // Fallback to Hugging Face (reserve for important requests)
  if (process.env.HF_API_TOKEN && userId) {
    try {
      const hf = new HfInference(process.env.HF_API_TOKEN);
      const result = await hf.textGeneration({
        model: 'meta-llama/Meta-llama-3-8B-Instruct',
        inputs: `${FINANCE_PROMPT}\n\nUser: ${message}\nAssistant:`,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
        },
      });

      return {
        response: result.generated_text.trim(),
        source: 'huggingface',
      };
    } catch (error) {
      console.warn('HF failed:', error);
    }
  }

  // Final fallback
  return {
    response: "I'm experiencing high demand right now. Please try again in a moment or use specific token addresses for faster responses.",
    source: 'fallback',
  };
}
```

---

## 📈 **Rate Limiting Strategy**

To avoid hitting limits with free tiers:

```typescript
// src/lib/rate-limiter.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Limit users to 10 AI requests per hour
const userLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'),
});

// Global rate limiter for Groq (30 RPM)
const groqLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, '1 m'),
});

export async function checkRateLimit(userId: string) {
  const userLimit = await userLimiter.limit(userId);
  const groqLimit = await groqLimiter.limit('global-groq');
  
  return {
    allowed: userLimit.success && groqLimit.success,
    userRemaining: userLimit.remaining,
    groqRemaining: groqLimit.remaining,
  };
}
```

---

## ✅ **Recommended Final Setup**

### **Install:**
```bash
pnpm add @ai-sdk/groq ai @huggingface/inference
```

### **Environment Variables:**
```env
# Groq (primary - no credit card needed)
GROQ_API_KEY=your_groq_key

# Hugging Face (fallback - no credit card needed)
HF_API_TOKEN=your_hf_token
```

### **Usage:**
```typescript
import { freeFinanceAgent } from '@/lib/free-finance-agent';

const result = await freeFinanceAgent({
  message: 'Analyze TON token',
  userId: 'user123',
});

console.log(result.response); // AI response
console.log(result.source); // 'groq' | 'huggingface' | 'fallback'
```

---

## 🎯 **Summary**

**Best Free Option: Groq**
- ✅ 30 RPM = 43,200 requests/day
- ✅ Llama 3.3 70B (excellent quality)
- ✅ No credit card required
- ✅ Fast inference (~200 tokens/sec)

**Secondary: Hugging Face**
- ✅ 1K requests/month (reserve for special cases)
- ✅ Good quality models
- ✅ No credit card required

**Total Cost: $0/month** ✅

---

## 🔗 **Quick Links**

- **Groq**: https://console.groq.com (Sign up free)
- **Hugging Face**: https://huggingface.co (Free account)
- **Vercel AI SDK**: https://sdk.vercel.ai/docs

**You can build a complete finance AI service for $0/month using these free tiers!** 🎉

