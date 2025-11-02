# Hugging Face Setup Instructions

## ✅ Your HF Token is Ready!

Your Hugging Face API token: `hf_your_token_here` (add your actual token to environment variables)

## 🚀 Quick Setup

### Step 1: Add Token to Environment Variables

**Local Development (.env.local):**
```env
HF_API_TOKEN=hf_your_token_here
```

**Vercel Deployment:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - **Name**: `HF_API_TOKEN`
   - **Value**: `hf_your_token_here` (use your actual token)
   - **Environment**: Production, Preview, Development (all)

### Step 2: Install Dependencies

```bash
pnpm add @huggingface/inference
```

### Step 3: Test It!

1. Start your app: `pnpm dev`
2. Navigate to `/assistant` (or click "Assistant" in bottom nav)
3. Ask a question - it will use Hugging Face!

## 🎯 Using Your Own HF Space (Free GPU)

If you want to deploy your own model on Hugging Face Spaces with free GPU:

### Deploy Model:

1. Go to https://huggingface.co/spaces
2. Create new Space:
   - **SDK**: Gradio
   - **Hardware**: T4 GPU (free!)
   - **Visibility**: Public
3. Use the `app.py` from `huggingface-space-example/`
4. Deploy - get your Space URL

### Add Space URL:

```env
HF_SPACE_API_URL=https://your-username-what-swap-finance-ai.hf.space/api/predict
```

The chatbot will automatically use your deployed model!

## 📊 Current Setup

- ✅ **Primary**: Hugging Face Inference API (your token)
- ✅ **Fallback**: Groq (if configured)
- ✅ **Free**: Both are free tiers!

## 🔍 Test Your Token

```bash
curl -H "Authorization: Bearer YOUR_HF_TOKEN" \
  https://api-inference.huggingface.co/models/meta-llama/Meta-llama-3-8B-Instruct \
  -H "Content-Type: application/json" \
  -d '{"inputs": "Hello!"}'
```

If you get a response, your token works! 🎉

