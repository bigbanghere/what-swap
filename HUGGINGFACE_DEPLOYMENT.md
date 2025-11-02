# Deploy Your Own Model on Hugging Face (100% Free)

## ✅ Yes, It's True!

Hugging Face offers **completely free** model deployment via:
1. **Spaces** - Free GPU time for public models
2. **Inference API** - Free tier for deployed models
3. **Model Hub** - Host and share your models

---

## 🚀 Method 1: Hugging Face Spaces (FREE GPU!)

### What You Get:
- ✅ **Free GPU** (CPU, T4 GPU available)
- ✅ **Public URL** for your model
- ✅ **API endpoint** automatically generated
- ✅ **Unlimited requests** (within GPU time limits)
- ✅ **No credit card** required

### Step 1: Create a Space

1. Go to https://huggingface.co/spaces
2. Click **"Create new Space"**
3. Fill in:
   - **Space name**: `what-swap-finance-ai` (your-username/what-swap-finance-ai)
   - **SDK**: Choose **Gradio** ⭐ (Recommended - auto-creates API endpoint!)
   - **Hardware**: Select **CPU** (free) or **T4 GPU** (free for public spaces)
   - **Visibility**: **Public** (required for free GPU)

> **Why Gradio?** It automatically creates `/api/predict` endpoint which your Vercel app needs. Streamlit requires extra FastAPI setup. See `GRADIO_VS_STREAMLIT.md` for details.

### Step 2: Upload Your Model Files

**Option A: Upload directly to Space**
```bash
# Clone your space
git clone https://huggingface.co/spaces/your-username/what-swap-finance-ai
cd what-swap-finance-ai

# Add your model files
# (You can upload via web UI or git)
```

**Option B: Use a model from Model Hub**
```python
# app.py - Automatically loads from Model Hub
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

model_name = "meta-llama/Llama-3-8b-chat-hf"
# Or your fine-tuned model: "your-username/finance-llama"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)
```

### Step 3: Create the App

**Using Gradio (Recommended):**

```python
# app.py
import gradio as gr
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# Load model (will be cached after first run)
model_name = "meta-llama/Llama-3-8b-chat-hf"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,
    device_map="auto"
)

FINANCE_SYSTEM_PROMPT = """You are a financial AI assistant for What Swap, a token swap platform.
Provide helpful, concise advice about token swaps, analysis, and DeFi."""

def generate_response(message, history):
    prompt = f"{FINANCE_SYSTEM_PROMPT}\n\nUser: {message}\nAssistant:"
    
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=500,
            temperature=0.7,
            do_sample=True,
        )
    
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    # Extract just the assistant's response
    response = response.split("Assistant:")[-1].strip()
    
    return response

# Create Gradio interface
iface = gr.ChatInterface(
    fn=generate_response,
    title="What Swap Finance AI",
    description="Ask questions about tokens, swaps, and DeFi",
    examples=[
        "Analyze TON token",
        "Should I swap TON to USDT?",
        "What are the risks of swapping NOT?",
    ],
)

if __name__ == "__main__":
    iface.launch(share=True)
```

**Using Streamlit:**

```python
# app.py
import streamlit as st
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

@st.cache_resource
def load_model():
    model_name = "meta-llama/Llama-3-8b-chat-hf"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16,
        device_map="auto"
    )
    return model, tokenizer

model, tokenizer = load_model()

st.title("What Swap Finance AI")

user_input = st.text_input("Ask a finance question:")

if user_input:
    prompt = f"You are a financial AI assistant. {user_input}"
    inputs = tokenizer(prompt, return_tensors="pt")
    
    with torch.no_grad():
        outputs = model.generate(**inputs, max_new_tokens=500)
    
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    st.write(response)
```

### Step 4: Add Requirements

```txt
# requirements.txt
transformers>=4.35.0
torch>=2.0.0
accelerate>=0.25.0
gradio>=4.0.0
sentencepiece>=0.1.99
```

### Step 5: Deploy

1. Push your code to the Space:
```bash
git add .
git commit -m "Deploy finance AI model"
git push
```

2. Hugging Face automatically builds and deploys!
3. Your model will be live at: `https://your-username-what-swap-finance-ai.hf.space`

### Step 6: Use API Endpoint

Hugging Face automatically creates an API endpoint:

