#!/usr/bin/env node

/**
 * Script to manually send messages to a Telegram group
 * Usage: node send-group-message.js "Your message here"
 * 
 * Before using:
 * 1. Make sure your bot is added to the group as admin
 * 2. Set BOT_TOKEN in your environment or .env.local
 * 3. Get your group chat ID (see instructions below)
 */

const readline = require('readline');

// Configuration
const BOT_TOKEN = process.env.BOT_TOKEN;
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

if (!BOT_TOKEN) {
  console.error('❌ Error: BOT_TOKEN environment variable is not set');
  console.log('Please set your bot token:');
  console.log('1. Copy bot-config.example to .env.local');
  console.log('2. Add your bot token to .env.local');
  console.log('3. Or set BOT_TOKEN=your_token_here');
  process.exit(1);
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function getGroupChatId() {
  console.log('\n📋 To get your group chat ID:');
  console.log('1. Add your bot to the group as admin');
  console.log('2. Send a message in the group (like "test")');
  console.log('3. Visit: https://api.telegram.org/bot' + BOT_TOKEN + '/getUpdates');
  console.log('4. Look for "chat":{"id":-123456789} in the response');
  console.log('5. The negative number is your group chat ID\n');
  
  const chatId = await askQuestion('Enter your group chat ID: ');
  return chatId.trim();
}

async function sendMessage(chatId, message, parseMode = 'HTML') {
  try {
    console.log(`\n📤 Sending message to group ${chatId}...`);
    
    const response = await fetch(`${API_BASE_URL}/api/bot/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId: chatId,
        message: message,
        parseMode: parseMode
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ Message sent successfully!');
      console.log(`📝 Message ID: ${result.messageId}`);
      console.log(`💬 Chat: ${result.chat.title || 'Group'}`);
    } else {
      console.error('❌ Failed to send message:');
      console.error(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ Error sending message:', error.message);
    console.log('Make sure your Next.js server is running: npm run dev');
  }
}

async function main() {
  console.log('🤖 Telegram Group Message Sender');
  console.log('================================\n');

  try {
    // Get group chat ID
    const chatId = await getGroupChatId();
    
    if (!chatId) {
      console.log('❌ No chat ID provided. Exiting.');
      process.exit(1);
    }

    // Get message from command line or prompt
    let message = process.argv[2];
    
    if (!message) {
      message = await askQuestion('Enter your message: ');
    }

    if (!message.trim()) {
      console.log('❌ No message provided. Exiting.');
      process.exit(1);
    }

    // Ask for parse mode
    const parseMode = await askQuestion('Parse mode (HTML/Markdown/MarkdownV2) [HTML]: ') || 'HTML';

    // Send the message
    await sendMessage(chatId, message, parseMode);

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  } finally {
    rl.close();
  }
}

// Handle command line usage
if (process.argv[2]) {
  main();
} else {
  console.log('Usage: node send-group-message.js "Your message here"');
  console.log('Or run without arguments for interactive mode\n');
  main();
}
