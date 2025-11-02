# Quick Start: Deploy Your Finance Model on Hugging Face (5 Minutes!)

## ✅ Yes, It's 100% Free!

**What You Get:**
- ✅ Free GPU (T4) for public Spaces
- ✅ Unlimited API requests (within reasonable limits)
- ✅ Public URL + API endpoint
- ✅ No credit card required
- ✅ Your own custom model

---

## 🚀 5-Minute Setup

### Step 1: Create Space (2 min)

1. Go to: https://huggingface.co/spaces
2. Click **"Create new Space"**
3. Fill in:
   - **Space name**: `what-swap-finance-ai` 
   - **SDK**: **Gradio** ⭐ (Auto-creates API endpoint - perfect for your use case!)
   - **Hardware**: **T4 GPU** (free!)
   - **Visibility**: **Public** (required for free GPU)

> **Why Gradio?** It automatically creates the `/api/predict` endpoint your Vercel app needs. Streamlit requires manual API setup.

### Step 2: Upload Files (2 min)

Copy these files to your Space:

**File 1: `app.py`** (Use the example in `huggingface-space-example/app.py`)
```python
import gradio as gr
from transformers import pipeline

pipe = pipeline("text-generation", model="meta-llama/Llama-3-8b-chat-hf")

def chat(message, history):
    response = pipe(message, max_length=500)[0]['generated_text']
    return response

gr.ChatInterface(chat).launch()
```

**File 2: `requirements.txt`**
```
transformers>=4.35.0
torch>=2.0.0
accelerate>=0.25.0
gradio>=4.0.0
```

### Step 3: Deploy (1 min)

1. Click **"Commit and push"** in the Space editor
2. Wait ~2 minutes for build
3. Your model is live! 🎉

**Your Space URL:** `https://your-username-what-swap-finance-ai.hf.space`
**API Endpoint:** `https://your-username-what-swap-finance-ai.hf.space/api/predict`

---

## 💻 Use in Your Vercel App

### Add Environment Variable:

```env
HF_SPACE_API_URL=https://your-username-what-swap-finance-ai.hf.space/api/predict
```

### Use in Code:

```typescript
import { freeFinanceAgent } from '@/lib/free-finance-agent';

// Automatically uses your deployed model!
const result = await freeFinanceAgent({
  message: 'Analyze TON token',
  userId: 'user123',
});

console.log(result.response); // AI response from YOUR model!
```

---

## 🎯 That's It!

Your model is now:
- ✅ Deployed for free
- ✅ Accessible via API
- ✅ Integrated with your app
- ✅ Cost: **$0/month**

---

## 🔧 Advanced: Fine-Tune Your Model

If you want to fine-tune specifically for finance:

1. Prepare dataset (100-1000 finance Q&A pairs)
2. Fine-tune on Google Colab (free GPU)
3. Upload to Model Hub
4. Use in your Space instead of base model

See `HUGGINGFACE_DEPLOYMENT.md` for detailed instructions.

---

## 📊 Cost: $0/month Forever! 🎉

| Feature | Cost |
|---------|------|
| Hugging Face Space | **Free** |
| T4 GPU | **Free** (public spaces) |
| API Endpoint | **Free** |
| Unlimited Requests | **Free** (within limits) |
| **TOTAL** | **$0/month** |

