#!/usr/bin/env node

/**
 * Send Hardcoded Welcome Message to What Swap Channel
 * One-click script to send the welcome message (with pinning control)
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

async function sendWelcomeMessage(shouldPin = false) {
  console.log(`📤 Sending welcome message to ${CHANNEL_DATA.title}...`);
  console.log(`📌 Pin message: ${shouldPin ? 'YES' : 'NO'}`);
  
  try {
    const payload = {
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
    };

    // Add pinning if requested
    if (shouldPin) {
      payload.disable_notification = false; // Allow notifications for pinned messages
    }

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Welcome message sent successfully!');
      console.log(`📊 Message ID: ${result.result.message_id}`);
      console.log(`🔗 Channel: @${CHANNEL_DATA.username}`);
      console.log(`📝 Message: ${MESSAGE}`);
      console.log(`🔘 Button: ${BUTTON_TEXT} → ${BUTTON_URL}`);
      
      // Pin the message if requested
      if (shouldPin) {
        try {
          const pinResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/pinChatMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: CHANNEL_DATA.chat_id,
              message_id: result.result.message_id,
              disable_notification: false
            })
          });

          const pinResult = await pinResponse.json();
          if (pinResult.ok) {
            console.log('📌 Message pinned successfully!');
          } else {
            console.log('⚠️ Failed to pin message:', pinResult.description);
          }
        } catch (pinError) {
          console.log('⚠️ Error pinning message:', pinError.message);
        }
      }
      
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

  // Check command line arguments for pinning
  const args = process.argv.slice(2);
  const shouldPin = args.includes('--pin') || args.includes('-p');

  const result = await sendWelcomeMessage(shouldPin);
  
  if (result) {
    console.log('\n🎉 Welcome message sent successfully!');
    if (shouldPin) {
      console.log('📌 Message was pinned');
    } else {
      console.log('📌 Message was NOT pinned (use --pin flag to pin)');
    }
  } else {
    console.log('\n❌ Failed to send welcome message');
  }
}

main();
