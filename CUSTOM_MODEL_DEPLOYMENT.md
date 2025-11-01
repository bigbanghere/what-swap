# Building & Deploying Custom AI Models on Vercel

## Overview

Yes, you can build your own models, but **direct deployment on Vercel has limitations**. Here are practical approaches:

## ❌ Vercel Limitations for Large Models

- **Memory**: 2GB (Hobby) / 4GB (Pro) - Most models need 8GB+
- **Deployment Size**: 250MB max (uncompressed)
- **Execution Time**: 300s (Hobby) / 800s (Pro)
- **Cold Starts**: Can be 5-10 seconds for large dependencies

## ✅ Best Approaches

### **Option 1: Fine-Tune + External Deployment (RECOMMENDED)**

Train/fine-tune your model, deploy it externally, call it from Vercel.

#### Step 1: Fine-Tune a Finance Model

**Using Together AI (Free tier available):**

```typescript
// scripts/fine-tune-model.ts
import { Together } from '@together-ai/sdk';

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

// Prepare your finance dataset
const financeDataset = [
  {
    instruction: "Analyze TON token",
    input: "",
    output: "TON (Toncoin) is the native cryptocurrency of The Open Network...",
  },
  {
    instruction: "Should I swap TON to USDT?",
    input: "Current price: $2.50",
    output: "Based on current market conditions... [analysis]",
  },
  // Add your custom finance Q&A pairs
];

// Fine-tune Llama 3 8B for finance
async function fineTuneModel() {
  const trainingFile = await together.files.upload({
    file: financeDataset,
    purpose: 'fine-tune',
  });

  const fineTune = await together.fineTuning.create({
    trainingFile: trainingFile.id,
    model: 'meta-llama/Llama-3-8b-chat-hf',
    nEpochs: 3,
    learningRate: 2e-5,
  });

  console.log('Fine-tune job:', fineTune.id);
  // Monitor at: https://api.together.xyz/v1/fine_tuning/{id}
}
```

**Alternative: Use Hugging Face:**

```python
# train_finance_model.py
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, Trainer
from datasets import load_dataset
import torch

# Load base model
model_name = "meta-llama/Llama-3-8b-chat-hf"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Load your finance dataset
dataset = load_dataset("json", data_files="finance_dataset.json")

# Fine-tune
training_args = TrainingArguments(
    output_dir="./finance-llama",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    learning_rate=2e-5,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
)

trainer.train()
trainer.save_model("./finance-llama-finetuned")
```

#### Step 2: Deploy Your Fine-Tuned Model

**Option A: Replicate (Easy, $0.01/hour when running)**

```typescript
// Deploy to Replicate
// 1. Push model to Hugging Face
// 2. Create Replicate model from HF
// 3. Use from Vercel:

import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function useCustomModel(prompt: string) {
  const output = await replicate.run(
    "your-username/finance-llama:version",
    {
      input: {
        prompt: prompt,
        max_length: 500,
      },
    }
  );
  
  return output;
}
```

**Option B: Hugging Face Inference Endpoints (Cheaper)**

```typescript
// src/lib/custom-model.ts
export async function useCustomFinanceModel(prompt: string) {
  const response = await fetch(
    `https://api-inference.huggingface.co/models/your-username/finance-llama`,
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
      },
      method: 'POST',
      body: JSON.stringify({ inputs: prompt }),
    }
  );

  return response.json();
}
```

**Option C: RunPod (Most Control, $0.20/hour)**

```typescript
// Deploy containerized model on RunPod
// Access via API endpoint from Vercel

