#!/usr/bin/env node

/**
 * Send Message to What Swap Channel
 * Uses the specific channel data from your JSON
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Your channel data
const CHANNEL_DATA = {
  chat_id: "-1003105272477",
  title: "What Swap Channel",
  username: "what_swap"
};

// Get bot token from environment or config
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN not found. Please set it in your environment variables');
  console.error('Example: BOT_TOKEN=your_bot_token node send-what-swap-message.js "message" "button" "url"');
  process.exit(1);
}

async function sendMessageWithButton(message, buttonText, buttonUrl) {
  console.log(`📤 Sending message to ${CHANNEL_DATA.title}...`);
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHANNEL_DATA.chat_id,
        text: message,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{
              text: buttonText,
              url: buttonUrl
            }]
          ]
        }
      })
    });

    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Message sent successfully!');
      console.log(`📊 Message ID: ${result.result.message_id}`);
      console.log(`🔗 Channel: @${CHANNEL_DATA.username}`);
      return result.result;
    } else {
      console.error('❌ Failed to send message:', result.description);
      return null;
    }
  } catch (error) {
    console.error('❌ Error sending message:', error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 What Swap Channel Message Sender');
  console.log('====================================\n');

  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Usage: node send-what-swap-message.js "<message>" "<button_text>" "<button_url>"');
    console.log('\nExamples:');
    console.log('node send-what-swap-message.js "🎉 Welcome to What Swap!" "Visit Website" "https://what-swap.vercel.app"');
    console.log('node send-what-swap-message.js "📊 Daily Update" "Check Stats" "https://what-swap.vercel.app/stats"');
    console.log('node send-what-swap-message.js "🔄 New Feature Available!" "Try Now" "https://what-swap.vercel.app"');
    process.exit(1);
  }

  const [message, buttonText, buttonUrl] = args;

  console.log(`📋 Channel: ${CHANNEL_DATA.title} (@${CHANNEL_DATA.username})`);
  console.log(`📝 Message: ${message}`);
  console.log(`🔘 Button: ${buttonText} → ${buttonUrl}\n`);

  const result = await sendMessageWithButton(message, buttonText, buttonUrl);
  
  if (result) {
    console.log('\n🎉 Message sent successfully!');
    console.log(`📊 Message ID: ${result.message_id}`);
    console.log(`🔗 Channel: @${CHANNEL_DATA.username}`);
  } else {
    console.log('\n❌ Failed to send message');
  }
}

main();
