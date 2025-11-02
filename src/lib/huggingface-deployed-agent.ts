"use server";

// Optional Hugging Face Inference (only if installed)
let HfInference: any = null;

try {
  const hfModule = require('@huggingface/inference');
  HfInference = hfModule.HfInference;
} catch (e) {
  console.log('Hugging Face Inference not installed');
}

/**
 * Use your deployed Hugging Face Space model
 * 
 * Options:
 * 1. Use Space API endpoint (Gradio auto-creates this)
 * 2. Use Inference API (if model is on Model Hub)
 * 
 * 100% free with unlimited requests (within GPU time limits)
 */

interface DeployedModelOptions {
  message: string;
  modelName?: string;
  spaceUrl?: string;
}

/**
 * Use your deployed Hugging Face Space via API
 */
export async function callDeployedHFModel(
  options: DeployedModelOptions
): Promise<string> {
  const { message, modelName, spaceUrl } = options;

  // Option 1: Use Space API (if using Gradio - recommended)
  // Gradio automatically creates /api/predict endpoint
  if (spaceUrl || process.env.HF_SPACE_API_URL) {
    try {
      const apiUrl = spaceUrl || process.env.HF_SPACE_API_URL!;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [message],
        }),
      });

      if (!response.ok) {
        throw new Error(`Space API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Handle different Gradio response formats
      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        return result.data[0];
      } else if (result.output) {
        return result.output;
      } else if (typeof result === 'string') {
        return result;
      }
      
      throw new Error('Unexpected response format');
    } catch (error) {
      console.error('Space API failed:', error);
      // Fall through to Inference API
    }
  }

  // Option 2: Use Inference API (if model is on Model Hub)
  if (process.env.HF_API_TOKEN && HfInference) {
    try {
      const hf = new HfInference(process.env.HF_API_TOKEN);
      
      const model = modelName || process.env.HF_DEPLOYED_MODEL || 
        'meta-llama/Meta-llama-3-8B-Instruct';
      
      const result = await hf.textGeneration({
        model,
        inputs: message,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false,
        },
      });

      // Handle different response formats
      if (typeof result === 'string') {
        return result;
      } else if (result.generated_text) {
        return result.generated_text;
      } else if (Array.isArray(result) && result[0]?.generated_text) {
        return result[0].generated_text;
      }
      
      return JSON.stringify(result);
    } catch (error) {
      console.error('Inference API failed:', error);
      throw error;
    }
  }

  throw new Error('No Hugging Face configuration found. Set HF_SPACE_API_URL or HF_API_TOKEN.');
}

/**
 * Check if deployed model is available
 */
export function isDeployedModelAvailable(): boolean {
  return !!(process.env.HF_SPACE_API_URL || 
           (process.env.HF_API_TOKEN && process.env.HF_DEPLOYED_MODEL));
}