export async function useRunPodModel(prompt: string) {
  const response = await fetch(
    `https://your-model-xyz.runpod.net/generate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: {
          prompt: prompt,
          max_new_tokens: 500,
        },
      }),
    }
  );

  return response.json();
}
```

---

### **Option 2: Small Quantized Models on Vercel (Direct Deployment)**

Deploy tiny, quantized models directly on Vercel Edge Functions.

#### Use ONNX Runtime Web

```bash
pnpm add @xenova/transformers onnxruntime-node
```

```typescript
// src/lib/edge-model.ts
// Use for Edge Functions (not serverless)
import { pipeline } from '@xenova/transformers';

// Load a tiny quantized model (must be < 100MB)
let model: any = null;

export async function generateResponse(prompt: string) {
  if (!model) {
    // Load only once (cached)
    model = await pipeline(
      'text-generation',
      'Xenova/Phi-3-mini-4k-instruct', // ~4GB → ~400MB quantized
      {
        quantized: true,
        device: 'cpu', // Edge functions run on CPU
      }
    );
  }

  const output = await model(prompt, {
    max_new_tokens: 200,
    temperature: 0.7,
  });

  return output[0].generated_text;
}
```

**Edge Route:**

```typescript
// app/api/ai/edge/route.ts
import { generateResponse } from '@/lib/edge-model';

export const runtime = 'edge'; // Uses Edge Functions
export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  const response = await generateResponse(prompt);
  
  return Response.json({ response });
}
```

**Limitations:**
- Only tiny models (Phi-3-mini, Gemma-2b)
- Slower inference (CPU only)
- Higher latency than external APIs

---

### **Option 3: Hybrid Approach (BEST PRACTICE)**

Combine fine-tuned models (external) + small models (Vercel Edge) + API fallbacks.

```typescript
// src/lib/hybrid-ai-agent.ts
import { useCustomFinanceModel } from './custom-model';
import { generateResponse } from './edge-model';
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export async function hybridFinanceAgent(prompt: string, context: any) {
  // 1. Try custom fine-tuned model (primary)
  try {
    if (context.useCustomModel) {
      const custom = await useCustomFinanceModel(prompt);
      if (custom && custom.length > 0) {
        return {
          response: custom,
          source: 'custom-model',
          cost: 0.001, // Estimate
        };
      }
    }
  } catch (error) {
    console.warn('Custom model failed, falling back...', error);
  }

  // 2. Try Groq (free, fast)
  try {
    const groqResponse = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: prompt,
    });
    
    return {
      response: groqResponse.text,
      source: 'groq',
      cost: 0,
    };
  } catch (error) {
    console.warn('Groq failed, using edge model...', error);
  }

  // 3. Fallback to edge model (always available)
  try {
    const edgeResponse = await generateResponse(prompt);
    return {
      response: edgeResponse,
      source: 'edge-model',
      cost: 0,
    };
  } catch (error) {
    return {
      response: 'I apologize, I\'m having trouble processing that right now.',
      source: 'fallback',
      cost: 0,
    };
  }
}
```

---

## 📊 Cost Comparison

| Approach | Setup Cost | Per Request | Latency | Quality |
|----------|-----------|-------------|---------|---------|
| **Groq (API)** | Free | $0 | ~200ms | High |
| **Fine-tune + Replicate** | $0 | ~$0.01 | ~500ms | Very High (Custom) |
| **Fine-tune + HF Endpoints** | Free | ~$0.001 | ~300ms | Very High (Custom) |
| **RunPod Self-Hosted** | $0.20/hr | ~$0.0001 | ~200ms | Very High (Custom) |
| **Edge Model (Vercel)** | Free | $0 | ~2-5s | Medium |
| **Together AI Fine-tune** | $0 | $0.0001 | ~400ms | High |

---

## 🎯 Recommended Setup for What Swap

### Phase 1: Start with Fine-Tuning (Free)

```typescript
// 1. Collect finance data from your swap platform
// 2. Fine-tune Llama 3 8B on Together AI (free tier)
// 3. Deploy to Hugging Face (free)
// 4. Call from Vercel
```

### Phase 2: Add Custom Model

```typescript
// Update ai-finance-agent.ts to use custom model:

import { hybridFinanceAgent } from '@/lib/hybrid-ai-agent';

export async function financeAgent(options: FinanceAgentOptions) {
  // Use hybrid approach
  return hybridFinanceAgent(
    buildPrompt(options.message, options.context),
    { useCustomModel: true }
  );
}
```

### Phase 3: Scale

- Monitor costs
- Add caching
- Implement A/B testing
- Optimize model size

---

## 🚀 Quick Start: Fine-Tune Your Finance Model

### Step 1: Prepare Dataset

```typescript
// scripts/prepare-finance-dataset.ts
// Extract real Q&A from your platform

const financeDataset = [
  // Token analysis
  {
    instruction: "Analyze this token",
    input: "TON address: 0:0000...",
    output: "TON (Toncoin) is the native token...",
  },
  // Swap recommendations
  {
    instruction: "Should I swap now?",
    input: "From: TON, To: USDT, Amount: 100",
    output: "Based on current liquidity pools...",
  },
  // Risk assessment
  {
    instruction: "What's the risk level?",
    input: "Token: NOT, Liquidity: $500K",
    output: "Risk level: Medium. Low liquidity detected...",
  },
  // Add 100-1000 examples from your domain
];

// Save to JSON
fs.writeFileSync('finance_dataset.json', JSON.stringify(financeDataset));
```

### Step 2: Fine-Tune with Together AI

```bash
# Install Together CLI
npm install -g @together-ai/cli

# Login
together login

# Upload dataset
together files upload finance_dataset.json

# Fine-tune
together fine-tune create \
  --training-file file-abc123 \
  --model meta-llama/Llama-3-8b-chat-hf \
  --suffix what-swap-finance
```

### Step 3: Deploy & Use

```typescript
// After fine-tuning completes, use in your app:

import { Together } from '@together-ai/sdk';

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

export async function useCustomFinanceModel(prompt: string) {
  const response = await together.chat.completions.create({
    model: 'togethercomputer/meta-llama/Llama-3-8b-chat-hf-what-swap-finance',
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0].message.content;
}
```

---

## 📝 Example: Complete Custom Model Integration

```typescript
// src/lib/custom-finance-model.ts
import { Together } from '@together-ai/sdk';

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

export class CustomFinanceModel {
  private modelName: string;

  constructor() {
    // Use your fine-tuned model or fallback to base
    this.modelName = process.env.CUSTOM_FINANCE_MODEL || 
                     'meta-llama/Llama-3-8b-chat-hf';
  }

  async analyzeToken(token: string, data: any): Promise<string> {
    const prompt = `Analyze ${token} token:
${JSON.stringify(data, null, 2)}

Provide analysis, risk assessment, and recommendation.`;

    const response = await together.chat.completions.create({
      model: this.modelName,
      messages: [
        {
          role: 'system',
          content: 'You are a financial AI expert specializing in token analysis.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content || '';
  }

  async getSwapRecommendation(
    from: string,
    to: string,
    amount: string,
    context: any
  ): Promise<string> {
    const prompt = `Should I swap ${amount} ${from} to ${to}?
Market context: ${JSON.stringify(context)}`;

    const response = await together.chat.completions.create({
      model: this.modelName,
      messages: [
        {
          role: 'system',
          content: 'You are a DeFi swap advisor. Provide concise recommendations.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0].message.content || '';
  }
}
```

---

## 🎓 Training Your Own Model from Scratch

If you want to train a model from scratch (not recommended - expensive):

### Using Hugging Face + Google Colab

```python
# train_custom_finance_model.py
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM,
    Trainer,
    TrainingArguments
)

# Use a small base model
base_model = "microsoft/phi-3-mini-4k-instruct"

tokenizer = AutoTokenizer.from_pretrained(base_model)
model = AutoModelForCausalLM.from_pretrained(base_model)

# Your custom finance dataset
train_dataset = load_finance_dataset()

training_args = TrainingArguments(
    output_dir="./finance-model",
    num_train_epochs=5,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=4,
    learning_rate=5e-5,
    fp16=True,  # Use mixed precision
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
)

trainer.train()
trainer.save_model("./finance-model-final")

# Upload to Hugging Face
model.push_to_hub("your-username/what-swap-finance")
```

**Cost**: ~$50-200 for GPU compute on Colab Pro or AWS

---

## ✅ Summary

**Best Approach for What Swap:**

1. ✅ **Fine-tune Llama 3 8B** with your finance data (Together AI - free)
2. ✅ **Deploy on Hugging Face** or keep using Together AI API
3. ✅ **Call from Vercel** - no model deployment needed on Vercel
4. ✅ **Use Groq as fallback** for speed and cost
5. ✅ **Add edge model** only for critical features requiring zero external dependency

**Cost**: ~$0-10/month for moderate usage
**Latency**: ~200-500ms
**Quality**: Custom-trained for your domain

---

## 🔗 Resources

- [Together AI Fine-tuning](https://together.ai/fine-tuning)
- [Hugging Face Fine-tuning Guide](https://huggingface.co/docs/transformers/training)
- [Replicate Model Deployment](https://replicate.com/docs)
- [RunPod Serverless GPUs](https://www.runpod.io/)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)

