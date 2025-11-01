# Using Supabase with Custom AI Models

## TL;DR: Can Supabase Host Models?

**Direct Inference: ❌ No** - Supabase Edge Functions have same limitations as Vercel (no GPU, memory limits)

**However, Supabase is PERFECT for:**
- ✅ **Storage**: Store model artifacts, weights, datasets
- ✅ **pgvector**: Store embeddings for RAG (Retrieval-Augmented Generation)
- ✅ **Edge Functions**: Gateway to call external AI services
- ✅ **Database**: Store conversation history, training data, model metadata
- ✅ **Real-time**: Push AI responses to clients in real-time

---

## 🏗️ Architecture: Supabase + External Model Hosting

```
┌─────────────────┐
│   Vercel App    │
│   (Frontend)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Supabase Edge   │  ← AI Gateway
│   Function      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────┐
│ Supabase│ │ External │
│  pgvector│ │  Model   │
│ (RAG)   │ │ (Inference)│
└─────────┘ └──────────┘
    │            │
    └────┬───────┘
         │
         ▼
┌─────────────────┐
│ Supabase Storage│
│ (Model artifacts)│
└─────────────────┘
```

---

## ✅ What You CAN Do with Supabase

### 1. **pgvector for RAG (Retrieval-Augmented Generation)**