```typescript
// Use your deployed model via API
const response = await fetch(
  'https://your-username-what-swap-finance-ai.hf.space/api/predict',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: ['Your finance question here'],
    }),
  }
);

const result = await response.json();
console.log(result.data[0]); // AI response
```

---

## 🎯 Method 2: Fine-Tune & Deploy Your Finance Model

### Step 1: Prepare Finance Dataset

```python
# prepare_finance_dataset.py
import json

finance_data = [
    {
        "instruction": "Analyze this token",
        "input": "TON token",
        "output": "TON (Toncoin) is the native cryptocurrency of The Open Network..."
    },
    {
        "instruction": "Should I swap now?",
        "input": "TON to USDT, amount: 100",
        "output": "Based on current liquidity pools and slippage analysis..."
    },
    # Add 100-1000 examples from your domain
]

with open('finance_dataset.json', 'w') as f:
    json.dump(finance_data, f, indent=2)
```

### Step 2: Fine-Tune on Colab (Free GPU)

```python
# Fine-tune on Google Colab (free GPU!)
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)
from datasets import load_dataset
import torch

# Load base model
model_name = "meta-llama/Llama-3-8b-chat-hf"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,
)

# Add padding token
tokenizer.pad_token = tokenizer.eos_token

# Load your dataset
dataset = load_dataset("json", data_files="finance_dataset.json")

def format_prompt(sample):
    return f"Instruction: {sample['instruction']}\nInput: {sample['input']}\nOutput: {sample['output']}"

def tokenize_function(examples):
    texts = [format_prompt(e) for e in examples]
    return tokenizer(texts, truncation=True, padding=True, max_length=512)

tokenized_dataset = dataset.map(tokenize_function, batched=True)

# Training arguments
training_args = TrainingArguments(
    output_dir="./finance-llama-finetuned",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=5e-5,
    fp16=True,
    logging_steps=10,
    save_steps=100,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset["train"],
    data_collator=DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False),
)

# Train!
trainer.train()

# Save model
trainer.save_model("./finance-llama-finetuned")
tokenizer.save_pretrained("./finance-llama-finetuned")

# Upload to Hugging Face
from huggingface_hub import login, HfApi

login()  # Enter your HF token
api = HfApi()
api.upload_folder(
    folder_path="./finance-llama-finetuned",
    repo_id="your-username/finance-llama",
    repo_type="model",
)
```

### Step 3: Deploy Fine-Tuned Model

After uploading to Model Hub, use it in your Space:

```python
# app.py - Use your fine-tuned model
model_name = "your-username/finance-llama"  # Your fine-tuned model!
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)
```

---

## 🔌 Method 3: Use Hugging Face Inference Endpoints (API)

### Free Tier:
- ✅ Free for public models
- ✅ Unlimited requests (reasonable use)
- ✅ Automatic scaling

### Setup:

```python
# Your deployed model is automatically available via Inference API
# No additional setup needed if model is public!

import requests

API_URL = "https://api-inference.huggingface.co/models/your-username/finance-llama"
headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}

def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

output = query({
    "inputs": "Analyze TON token",
    "parameters": {
        "max_new_tokens": 500,
        "temperature": 0.7,
    }
})
```

---

## 💻 Integration with Your Vercel App

### Update Your Free Finance Agent

```typescript
// src/lib/huggingface-deployed-agent.ts
import { HfInference } from '@huggingface/inference';

/**
 * Use your deployed Hugging Face Space model
 * 100% free with unlimited requests (within GPU limits)
 */
export async function useDeployedHFModel(
  message: string
): Promise<string> {
  // Option 1: Use Space API (if using Gradio)
  const spaceApiUrl = process.env.HF_SPACE_API_URL || 
    'https://your-username-what-swap-finance-ai.hf.space/api/predict';

  try {
    const response = await fetch(spaceApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [message],
      }),
    });

    const result = await response.json();
    return result.data[0];
  } catch (error) {
    console.error('Space API failed:', error);
  }

  // Option 2: Use Inference API
  const hf = new HfInference(process.env.HF_API_TOKEN);
  
  const modelName = process.env.HF_DEPLOYED_MODEL || 
    'your-username/finance-llama';

  const result = await hf.textGeneration({
    model: modelName,
    inputs: message,
    parameters: {
      max_new_tokens: 500,
      temperature: 0.7,
    },
  });

  return typeof result === 'string' 
    ? result 
    : result.generated_text || '';
}
```

