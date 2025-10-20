#!/usr/bin/env node

/**
 * Telegram Group Setup and Testing Script
 * Helps you set up your bot in a Telegram group and test messaging
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

async function getBotInfo() {
  console.log('🤖 Getting bot information...');
  const result = await makeApiRequest('/api/bot/group-management?action=bot-info');
  
  if (result.success) {
    const bot = result.data.data;
    console.log(`✅ Bot: ${bot.first_name} (@${bot.username})`);
    console.log(`   ID: ${bot.id}`);
    console.log(`   Can join groups: ${bot.can_join_groups ? 'Yes' : 'No'}`);
    console.log(`   Can read all group messages: ${bot.can_read_all_group_messages ? 'Yes' : 'No'}`);
    return bot;
  } else {
    console.error('❌ Failed to get bot info:', result.data?.error || result.error);
    return null;
  }
}

async function getGroupInfo(chatId) {
  console.log(`\n📋 Getting group information for ${chatId}...`);
  const result = await makeApiRequest(`/api/bot/group-management?action=group-info&chatId=${chatId}`);
  
  if (result.success) {
    const group = result.data.data;
    console.log(`✅ Group: ${group.title}`);
    console.log(`   ID: ${group.id}`);
    console.log(`   Type: ${group.type}`);
    if (group.username) console.log(`   Username: @${group.username}`);
    return group;
  } else {
    console.error('❌ Failed to get group info:', result.data?.error || result.error);
    return null;
  }
}

async function checkBotStatus(chatId) {
  console.log(`\n🔍 Checking bot status in group...`);
  const result = await makeApiRequest(`/api/bot/group-management?action=bot-status&chatId=${chatId}`);
  
  if (result.success) {
    const status = result.data.data;
    if (status) {
      console.log(`✅ Bot status: ${status.status}`);
      console.log(`   Can post messages: ${status.can_post_messages ? 'Yes' : 'No'}`);
      console.log(`   Can edit messages: ${status.can_edit_messages ? 'Yes' : 'No'}`);
      console.log(`   Can delete messages: ${status.can_delete_messages ? 'Yes' : 'No'}`);
      return status;
    } else {
      console.log('❌ Bot is not in this group');
      return null;
    }
  } else {
    console.error('❌ Failed to check bot status:', result.data?.error || result.error);
    return null;
  }
}

async function testSendMessage(chatId) {
  console.log(`\n📤 Testing message sending...`);
  
  const testMessage = `🤖 Test message from ${new Date().toLocaleString()}\n\nThis is a test message to verify the bot can send messages to this group.`;
  
  const result = await makeApiRequest('/api/bot/group-management', 'POST', {
    action: 'send-message',
    chatId: chatId,
    message: testMessage,
    options: {
      parseMode: 'HTML'
    }
  });
  
  if (result.success) {
    console.log('✅ Test message sent successfully!');
    console.log(`   Message ID: ${result.data.data.messageId}`);
    return true;
  } else {
    console.error('❌ Failed to send test message:', result.data?.error || result.error);
    return false;
  }
}

async function getSetupInstructions(chatId) {
  console.log(`\n📖 Getting setup instructions...`);
  const result = await makeApiRequest(`/api/bot/group-management?action=setup-instructions&chatId=${chatId}`);
  
  if (result.success) {
    console.log(result.data.data.instructions);
    return true;
  } else {
    console.error('❌ Failed to get setup instructions:', result.data?.error || result.error);
    return false;
  }
}

async function getRecentUpdates() {
  console.log(`\n📋 Getting recent updates (to find group chat IDs)...`);
  const result = await makeApiRequest('/api/bot/group-management?action=updates');
  
  if (result.success) {
    const updates = result.data.data;
    console.log(`✅ Found ${updates.length} recent updates`);
    
    const groups = updates
      .filter(update => update.message?.chat?.type === 'group' || update.message?.chat?.type === 'supergroup')
      .map(update => ({
        id: update.message.chat.id,
        title: update.message.chat.title,
        type: update.message.chat.type
      }))
      .filter((group, index, self) => 
        index === self.findIndex(g => g.id === group.id)
      );
    
    if (groups.length > 0) {
      console.log('\n📊 Groups found in recent updates:');
      groups.forEach((group, index) => {
        console.log(`   ${index + 1}. ${group.title} (ID: ${group.id}) [${group.type}]`);
      });
    } else {
      console.log('   No groups found in recent updates');
    }
    
    return groups;
  } else {
    console.error('❌ Failed to get updates:', result.data?.error || result.error);
    return [];
  }
}

async function main() {
  console.log('🚀 Telegram Group Setup and Testing');
  console.log('===================================\n');

  try {
    // Get bot info
    const bot = await getBotInfo();
    if (!bot) {
      console.log('❌ Cannot continue without bot information');
      process.exit(1);
    }

    // Get recent updates to find groups
    const groups = await getRecentUpdates();
    
    let chatId;
    if (groups.length > 0) {
      const choice = await askQuestion(`\nSelect a group (1-${groups.length}) or enter chat ID manually: `);
      const choiceNum = parseInt(choice);
      
      if (choiceNum >= 1 && choiceNum <= groups.length) {
        chatId = groups[choiceNum - 1].id.toString();
        console.log(`Selected: ${groups[choiceNum - 1].title}`);
      } else {
        chatId = choice.trim();
      }
    } else {
      chatId = await askQuestion('\nEnter your group chat ID: ');
    }

    if (!chatId) {
      console.log('❌ No chat ID provided. Exiting.');
      process.exit(1);
    }

    // Get group info
    await getGroupInfo(chatId);

    // Check bot status
    const botStatus = await checkBotStatus(chatId);
    
    if (!botStatus) {
      console.log('\n❌ Bot is not in this group. Please add the bot first.');
      await getSetupInstructions(chatId);
      process.exit(1);
    }

    if (botStatus.status !== 'administrator' && botStatus.status !== 'creator') {
      console.log('\n❌ Bot is not an admin. Please make the bot an admin with "Post Messages" permission.');
      await getSetupInstructions(chatId);
      process.exit(1);
    }

    if (!botStatus.can_post_messages) {
      console.log('\n❌ Bot cannot post messages. Please enable "Post Messages" permission for the bot.');
      await getSetupInstructions(chatId);
      process.exit(1);
    }

    // Test sending a message
    const success = await testSendMessage(chatId);
    
    if (success) {
      console.log('\n🎉 Setup complete! Your bot is ready to send messages to the group.');
      console.log('\nNext steps:');
      console.log('1. Use the manual script: node send-group-message.js "Your message"');
      console.log('2. Use the API: POST /api/bot/send-message');
      console.log('3. Set up automated messaging system');
    } else {
      console.log('\n❌ Setup incomplete. Please check the errors above and try again.');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  } finally {
    rl.close();
  }
}

main();
