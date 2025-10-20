#!/usr/bin/env node

/**
 * Send Welcome Message to What Swap Channel
 * Simple text message with button
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Your channel data
const CHANNEL_DATA = {
  chat_id: "-1003105272477",
  title: "What Swap Channel",
  username: "what_swap"
};

// Hardcoded message
const MESSAGE = "🎥 Swap any token at best rate";
const BUTTON_TEXT = "Start App";
const BUTTON_URL = "https://t.me/what_swap_bot/whatswap?mode=compact";

// Get bot token from environment
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN not found in .env.local file');
  process.exit(1);
}

async function sendWelcomeMessage() {
  console.log(`📤 Sending welcome message to ${CHANNEL_DATA.title}...`);
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHANNEL_DATA.chat_id,
        text: MESSAGE,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{
              text: BUTTON_TEXT,
              url: BUTTON_URL
            }]
          ]
        }
      })
    });

    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Welcome message sent successfully!');
      console.log(`📊 Message ID: ${result.result.message_id}`);
      console.log(`🔗 Channel: @${CHANNEL_DATA.username}`);
      console.log(`📝 Message: ${MESSAGE}`);
      console.log(`🔘 Button: ${BUTTON_TEXT} → ${BUTTON_URL}`);
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
  console.log('🚀 What Swap Channel - Welcome Message Sender');
  console.log('==============================================\n');

  const result = await sendWelcomeMessage();
  
  if (result) {
    console.log('\n🎉 Welcome message sent successfully!');
    console.log('📝 Note: Video upload will be added in a future update');
  } else {
    console.log('\n❌ Failed to send welcome message');
  }
}

main();
