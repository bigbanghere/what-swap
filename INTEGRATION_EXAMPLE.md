# Integration Example: AI Finance Agent in Telegram Bot

## Step 1: Install Dependencies

```bash
pnpm add ai @ai-sdk/groq zod
```

## Step 2: Get Groq API Key (Free)

1. Go to https://console.groq.com
2. Sign up (no credit card required)
3. Create API key
4. Add to `.env.local`:
   ```
   GROQ_API_KEY=your_key_here
   ```

## Step 3: Update Bot Route

Add AI integration to your Telegram bot (`src/app/api/bot/route.ts`):

```typescript
// Add after the token address check (around line 224)

// AI Finance Assistant for non-command, non-address messages
if (!isValidTONAddress(message) && !message.startsWith('/')) {
  await ctx.replyWithChatAction('typing');
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app';
    const aiResponse = await fetch(`${baseUrl}/api/ai/finance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        context: {
          userWallet: ctx.from?.id?.toString(),
          // You can add more context here from your database
          // recentSwaps: await getRecentSwaps(ctx.from?.id),
          // selectedTokens: await getUserFavoriteTokens(ctx.from?.id),
        },
      }),
    });

    if (aiResponse.ok) {
      const { response } = await aiResponse.json();
      await ctx.reply(response);
    } else {
      await ctx.reply('I encountered an issue. Please try again in a moment.');
    }
  } catch (error) {
    console.error('AI Finance Agent error:', error);
    await ctx.reply(
      'I\'m having trouble processing that. Try asking about a token address or use /help for commands.'
    );
  }
  
  return;
}
```

## Step 4: Add AI Commands

Add helpful commands to your bot:

```typescript
// Add these commands to your bot

bot.command('analyze', async (ctx) => {
  const tokenAddress = ctx.message.text.split(' ')[1];
  
  if (!tokenAddress || !isValidTONAddress(tokenAddress)) {
    await ctx.reply('Please provide a valid token address:\n/analyze <token_address>');
    return;
  }
  
  await ctx.replyWithChatAction('typing');
  
  try {
    // Get token data from your API
    const tokenData = await validateTokenExists(tokenAddress);
    
    if (!tokenData.exists || !tokenData.token) {
      await ctx.reply('Token not found.');
      return;
    }
    
    // Use AI agent to analyze
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app';
    const aiResponse = await fetch(`${baseUrl}/api/ai/finance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Analyze this token: ${tokenData.token.symbol} (${tokenAddress})`,
        context: {
          tokenData: tokenData.token,
        },
      }),
    });
    
    const { response } = await aiResponse.json();
    await ctx.reply(response);
  } catch (error) {
    await ctx.reply('Error analyzing token. Please try again.');
  }
});

bot.command('recommend', async (ctx) => {
  await ctx.replyWithChatAction('typing');
  
  // Get user's swap history (if available)
  const userId = ctx.from?.id?.toString();
  // const recentSwaps = await getRecentSwaps(userId);
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app';
  const aiResponse = await fetch(`${baseUrl}/api/ai/finance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Give me personalized swap recommendations based on current market conditions',
      context: {
        userWallet: userId,
        // recentSwaps,
      },
    }),
  });
  
  const { response } = await aiResponse.json();
  await ctx.reply(response);
});
```

## Step 5: Add Rate Limiting (Optional)

Install Upstash Redis for rate limiting:

```bash
pnpm add @upstash/ratelimit @upstash/redis
```

Create `src/lib/rate-limiter.ts`:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requests per hour
});

export async function checkRateLimit(identifier: string) {
  const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
  return { success, limit, remaining, reset };
}
```

Use in your API route:

```typescript
// app/api/ai/finance/route.ts
import { checkRateLimit } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id') || 'anonymous';
  
  const { success, remaining } = await checkRateLimit(userId);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }
  
  // ... rest of your code
}
```

## Step 6: Deploy to Vercel

1. Add environment variable in Vercel:
   - `GROQ_API_KEY` = your Groq API key

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Test the bot:
   - Send a message to your Telegram bot
   - It should respond with AI-generated finance advice!

## Example Interactions

**User:** "Should I swap TON to USDT now?"
**Bot:** "Based on current market conditions, TON to USDT swaps look favorable. Current rates suggest minimal slippage. However, this is not financial advice - always DYOR."

**User:** "Analyze NOT token"
**Bot:** "NOT token analysis: [Token details]... Overall assessment: [Analysis]... Risk level: Medium. Recommendation: [Swap recommendation]"

**User:** "Give me swap recommendations"
**Bot:** "Based on current market trends, here are some swap opportunities: [Personalized recommendations]"

## Cost Monitoring

- **Groq Free Tier**: 30 requests per minute
- **Cost**: $0 up to free tier limits
- **Vercel**: Free tier covers reasonable usage

## Scaling Tips

1. **Add caching** for common queries
2. **Implement queue system** for high traffic
3. **Use cheaper models** for simple queries
4. **Reserve premium models** for complex analysis
5. **Monitor usage** and set up alerts

## Next Steps

1. ✅ Install dependencies
2. ✅ Get Groq API key
3. ✅ Add AI integration to bot
4. ✅ Test with simple queries
5. ⬜ Add rate limiting
6. ⬜ Implement caching
7. ⬜ Add user preference tracking
8. ⬜ Create analytics dashboard

