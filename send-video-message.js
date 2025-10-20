#!/usr/bin/env node

/**
 * Send Video Message to What Swap Channel
 * Uses curl to upload video file
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { exec } = require('child_process');
const fs = require('fs');

// Your channel data
const CHANNEL_DATA = {
  chat_id: "-1003105272477",
  title: "What Swap Channel",
  username: "what_swap"
};

// Hardcoded message
const MESSAGE = "Swap any token at best rate";
const BUTTON_TEXT = "Start App";
const BUTTON_URL = "https://t.me/what_swap_bot/whatswap?mode=compact";

// Get bot token from environment
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN not found in .env.local file');
  process.exit(1);
}

async function sendVideoMessage() {
  console.log(`📤 Sending video message to ${CHANNEL_DATA.title}...`);
  
  try {
    // Check if video file exists
    if (!fs.existsSync('./ws_lead_video.mp4')) {
      console.log('⚠️ Video file not found, falling back to text message...');
      return await sendTextMessage();
    }

    // Create reply markup JSON
    const replyMarkup = JSON.stringify({
      inline_keyboard: [
        [{
          text: BUTTON_TEXT,
          url: BUTTON_URL
        }]
      ]
    });

    // Use curl to send video
    const curlCommand = `curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendVideo" \\
      -F "chat_id=${CHANNEL_DATA.chat_id}" \\
      -F "video=@ws_lead_video.mp4" \\
      -F "caption=${MESSAGE}" \\
      -F "parse_mode=HTML" \\
      -F "reply_markup=${replyMarkup}"`;

    console.log('🎥 Uploading video...');
    
    exec(curlCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error sending video:', error.message);
        console.log('🔄 Falling back to text message...');
        sendTextMessage();
        return;
      }

      try {
        const result = JSON.parse(stdout);
        
        if (result.ok) {
          console.log('✅ Welcome video sent successfully!');
          console.log(`📊 Message ID: ${result.result.message_id}`);
          console.log(`🔗 Channel: @${CHANNEL_DATA.username}`);
          console.log(`📝 Caption: ${MESSAGE}`);
          console.log(`🔘 Button: ${BUTTON_TEXT} → ${BUTTON_URL}`);
          console.log(`🎥 Video: ws_lead_video.mp4`);
        } else {
          console.error('❌ Failed to send video:', result.description);
          console.log('🔄 Falling back to text message...');
          sendTextMessage();
        }
      } catch (parseError) {
        console.error('❌ Error parsing response:', parseError.message);
        console.log('🔄 Falling back to text message...');
        sendTextMessage();
      }
    });

  } catch (error) {
    console.error('❌ Error sending video:', error.message);
    console.log('🔄 Falling back to text message...');
    sendTextMessage();
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
  console.log('🚀 What Swap Channel - Video Message Sender');
  console.log('============================================\n');

  await sendVideoMessage();
}

main();
