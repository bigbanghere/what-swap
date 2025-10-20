#!/usr/bin/env node

/**
 * View Connected Chats from Supabase Database
 * Shows all chats that have interacted with the bot
 */

const readline = require('readline');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function makeApiRequest(endpoint, method = 'GET', body = null) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const result = await response.json();
    return { success: response.ok, data: result, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function viewAllChats() {
  console.log('\n📋 All Connected Chats');
  console.log('======================');
  
  const result = await makeApiRequest('/api/bot/connected-chats?action=all');
  
  if (result.success) {
    const chats = result.data.data;
    console.log(`✅ Found ${chats.length} connected chats:\n`);
    
    chats.forEach((chat, index) => {
      console.log(`${index + 1}. ${chat.title || 'Unknown'} (${chat.chat_type})`);
      console.log(`   ID: ${chat.chat_id}`);
      console.log(`   Username: ${chat.username || 'N/A'}`);
      console.log(`   Bot Status: ${chat.bot_status || 'Unknown'}`);
      console.log(`   Active: ${chat.is_active ? 'Yes' : 'No'}`);
      console.log(`   Messages: ${chat.message_count}`);
      console.log(`   Last Activity: ${new Date(chat.last_activity).toLocaleString()}`);
      console.log('');
    });
  } else {
    console.error('❌ Failed to get chats:', result.data?.error || result.error);
  }
}

async function viewActiveChats() {
  console.log('\n🟢 Active Connected Chats');
  console.log('==========================');
  
  const result = await makeApiRequest('/api/bot/connected-chats?action=active');
  
  if (result.success) {
    const chats = result.data.data;
    console.log(`✅ Found ${chats.length} active chats:\n`);
    
    chats.forEach((chat, index) => {
      console.log(`${index + 1}. ${chat.title || 'Unknown'} (${chat.chat_type})`);
      console.log(`   ID: ${chat.chat_id}`);
      console.log(`   Username: ${chat.username || 'N/A'}`);
      console.log(`   Bot Status: ${chat.bot_status || 'Unknown'}`);
      console.log(`   Can Post: ${chat.can_post_messages ? 'Yes' : 'No'}`);
      console.log(`   Messages: ${chat.message_count}`);
      console.log(`   Last Activity: ${new Date(chat.last_activity).toLocaleString()}`);
      console.log('');
    });
  } else {
    console.error('❌ Failed to get active chats:', result.data?.error || result.error);
  }
}

async function viewChatDetails() {
  console.log('\n🔍 Chat Details');
  console.log('===============');
  
  const chatId = await askQuestion('Enter chat ID: ');
  
  if (!chatId) {
    console.log('❌ No chat ID provided.');
    return;
  }

  // Get chat details
  const chatResult = await makeApiRequest(`/api/bot/connected-chats?action=single&chatId=${chatId}`);
  
  if (chatResult.success) {
    const chat = chatResult.data.data;
    if (chat) {
      console.log('\n📊 Chat Information:');
      console.log(`   Title: ${chat.title || 'N/A'}`);
      console.log(`   ID: ${chat.chat_id}`);
      console.log(`   Type: ${chat.chat_type}`);
      console.log(`   Username: ${chat.username || 'N/A'}`);
      console.log(`   Description: ${chat.description || 'N/A'}`);
      console.log(`   Bot Status: ${chat.bot_status || 'Unknown'}`);
      console.log(`   Can Post Messages: ${chat.can_post_messages ? 'Yes' : 'No'}`);
      console.log(`   Can Edit Messages: ${chat.can_edit_messages ? 'Yes' : 'No'}`);
      console.log(`   Can Delete Messages: ${chat.can_delete_messages ? 'Yes' : 'No'}`);
      console.log(`   Can Manage Chat: ${chat.can_manage_chat ? 'Yes' : 'No'}`);
      console.log(`   Active: ${chat.is_active ? 'Yes' : 'No'}`);
      console.log(`   Message Count: ${chat.message_count}`);
      console.log(`   First Seen: ${new Date(chat.first_seen).toLocaleString()}`);
      console.log(`   Last Activity: ${new Date(chat.last_activity).toLocaleString()}`);
    } else {
      console.log('❌ Chat not found in database.');
    }
  } else {
    console.error('❌ Failed to get chat details:', chatResult.data?.error || chatResult.error);
  }

  // Get chat messages
  const messagesResult = await makeApiRequest(`/api/bot/connected-chats?action=messages&chatId=${chatId}&limit=10`);
  
  if (messagesResult.success) {
    const messages = messagesResult.data.data;
    console.log(`\n📝 Recent Messages (${messages.length}):`);
    
    messages.forEach((message, index) => {
      console.log(`   ${index + 1}. [${message.template_id || 'manual'}] ${message.content.substring(0, 50)}...`);
      console.log(`      Sent: ${new Date(message.sent_at).toLocaleString()}`);
      console.log('');
    });
  } else {
    console.error('❌ Failed to get messages:', messagesResult.data?.error || messagesResult.error);
  }
}

async function viewStatistics() {
  console.log('\n📊 Chat Statistics');
  console.log('==================');
  
  const result = await makeApiRequest('/api/bot/connected-chats?action=statistics');
  
  if (result.success) {
    const stats = result.data.data;
    console.log('✅ Database Statistics:');
    console.log(`   Total Chats: ${stats.totalChats}`);
    console.log(`   Active Chats: ${stats.activeChats}`);
    console.log(`   Total Messages: ${stats.totalMessages}`);
    console.log('\n   Chats by Type:');
    Object.entries(stats.chatsByType).forEach(([type, count]) => {
      console.log(`     ${type}: ${count}`);
    });
  } else {
    console.error('❌ Failed to get statistics:', result.data?.error || result.error);
  }
}

async function main() {
  console.log('🗄️  Connected Chats Database Viewer');
  console.log('===================================\n');

  const options = [
    { name: 'View All Chats', func: viewAllChats },
    { name: 'View Active Chats', func: viewActiveChats },
    { name: 'View Chat Details', func: viewChatDetails },
    { name: 'View Statistics', func: viewStatistics }
  ];

  while (true) {
    console.log('\nAvailable Options:');
    options.forEach((option, index) => {
      console.log(`   ${index + 1}. ${option.name}`);
    });
    console.log('   0. Exit');

    const choice = await askQuestion('\nSelect an option (0-4): ');
    const choiceNum = parseInt(choice);

    if (choiceNum === 0) {
      console.log('👋 Goodbye!');
      break;
    } else if (choiceNum >= 1 && choiceNum <= options.length) {
      try {
        await options[choiceNum - 1].func();
      } catch (error) {
        console.error('❌ Error:', error.message);
      }
    } else {
      console.log('❌ Invalid choice. Please try again.');
    }
  }

  rl.close();
}

main();