### Update Your Free Finance Agent

```typescript
// src/lib/free-finance-agent.ts - Add this option

import { useDeployedHFModel } from './huggingface-deployed-agent';

export async function freeFinanceAgent({
  message,
  userId,
  retryCount = 0,
}: FreeAgentOptions): Promise<FreeAgentResponse> {
  // NEW: Try your deployed model first (if configured)
  if (process.env.HF_SPACE_API_URL || process.env.HF_DEPLOYED_MODEL) {
    try {
      const response = await useDeployedHFModel(message);
      return {
        response,
        source: 'huggingface',
      };
    } catch (error) {
      console.warn('Deployed HF model failed:', error);
      // Fall through to Groq
    }
  }

  // Then try Groq (existing code)...
  // ...
}
```

---

## 📋 Complete Deployment Checklist

### For Hugging Face Space:

- [ ] Create Hugging Face account (free)
- [ ] Create new Space (choose Gradio or Streamlit)
- [ ] Upload model files or reference from Model Hub
- [ ] Create `app.py` with Gradio/Streamlit interface
- [ ] Create `requirements.txt`
- [ ] Push to Space
- [ ] Wait for build (auto-deploys)
- [ ] Test via web UI
- [ ] Get API endpoint URL
- [ ] Add `HF_SPACE_API_URL` to Vercel env vars
- [ ] Integrate in your app

### For Fine-Tuning:

- [ ] Prepare finance dataset (100-1000 examples)
- [ ] Fine-tune on Google Colab (free GPU)
- [ ] Upload to Hugging Face Model Hub
- [ ] Deploy to Space using your model
- [ ] Test and iterate

---

## 🎯 Recommended Architecture

```
┌─────────────────┐
│  Your Vercel    │
│     App         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Deployed HF    │  ← Your custom finance model
│     Space       │  ← FREE GPU, unlimited requests
└─────────────────┘
         │
         ├─→ Gradio/Streamlit UI (for testing)
         └─→ API Endpoint (for production)
```

---

## 💰 Cost Comparison

| Option | Setup | Monthly Cost | Requests | GPU |
|--------|-------|--------------|----------|-----|
| **HF Space** | Free | **$0** | Unlimited* | ✅ Free T4 |
| **Groq API** | Free | **$0** | 43K/day | ❌ No (they host) |
| **HF Inference** | Free | **$0** | 1K/month | ❌ No (they host) |

*Within reasonable usage limits (public spaces get priority)

---

## 🚀 Quick Start Example

### 1. Create Space (5 minutes)

```bash
# Go to https://huggingface.co/spaces
# Click "Create new Space"
# Name: what-swap-finance-ai
# SDK: Gradio
# Hardware: T4 GPU (free!)
```

### 2. Upload Files

```python
# app.py
import gradio as gr
from transformers import pipeline

# Load any model or your fine-tuned one
pipe = pipeline("text-generation", 
                model="meta-llama/Llama-3-8b-chat-hf")

def chat(message, history):
    response = pipe(message, max_length=500)[0]['generated_text']
    return response

gr.ChatInterface(chat).launch()
```

### 3. Deploy

```bash
# Push to your Space
git push origin main
# Auto-deploys in ~2 minutes!
```

### 4. Use in Your App

```typescript
const response = await fetch(
  'https://your-username-what-swap-finance-ai.hf.space/api/predict',
  {
    method: 'POST',
    body: JSON.stringify({ data: ['Analyze TON token'] }),
  }
);
```

---

## ✅ Benefits of Self-Deployed Model

1. ✅ **Full Control** - Your model, your rules
2. ✅ **Free GPU** - T4 GPU for public spaces
3. ✅ **Unlimited Requests** - No rate limits like API tiers
4. ✅ **Privacy** - Your data stays in your control
5. ✅ **Customization** - Fine-tune specifically for finance
6. ✅ **Cost** - **$0/month** forever

---

## 🎓 Next Steps

1. ✅ Create your HF Space
2. ✅ Choose base model (Llama 3.3 8B or smaller for faster inference)
3. ✅ Deploy to Space
4. ✅ Test API endpoint
5. ✅ Integrate with your Vercel app
6. ⬜ (Optional) Fine-tune with finance data
7. ⬜ (Optional) Add RAG via Supabase pgvector

**Result**: Your own deployed finance AI model, 100% free! 🎉

