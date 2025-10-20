#!/usr/bin/env node

/**
 * Send Message with Button to Telegram Channel
 * Uses the connected channel data from Supabase
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://uyrpbsxummoqlgnsqjla.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cnBic3h1bW1vcWxnbnNxamxhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg4ODU5NSwiZXhwIjoyMDc2NDY0NTk1fQ.HhJExcOhUWXoUP_r6YzBnAWD7uGlmLT6gdweN35xewY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Get bot token from environment or config
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN not found. Please set it in your environment variables');
  console.error('Example: BOT_TOKEN=your_bot_token node send-channel-message.js "message" "button" "url"');
  process.exit(1);
}

async function getConnectedChannels() {
  console.log('🔍 Fetching connected channels from Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('connected_chats')
      .select('*')
      .eq('chat_type', 'channel')
      .eq('is_active', true);

    if (error) {
      console.error('❌ Error fetching channels:', error.message);
      return [];
    }

    console.log(`✅ Found ${data.length} active channels`);
    return data;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return [];
  }
}

async function sendMessageWithButton(chatId, message, buttonText, buttonUrl) {
  console.log(`📤 Sending message to channel ${chatId}...`);
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
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
      
      // Store the message in database
      try {
        await supabase
          .from('bot_messages')
          .insert({
            chat_id: chatId,
            message_id: result.result.message_id,
            template_id: 'channel-announcement',
            content: message,
            parse_mode: 'HTML',
            variables: {
              button_text: buttonText,
              button_url: buttonUrl
            }
          });
        
        console.log('✅ Message stored in database');
      } catch (dbError) {
        console.error('❌ Error storing message in database:', dbError.message);
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
  console.log('🚀 Telegram Channel Message Sender');
  console.log('===================================\n');

  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node send-channel-message.js "<message>" "<button_text>" "<button_url>"');
    console.log('Example: node send-channel-message.js "🎉 Welcome to What Swap!" "Visit Website" "https://what-swap.vercel.app"');
    process.exit(1);
  }

  const [message, buttonText, buttonUrl] = args;

  // Get connected channels
  const channels = await getConnectedChannels();
  
  if (channels.length === 0) {
    console.log('❌ No active channels found');
    process.exit(1);
  }

  // Show available channels
  console.log('\n📋 Available channels:');
  channels.forEach((channel, index) => {
    console.log(`${index + 1}. ${channel.title} (@${channel.username || 'no-username'}) - ${channel.chat_id}`);
  });

  // Send to all channels or ask for selection
  if (channels.length === 1) {
    console.log(`\n🎯 Sending to: ${channels[0].title}`);
    await sendMessageWithButton(channels[0].chat_id, message, buttonText, buttonUrl);
  } else {
    console.log('\n🎯 Sending to all channels...');
    
    for (const channel of channels) {
      console.log(`\n📤 Sending to: ${channel.title}`);
      await sendMessageWithButton(channel.chat_id, message, buttonText, buttonUrl);
      
      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n🎉 All messages sent!');
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main();
