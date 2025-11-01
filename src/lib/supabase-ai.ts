"use server";

import { createClient } from '@supabase/supabase-js';

/**
 * Supabase AI Integration
 * Calls Supabase Edge Functions which handle:
 * - RAG (Retrieval-Augmented Generation) via pgvector
 * - Personalization via user swap history
 * - Conversation storage
 * - Multiple AI provider fallbacks
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not set');
}

interface SupabaseAIRequest {
  message: string;
  userId?: string;
  context?: any;
}

interface SupabaseAIResponse {
  response: string;
  source: string;
  context_used: number;
  personalized: boolean;
}

/**
 * Call Supabase AI Finance Edge Function
 * This uses Supabase's infrastructure for RAG and personalization
 */
export async function callSupabaseAI(
  request: SupabaseAIRequest
): Promise<SupabaseAIResponse> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase not configured');
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data, error } = await supabase.functions.invoke('ai-finance', {
      body: {
        message: request.message,
        userId: request.userId,
        context: request.context,
      },
    });

    if (error) {
      console.error('Supabase AI function error:', error);
      throw error;
    }

    return data as SupabaseAIResponse;
  } catch (error) {
    console.error('Failed to call Supabase AI:', error);
    throw error;
  }
}

/**
 * Enhanced finance agent using Supabase
 * Combines Supabase RAG + personalization with your existing AI agent
 */
export async function supabaseFinanceAgent(
  message: string,
  userId?: string,
  context?: any
): Promise<string> {
  try {
    const result = await callSupabaseAI({ message, userId, context });
    return result.response;
  } catch (error) {
    console.error('Supabase AI failed, will need fallback:', error);
    
    // Fallback to regular AI agent if Supabase fails
    // This ensures your app always works
    throw error; // Let caller handle fallback
  }
}