Enhance your AI with context from your database!

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table for finance knowledge
CREATE TABLE finance_embeddings (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 dimension
  metadata JSONB,
  token_symbol TEXT,
  token_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for similarity search
CREATE INDEX ON finance_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Example: Store token knowledge
INSERT INTO finance_embeddings (content, embedding, token_symbol, metadata)
VALUES (
  'TON (Toncoin) is the native cryptocurrency of The Open Network blockchain...',
  '[0.1, 0.2, ...]', -- Your embedding vector
  'TON',
  '{"type": "token_info", "source": "whatswap"}'
);
```

**Use in your AI:**

```typescript
// supabase/functions/ai-with-rag/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Generate embedding for user query
const userQuery = "What is TON token?"
const embedding = await generateEmbedding(userQuery) // Use OpenAI/Groq

// Find relevant context from pgvector
const { data } = await supabase
  .rpc('match_finance_embeddings', {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: 5
  })

// Combine context with AI prompt
const enhancedPrompt = `
Context from knowledge base:
${data.map(d => d.content).join('\n')}

User question: ${userQuery}
`

// Send to your AI model with context
const aiResponse = await callYourAIModel(enhancedPrompt)
```

---

### 2. **Supabase Storage for Model Artifacts**

Store your fine-tuned models, datasets, and weights:

```typescript
// supabase/functions/deploy-model/index.ts
import { createClient } from '@supabase/supabase-js'

// Upload fine-tuned model
const modelFile = await Deno.readFile('./finance-llama-finetuned.bin')

const { data, error } = await supabase
  .storage
  .from('ai-models')
  .upload('finance-llama/v1/model.bin', modelFile, {
    contentType: 'application/octet-stream',
    upsert: true
  })

// Get public URL for model loading
const { data: { publicUrl } } = supabase
  .storage
  .from('ai-models')
  .getPublicUrl('finance-llama/v1/model.bin')
```

---

### 3. **Edge Functions as AI Gateway**

Use Supabase Edge Functions to route requests to your models:

```typescript
// supabase/functions/ai-finance/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, userId } = await req.json()
    
    // Get user's conversation history from Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Retrieve context from pgvector (RAG)
    const queryEmbedding = await generateEmbedding(message)
    const { data: context } = await supabase.rpc('match_finance_embeddings', {
      query_embedding: queryEmbedding,
      match_count: 3
    })

    // Get user's swap history for personalization
    const { data: swapHistory } = await supabase
      .from('swap_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Call your external AI model (Replicate, HuggingFace, etc.)
    const aiResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${Deno.env.get('REPLICATE_API_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'your-model-version',
        input: {
          prompt: buildPrompt(message, context, swapHistory),
          max_length: 500,
        },
      }),
    })

    const result = await aiResponse.json()

    // Store conversation in Supabase
    await supabase.from('conversations').insert({
      user_id: userId,
      message,
      response: result.output,
      context_used: context.map(c => c.id),
      created_at: new Date().toISOString(),
    })

    return new Response(
      JSON.stringify({ response: result.output }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

---

### 4. **Store Training Data & Conversation History**

Perfect for fine-tuning and improving your model:

```sql
-- Create tables for AI training
CREATE TABLE conversations (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(user_id),
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  context_used JSONB,
  model_version TEXT,
  feedback INTEGER, -- -1, 0, 1 (thumbs down, neutral, thumbs up)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE training_data (
  id BIGSERIAL PRIMARY KEY,
  instruction TEXT NOT NULL,
  input TEXT,
  output TEXT NOT NULL,
  source TEXT, -- 'conversation', 'manual', 'synthetic'
  quality_score FLOAT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE model_metadata (
  id BIGSERIAL PRIMARY KEY,
  model_name TEXT NOT NULL,
  version TEXT NOT NULL,
  base_model TEXT,
  training_data_size INTEGER,
  fine_tuned_on TIMESTAMPTZ,
  deployed_at TIMESTAMPTZ,
  performance_metrics JSONB,
  storage_path TEXT,
  is_active BOOLEAN DEFAULT FALSE
);
```

**Extract training data from conversations:**

```typescript
// Export conversations for fine-tuning
async function exportTrainingData() {
  const { data } = await supabase
    .from('conversations')
    .select('message, response')
    .eq('feedback', 1) // Only high-quality conversations
    .gte('created_at', '2024-01-01')

  const trainingData = data.map(conv => ({
    instruction: conv.message,
    input: "",
    output: conv.response,
    source: 'conversation'
  }))

  // Save to Supabase Storage for fine-tuning
  await supabase.storage
    .from('ai-models')
    .upload('datasets/conversations-v1.json', JSON.stringify(trainingData))
}
```

---

### 5. **Real-Time AI Responses**

Push AI responses to clients in real-time:

```typescript
// Client-side (Next.js)
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Subscribe to AI responses
const channel = supabase
  .channel('ai-responses')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'conversations',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      // Real-time AI response received!
      setAiResponse(payload.new.response)
    }
  )
  .subscribe()

// Trigger AI request (via Edge Function)
await fetch('https://your-project.supabase.co/functions/v1/ai-finance', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ message: userMessage, userId }),
})

// Response will appear via real-time subscription!
```

---

## 🚀 Complete Implementation Example

### Step 1: Setup pgvector

```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table
CREATE TABLE finance_knowledge (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(1536),
  category TEXT,
  token_symbol TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create similarity search function
CREATE OR REPLACE FUNCTION match_finance_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id bigint,
  content text,
  similarity float,
  token_symbol text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    finance_knowledge.id,
    finance_knowledge.content,
    1 - (finance_knowledge.embedding <=> query_embedding) as similarity,
    finance_knowledge.token_symbol
  FROM finance_knowledge
  WHERE 1 - (finance_knowledge.embedding <=> query_embedding) > match_threshold
  ORDER BY finance_knowledge.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### Step 2: Create Supabase Edge Function

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize (if not done)
supabase init

# Create Edge Function
supabase functions new ai-finance
```

```typescript
// supabase/functions/ai-finance/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, userId } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
      }
    )

    // 1. Generate embedding for query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: message,
      }),
    })
    const embeddingData = await embeddingResponse.json()
    const queryEmbedding = embeddingData.data[0].embedding

    // 2. Find relevant context (RAG)
    const { data: context } = await supabase.rpc('match_finance_knowledge', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 3,
    })

    // 3. Get user's swap history
    const { data: swapHistory } = await supabase
      .from('swap_history')
      .select('*')
      .eq('user_id', userId)
      .limit(5)

    // 4. Call your AI model (external)
    const aiPrompt = `
Context from knowledge base:
${context?.map(c => c.content).join('\n')}

User's recent swaps:
${swapHistory?.map(s => `${s.amount} ${s.from_token} → ${s.to_token}`).join('\n')}

User question: ${message}
`

    // Call Replicate, HuggingFace, or your custom model
    const aiResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${Deno.env.get('REPLICATE_API_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: Deno.env.get('REPLICATE_MODEL_VERSION'),
        input: { prompt: aiPrompt },
      }),
    })

    const result = await aiResponse.json()
    
    // 5. Store conversation
    await supabase.from('conversations').insert({
      user_id: userId,
      message,
      response: result.output,
      context_ids: context?.map(c => c.id),
    })

    return new Response(
      JSON.stringify({ response: result.output }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders } }
    )
  }
})
```

### Step 3: Use from Vercel

```typescript
// src/lib/supabase-ai.ts
import { createClient } from '@supabase/supabase-js'

export async function callSupabaseAI(message: string, userId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Call Supabase Edge Function
  const { data, error } = await supabase.functions.invoke('ai-finance', {
    body: { message, userId },
  })

  if (error) throw error
  return data.response
}
```

---

## 📊 Architecture Benefits

| Feature | Supabase | External Model Hosting |
|---------|----------|------------------------|
| **Storage** | ✅ Free tier: 1GB | ✅ Pay per use |
| **RAG/Embeddings** | ✅ pgvector built-in | ❌ Need separate service |
| **Conversation History** | ✅ PostgreSQL | ❌ Need separate DB |
| **Real-time** | ✅ Built-in | ❌ Need separate service |
| **Model Inference** | ❌ Not supported | ✅ GPU compute |
| **Cost** | $0-25/month | $0.001-0.01/request |

---

## ✅ Recommended Setup for What Swap

1. **Use Supabase for:**
   - ✅ pgvector (RAG with token knowledge)
   - ✅ Conversation history storage
   - ✅ User swap history (already have this!)
   - ✅ Training data collection
   - ✅ Real-time AI response delivery

2. **Use External Services for:**
   - ✅ Model inference (Replicate, HuggingFace, RunPod)
   - ✅ Fine-tuning (Together AI, HuggingFace)

3. **Hybrid Architecture:**
   ```
   User Query
      ↓
   Supabase Edge Function
      ↓
   pgvector (RAG) → Relevant Context
      ↓
   User Swap History → Personalization
      ↓
   External AI Model → Response
      ↓
   Supabase Database → Store Conversation
      ↓
   Real-time → Push to Client
   ```

---

## 🎯 Next Steps

1. ✅ Enable pgvector in Supabase
2. ✅ Create embeddings table
3. ✅ Populate with finance knowledge
4. ✅ Create Edge Function
5. ✅ Connect to your external model
6. ✅ Integrate with existing Supabase database

**Result:** Cost-effective, scalable AI with RAG, personalized responses, and conversation history - all managed in Supabase!

