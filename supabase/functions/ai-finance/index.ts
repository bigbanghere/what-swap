// Supabase Edge Function: AI Finance Gateway
// Routes AI requests through Supabase (RAG + personalization) to external models

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIRequest {
  message: string
  userId?: string
  context?: any
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, userId, context }: AIRequest = await req.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    })

    // Step 1: Generate embedding for RAG (if OpenAI key available)
    let relevantContext: any[] = []
    if (Deno.env.get('OPENAI_API_KEY')) {
      try {
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

        if (embeddingResponse.ok) {
          const embeddingData = await embeddingResponse.json()
          const queryEmbedding = embeddingData.data[0].embedding

          // Retrieve relevant context from pgvector
          const { data: contextData, error: contextError } = await supabase.rpc(
            'match_finance_knowledge',
            {
              query_embedding: queryEmbedding,
              match_threshold: 0.7,
              match_count: 3,
            }
          )

          if (!contextError && contextData) {
            relevantContext = contextData
          }
        }
      } catch (error) {
        console.warn('RAG lookup failed:', error)
        // Continue without context
      }
    }

    // Step 2: Get user's swap history for personalization
    let swapHistory: any[] = []
    if (userId) {
      try {
        const { data: historyData } = await supabase
          .from('swap_history')
          .select('from_token, to_token, amount, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5)

        if (historyData) {
          swapHistory = historyData
        }
      } catch (error) {
        console.warn('Failed to fetch swap history:', error)
      }
    }

    // Step 3: Build enhanced prompt
    const contextText = relevantContext.length > 0
      ? `\n\nRelevant Context:\n${relevantContext.map(c => c.content).join('\n')}`
      : ''

    const historyText = swapHistory.length > 0
      ? `\n\nUser's Recent Swaps:\n${swapHistory.map(s => 
          `${s.amount} ${s.from_token} → ${s.to_token}`
        ).join('\n')}`
      : ''

    const enhancedPrompt = `${message}${contextText}${historyText}`

    // Step 4: Call external AI model
    // Try multiple providers with fallback
    
    let aiResponse: string = ''
    let modelSource: string = ''

    // Option 1: Replicate (if configured)
    if (Deno.env.get('REPLICATE_API_TOKEN') && Deno.env.get('REPLICATE_MODEL_VERSION')) {
      try {
        const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${Deno.env.get('REPLICATE_API_TOKEN')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: Deno.env.get('REPLICATE_MODEL_VERSION'),
            input: {
              prompt: enhancedPrompt,
              max_length: 500,
              temperature: 0.7,
            },
          }),
        })

        if (replicateResponse.ok) {
          const result = await replicateResponse.json()
          
          // Poll for completion if status is 'starting'
          if (result.status === 'starting' || result.status === 'processing') {
            // Wait and poll
            await new Promise(resolve => setTimeout(resolve, 2000))
            const pollResponse = await fetch(result.urls.get, {
              headers: {
                'Authorization': `Token ${Deno.env.get('REPLICATE_API_TOKEN')}`,
              },
            })
            const pollResult = await pollResponse.json()
            
            if (pollResult.status === 'succeeded') {
              aiResponse = Array.isArray(pollResult.output) 
                ? pollResult.output.join('') 
                : String(pollResult.output)
              modelSource = 'replicate'
            }
          } else if (result.status === 'succeeded') {
            aiResponse = Array.isArray(result.output) 
              ? result.output.join('') 
              : String(result.output)
            modelSource = 'replicate'
          }
        }
      } catch (error) {
        console.warn('Replicate failed:', error)
      }
    }

    // Option 2: Hugging Face (fallback)
    if (!aiResponse && Deno.env.get('HF_API_TOKEN') && Deno.env.get('HF_MODEL_NAME')) {
      try {
        const hfResponse = await fetch(
          `https://api-inference.huggingface.co/models/${Deno.env.get('HF_MODEL_NAME')}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('HF_API_TOKEN')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: enhancedPrompt,
              parameters: {
                max_new_tokens: 500,
                temperature: 0.7,
              },
            }),
          }
        )

        if (hfResponse.ok) {
          const hfResult = await hfResponse.json()
          aiResponse = Array.isArray(hfResult) 
            ? hfResult[0].generated_text 
            : hfResult.generated_text || ''
          modelSource = 'huggingface'
        }
      } catch (error) {
        console.warn('Hugging Face failed:', error)
      }
    }

    // Option 3: Groq (final fallback - free and fast)
    if (!aiResponse && Deno.env.get('GROQ_API_KEY')) {
      try {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: 'You are a financial AI assistant for What Swap, a token swap platform.',
              },
              { role: 'user', content: enhancedPrompt },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        })

        if (groqResponse.ok) {
          const groqResult = await groqResponse.json()
          aiResponse = groqResult.choices[0].message.content
          modelSource = 'groq'
        }
      } catch (error) {
        console.warn('Groq failed:', error)
      }
    }

    // If all providers failed
    if (!aiResponse) {
      return new Response(
        JSON.stringify({ 
          error: 'AI service unavailable',
          message: 'Please try again later or configure an AI provider in environment variables.'
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 5: Store conversation in database
    if (userId) {
      try {
        await supabase.from('conversations').insert({
          user_id: userId,
          message,
          response: aiResponse,
          context_ids: relevantContext.map(c => c.id),
          model_source: modelSource,
          created_at: new Date().toISOString(),
        })
      } catch (error) {
        console.warn('Failed to store conversation:', error)
        // Continue anyway
      }
    }

    // Step 6: Return response
    return new Response(
      JSON.stringify({
        response: aiResponse,
        source: modelSource,
        context_used: relevantContext.length,
        personalized: swapHistory.length > 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('AI Finance function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

