#!/usr/bin/env node

/**
 * Send Hardcoded Welcome Message to What Swap Channel (NO PINNING)
 * One-click script to send the welcome message without pinning
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
const MESSAGE = "🎉 Welcome to What Swap Channel!";
const BUTTON_TEXT = "Visit Website";
const BUTTON_URL = "https://what-swap.vercel.app";

// Get bot token from environment
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN not found in .env.local file');
  process.exit(1);
}

async function sendWelcomeMessageNoPin() {
  console.log(`📤 Sending welcome message to ${CHANNEL_DATA.title}...`);
  console.log('📌 Pin message: NO (explicitly disabled)');
  
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
        disable_notification: false, // Allow notifications but don't pin
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
      console.log('📌 Message was NOT pinned');
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
  console.log('🚀 What Swap Channel - Welcome Message Sender (NO PIN)');
  console.log('======================================================\n');

  const result = await sendWelcomeMessageNoPin();
  
  if (result) {
    console.log('\n🎉 Welcome message sent successfully!');
    console.log('📌 Message was NOT pinned');
  } else {
    console.log('\n❌ Failed to send welcome message');
  }
}

main();
