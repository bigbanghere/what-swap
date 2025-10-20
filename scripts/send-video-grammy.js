#!/usr/bin/env node

/**
 * Send Video Message to What Swap Channel using grammY
 * Proper video upload with grammY framework
 */

const { Bot, InputFile } = require('grammy');
const fs = require('fs');

// Load environment variables from .env.local
require('dotenv').config({ path: '../.env.local' });

// Your channel data
const CHANNEL_DATA = {
  chat_id: "-1002536136719",
  title: "Big Bang",
  username: "bigbangbusiness"
};

// Hardcoded message
const MESSAGE = "What Swap – Best Rate";
const BUTTON_TEXT = "Open App";
const BUTTON_URL = "https://t.me/what_swap_bot/whatswap?mode=compact";

// Get bot token from environment
const BOT_TOKEN = process.env.BOT_TOKEN_PROD;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN not found in .env.local file');
  process.exit(1);
}

// Create bot instance
const bot = new Bot(BOT_TOKEN);

async function sendVideoMessage() {
  console.log(`📤 Sending video message to ${CHANNEL_DATA.title}...`);
  
  try {
    // Check if video file exists
    if (!fs.existsSync('./ws_lead_video.mp4')) {
      console.log('⚠️ Video file not found, falling back to text message...');
      return await sendTextMessage();
    }

    console.log('🎥 Uploading video...');

    // Create InputFile for video
    const videoFile = new InputFile('./ws_lead_video.mp4');
    
    // Send video using grammY
    const result = await bot.api.sendVideo(
      CHANNEL_DATA.chat_id,
      videoFile,
      {
        caption: MESSAGE,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{
              text: BUTTON_TEXT,
              url: BUTTON_URL
            }]
          ]
        }
      }
    );

    if (result) {
      console.log('✅ Welcome video sent successfully!');
      console.log(`📊 Message ID: ${result.message_id}`);
      console.log(`🔗 Channel: @${CHANNEL_DATA.username}`);
      console.log(`📝 Caption: ${MESSAGE}`);
      console.log(`🔘 Button: ${BUTTON_TEXT} → ${BUTTON_URL}`);
      console.log(`🎥 Video: ws_lead_video.mp4`);
      return result;
    } else {
      console.error('❌ Failed to send video');
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
    const result = await bot.api.sendMessage(
      CHANNEL_DATA.chat_id,
      MESSAGE,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{
              text: BUTTON_TEXT,
              url: BUTTON_URL
            }]
          ]
        }
      }
    );

    if (result) {
      console.log('✅ Text message sent successfully!');
      console.log(`📊 Message ID: ${result.message_id}`);
      console.log(`🔗 Channel: @${CHANNEL_DATA.username}`);
      console.log(`📝 Message: ${MESSAGE}`);
      console.log(`🔘 Button: ${BUTTON_TEXT} → ${BUTTON_URL}`);
      return result;
    } else {
      console.error('❌ Failed to send text message');
      return null;
    }
  } catch (error) {
    console.error('❌ Error sending text message:', error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 What Swap Channel - Video Message Sender (grammY)');
  console.log('====================================================\n');

  try {
    const result = await sendVideoMessage();
    
    if (result) {
      console.log('\n🎉 Message sent successfully!');
    } else {
      console.log('\n❌ Failed to send message');
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

main();
