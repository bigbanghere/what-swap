#!/usr/bin/env node

/**
 * Send Hardcoded Welcome Message to What Swap Channel
 * One-click script to send the welcome message
 */

const fs = require('fs');
const FormData = require('form-data');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Your channel data
const CHANNEL_DATA = {
  chat_id: "-1003105272477",
  title: "What Swap Channel",
  username: "what_swap"
};

// Hardcoded message
const MESSAGE = "What Swap – Best Rate";
const BUTTON_TEXT = "Go to What Swap";
const BUTTON_URL = "https://t.me/what_swap_bot/whatswap?mode=compact";

// Get bot token from environment
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN not found in .env.local file');
  process.exit(1);
}

async function sendWelcomeMessage() {
  console.log(`📤 Sending welcome message with video to ${CHANNEL_DATA.title}...`);
  
  try {
    // Check if video file exists
    if (!fs.existsSync('./ws_lead_video.mp4')) {
      console.log('⚠️ Video file not found, falling back to text message...');
      return await sendTextMessage();
    }

    // Create form data for video upload
    const form = new FormData();
    form.append('chat_id', CHANNEL_DATA.chat_id);
    form.append('video', fs.createReadStream('./ws_lead_video.mp4'));
    form.append('caption', MESSAGE);
    form.append('parse_mode', 'HTML');
    form.append('reply_markup', JSON.stringify({
      inline_keyboard: [
        [{
          text: BUTTON_TEXT,
          url: BUTTON_URL
        }]
      ]
    }));

    // Send video with proper headers
    const videoResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`, {
      method: 'POST',
      headers: form.getHeaders(),
      body: form
    });

    const videoResult = await videoResponse.json();
    
    if (videoResult.ok) {
      console.log('✅ Welcome video sent successfully!');
      console.log(`📊 Message ID: ${videoResult.result.message_id}`);
      console.log(`🔗 Channel: @${CHANNEL_DATA.username}`);
      console.log(`📝 Caption: ${MESSAGE}`);
      console.log(`🔘 Button: ${BUTTON_TEXT} → ${BUTTON_URL}`);
      console.log(`🎥 Video: ws_lead_video.mp4`);
      return videoResult.result;
    } else {
      console.error('❌ Failed to send video:', videoResult.description);
      
      // Fallback to text message if video fails
      console.log('🔄 Falling back to text message...');
      return await sendTextMessage();
    }
  } catch (error) {
    console.error('❌ Error sending video:', error.message);
    console.log('🔄 Falling back to text message...');
    return await sendTextMessage();
  }
}

async function sendTextMessage() {
  console.log('📤 Sending text message as fallback...');
  
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
      console.log('✅ Text message sent successfully!');
      console.log(`📊 Message ID: ${result.result.message_id}`);
      console.log(`🔗 Channel: @${CHANNEL_DATA.username}`);
      console.log(`📝 Message: ${MESSAGE}`);
      console.log(`🔘 Button: ${BUTTON_TEXT} → ${BUTTON_URL}`);
      return result.result;
    } else {
      console.error('❌ Failed to send text message:', result.description);
      return null;
    }
  } catch (error) {
    console.error('❌ Error sending text message:', error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 What Swap Channel - Welcome Message Sender');
  console.log('==============================================\n');

  const result = await sendWelcomeMessage();
  
  if (result) {
    console.log('\n🎉 Welcome message sent successfully!');
  } else {
    console.log('\n❌ Failed to send welcome message');
  }
}

main();
