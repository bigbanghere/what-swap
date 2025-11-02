"""
What Swap Finance AI - Hugging Face Space
Deploy your own finance AI model for free!
"""

import gradio as gr
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import torch
import os

# Load model (will cache after first run)
# Use your fine-tuned model or a base model
MODEL_NAME = os.getenv("HF_MODEL_NAME", "meta-llama/Llama-3-8b-chat-hf")

print(f"Loading model: {MODEL_NAME}")

try:
    # Try to load with pipeline (simpler, auto-handles device)
    pipe = pipeline(
        "text-generation",
        model=MODEL_NAME,
        torch_dtype=torch.float16,
        device_map="auto",
        model_kwargs={"low_cpu_mem_usage": True},
    )
    print("Model loaded successfully with pipeline!")
    use_pipeline = True
except Exception as e:
    print(f"Pipeline loading failed: {e}, trying direct load...")
    try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_NAME,
            torch_dtype=torch.float16,
            device_map="auto",
        )
        use_pipeline = False
        print("Model loaded successfully!")
    except Exception as e2:
        print(f"Direct load also failed: {e2}")
        raise

FINANCE_SYSTEM_PROMPT = """You are an expert financial AI assistant for What Swap, a TON blockchain token swap service.

Your capabilities:
- Analyze tokens and provide insights
- Recommend swap strategies based on market conditions
- Explain token metrics and fundamentals
- Assess risk levels for swaps
- Provide personalized recommendations
- Answer questions about DeFi, tokens, and crypto trading

Guidelines:
- Be concise and actionable (max 3-4 sentences unless detailed analysis needed)
- Use emojis sparingly but effectively
- Always emphasize that this is NOT financial advice
- Reference specific token data when available
- If you don't know something, say so honestly

Format responses in a friendly, helpful tone suitable for a Telegram bot."""

def generate_response(message, history):
    """Generate finance AI response"""
    try:
        # Format prompt with system context
        prompt = f"{FINANCE_SYSTEM_PROMPT}\n\nUser: {message}\nAssistant:"
        
        if use_pipeline:
            # Use pipeline (simpler)
            result = pipe(
                prompt,
                max_new_tokens=500,
                temperature=0.7,
                do_sample=True,
                return_full_text=False,
            )
            response = result[0]['generated_text'].strip()
        else:
            # Use direct model
            inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
            
            with torch.no_grad():
                outputs = model.generate(
                    **inputs,
                    max_new_tokens=500,
                    temperature=0.7,
                    do_sample=True,
                    pad_token_id=tokenizer.eos_token_id,
                )
            
            response = tokenizer.decode(outputs[0], skip_special_tokens=True)
            # Extract just the assistant's response
            if "Assistant:" in response:
                response = response.split("Assistant:")[-1].strip()
            else:
                # Remove the prompt part
                response = response.replace(prompt, "").strip()
        
        return response
    except Exception as e:
        return f"I encountered an error: {str(e)}. Please try again."

# Create Gradio Chat Interface
iface = gr.ChatInterface(
    fn=generate_response,
    title="🤖 What Swap Finance AI",
    description="""
    Ask questions about tokens, swaps, and DeFi. This is a finance AI assistant 
    specifically trained for the What Swap platform.
    
    **Examples:**
    - "Analyze TON token"
    - "Should I swap TON to USDT now?"
    - "What are the risks of swapping NOT?"
    """,
    examples=[
        "Analyze TON token",
        "Should I swap TON to USDT?",
        "What are the risks of swapping NOT token?",
        "Explain liquidity pools",
        "When is the best time to swap tokens?",
    ],
    theme=gr.themes.Soft(),
    cache_examples=False,
)

if __name__ == "__main__":
    iface.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,  # Set to True if you want public link
    )

