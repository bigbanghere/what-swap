# Wallet Assistant Chatbot - Complete Setup Guide

## 🎯 What You Get

A **100% free** AI chatbot that helps users:
- ✅ **Connect & manage wallets** - Guide users on wallet setup
- ✅ **Analyze blockchain data** - Portfolio analysis, token holdings, balance checks
- ✅ **Swap assistance** - Personalized swap recommendations
- ✅ **Earning strategies** - Suggest ways to earn more with holdings

## 💰 Cost: $0/month

Uses:
- Groq API (free, 30 RPM)
- Hugging Face (free, 1K/month)
- Your existing wallet infrastructure

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
pnpm add @ai-sdk/groq ai @huggingface/inference lucide-react
```

### Step 2: Get Free API Keys

1. **Groq** (recommended):
   - Go to https://console.groq.com
   - Sign up (no credit card)
   - Get API key
   - Add to `.env.local`: `GROQ_API_KEY=your_key`

2. **Hugging Face** (fallback):
   - Go to https://huggingface.co/settings/tokens
   - Create token
   - Add to `.env.local`: `HF_API_TOKEN=your_token`

### Step 3: Use the Chatbot

**Option A: Add to Your Web App**

```tsx
// In your page/component
import { WalletChatbot } from '@/components/WalletChatbot';

export default function MyPage() {
  return (
    <div className="h-[600px]">
      <WalletChatbot />
    </div>
  );
}
```

**Option B: Use in Telegram Bot**

```typescript
// In your bot route (src/app/api/bot/route.ts)
bot.on('message:text', async (ctx) => {
  const message = ctx.message.text;
  
  // Skip commands
  if (message.startsWith('/')) return;
  
  await ctx.replyWithChatAction('typing');
  
  try {
    // Get user's wallet address if stored
    const walletAddress = await getUserWalletAddress(ctx.from.id);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/chatbot/wallet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        walletAddress,
      }),
    });
    
    const { response: aiResponse } = await response.json();
    await ctx.reply(aiResponse);
  } catch (error) {
    await ctx.reply('I encountered an error. Please try again.');
  }
});
```

---

## 💬 Example Conversations

### Wallet Help
**User:** "How do I connect my wallet?"
**Bot:** "To connect your wallet on What Swap:
1. Click the wallet button in the top right
2. Choose your wallet (TON Wallet, Tonkeeper, etc.)
3. Approve the connection
4. Your balance will appear automatically

Once connected, I can help you analyze your holdings and suggest swaps! 💰"

### Balance Check
**User:** "What's my balance?"
**Bot:** "Your wallet balance:
- **TON**: 15.5 TON ($38.75)
- **USDT**: 250 USDT
- **NOT**: 1,200 NOT ($0.48)

Total value: ~$289.23

Would you like me to suggest swap opportunities? 🔄"

### Swap Recommendation
**User:** "Should I swap TON to USDT?"
**Bot:** "Based on current market:
- **Current rate**: 1 TON ≈ 2.5 USDT
- **Your holdings**: 15.5 TON
- **Potential**: ~38.75 USDT

**Recommendation**: 
✅ Good time to swap if you want stablecoin exposure
⚠️ Consider keeping some TON for gas fees
📊 Liquidity is good, slippage should be minimal (<1%)

⚠️ **Not financial advice** - Always DYOR!"

### Earning Strategy
**User:** "How can I earn more?"
**Bot:** "Earning opportunities with your holdings:

1. **Swap for Higher-Yield Tokens**
   - Consider staking tokens if available
   - Look for tokens with farming rewards

2. **Portfolio Rebalancing**
   - You're 53% TON, 47% USDT
   - Consider adding NOT or other promising tokens

3. **Active Trading**
   - Monitor for arbitrage opportunities
   - Swap during high volatility for better rates

4. **DCA Strategy**
   - Dollar-cost average into preferred tokens
   - Reduces timing risk

⚠️ **Not financial advice** - DYOR before any decisions! 🚀"

---

## 🔧 API Usage

### Basic Usage

```typescript
import { walletAssistant } from '@/lib/wallet-assistant-bot';

const result = await walletAssistant({
  message: 'Analyze my portfolio',
  walletAddress: '0:abc123...',
});

console.log(result.response);
```

### Available Functions

```typescript
// Analyze portfolio
const analysis = await analyzePortfolio(walletAddress);

// Suggest swaps
const swaps = await suggestSwaps(walletAddress);

// Earning strategies
const strategies = await suggestEarningStrategies(walletAddress);
```

---

## 📋 Features

### ✅ Wallet Integration
- Automatic balance fetching
- Token holdings analysis
- Real-time data updates

### ✅ Blockchain Analysis
- Portfolio composition
- Risk assessment
- Token price analysis
- Market trends

### ✅ Swap Assistance
- Personalized recommendations
- Optimal timing suggestions
- Slippage warnings
- Risk analysis

### ✅ Earning Strategies
- Profit opportunities
- Portfolio optimization
- Diversification tips
- Risk management

---

## 🎨 Customization

### Modify System Prompt

Edit `src/lib/wallet-assistant-bot.ts`:

```typescript
const systemPrompt = `Your custom instructions here...`;
```

### Add Custom Actions

```typescript
// Detect custom intents
if (message.includes('your-keyword')) {
  // Handle custom action
}
```

### Style the Chatbot

Edit `src/components/WalletChatbot.tsx` to match your design system.

---

## 🚀 Deployment

### Vercel Environment Variables

Add to Vercel dashboard:
- `GROQ_API_KEY` = your Groq key
- `HF_API_TOKEN` = your HF token (optional)

### Deploy

```bash
vercel --prod
```

That's it! Your chatbot is live! 🎉

---

## 📊 Usage Examples

### Web App Integration

```tsx
// app/dashboard/page.tsx
import { WalletChatbot } from '@/components/WalletChatbot';

export default function Dashboard() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <SwapForm />
      <WalletChatbot />
    </div>
  );
}
```

### Telegram Bot Integration

```typescript
// Full example in INTEGRATION_EXAMPLE.md
```

### Standalone API

```bash
curl -X POST https://your-app.vercel.app/api/chatbot/wallet \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is my balance?",
    "walletAddress": "0:abc123..."
  }'
```

---

## ✅ Checklist

- [ ] Install dependencies
- [ ] Get Groq API key (free)
- [ ] Add to environment variables
- [ ] Test locally
- [ ] Add chatbot component to app
- [ ] Deploy to Vercel
- [ ] Test in production

**Total setup time: ~10 minutes** ⏱️

---

## 🎯 Next Steps

1. ✅ Deploy the chatbot
2. ⬜ Customize system prompt for your brand
3. ⬜ Add more context (swap history, etc.)
4. ⬜ Integrate with Supabase for conversation storage
5. ⬜ Add analytics to track popular queries

---

## 💡 Tips

- **Rate Limiting**: Groq allows 30 RPM - implement user-level rate limiting
- **Caching**: Cache common queries to save API calls
- **Context**: The more wallet context you provide, the better responses
- **Fallbacks**: Always have fallback responses for API failures

---

**Your free wallet assistant is ready! No credit card, no cost, just helpful AI! 🎉**

