#!/usr/bin/env node

/**
 * Telegram Group Messaging Examples
 * Demonstrates manual and automated messaging capabilities
 */

const readline = require('readline');

// Configuration
const BOT_TOKEN = process.env.BOT_TOKEN;
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

if (!BOT_TOKEN) {
  console.error('❌ Error: BOT_TOKEN environment variable is not set');
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

async function example1_ManualMessage() {
  console.log('\n📤 Example 1: Send Manual Message');
  console.log('==================================');
  
  const chatId = await askQuestion('Enter group chat ID: ');
  const message = await askQuestion('Enter your message: ');
  
  const result = await makeApiRequest('/api/bot/send-message', 'POST', {
    chatId: chatId,
    message: message,
    parseMode: 'HTML'
  });
  
  if (result.success) {
    console.log('✅ Message sent successfully!');
    console.log(`Message ID: ${result.data.messageId}`);
  } else {
    console.error('❌ Failed to send message:', result.data?.error);
  }
}

async function example2_CheckBotStatus() {
  console.log('\n🔍 Example 2: Check Bot Status');
  console.log('==============================');
  
  const chatId = await askQuestion('Enter group chat ID: ');
  
  const result = await makeApiRequest('/api/bot/group-management', 'POST', {
    action: 'check-permissions',
    chatId: chatId
  });
  
  if (result.success) {
    const data = result.data.data;
    console.log('✅ Bot Status:');
    console.log(`   Is Admin: ${data.isAdmin ? 'Yes' : 'No'}`);
    console.log(`   Can Send Messages: ${data.canSendMessages ? 'Yes' : 'No'}`);
    console.log(`   Status: ${data.status}`);
    console.log('   Permissions:');
    console.log(`     - Post Messages: ${data.permissions.canPostMessages ? 'Yes' : 'No'}`);
    console.log(`     - Edit Messages: ${data.permissions.canEditMessages ? 'Yes' : 'No'}`);
    console.log(`     - Delete Messages: ${data.permissions.canDeleteMessages ? 'Yes' : 'No'}`);
  } else {
    console.error('❌ Failed to check status:', result.data?.error);
  }
}

async function example3_GetTemplates() {
  console.log('\n📋 Example 3: Get Available Templates');
  console.log('=====================================');
  
  const result = await makeApiRequest('/api/bot/automated-messaging?action=templates');
  
  if (result.success) {
    const templates = result.data.data;
    console.log('✅ Available Templates:');
    templates.forEach((template, index) => {
      console.log(`   ${index + 1}. ${template.name} (${template.id})`);
      console.log(`      Content: ${template.content.substring(0, 50)}...`);
      if (template.variables && template.variables.length > 0) {
        console.log(`      Variables: ${template.variables.join(', ')}`);
      }
      console.log('');
    });
  } else {
    console.error('❌ Failed to get templates:', result.data?.error);
  }
}

async function example4_SendTemplateMessage() {
  console.log('\n📝 Example 4: Send Template Message');
  console.log('===================================');
  
  const chatId = await askQuestion('Enter group chat ID: ');
  const templateId = await askQuestion('Enter template ID (welcome, daily-update, announcement, reminder): ');
  
  // Get variables for the template
  let variables = {};
  if (templateId === 'welcome') {
    const groupName = await askQuestion('Enter group name: ');
    variables = { groupName };
  } else if (templateId === 'daily-update') {
    const content = await askQuestion('Enter update content: ');
    variables = { 
      date: new Date().toLocaleDateString(),
      content 
    };
  } else if (templateId === 'announcement') {
    const title = await askQuestion('Enter announcement title: ');
    const message = await askQuestion('Enter announcement message: ');
    variables = { 
      title, 
      message, 
      date: new Date().toLocaleDateString() 
    };
  } else if (templateId === 'reminder') {
    const message = await askQuestion('Enter reminder message: ');
    const time = await askQuestion('Enter time: ');
    variables = { message, time };
  }
  
  const result = await makeApiRequest('/api/bot/automated-messaging', 'POST', {
    action: 'send-message',
    chatId: chatId,
    templateId: templateId,
    variables: variables
  });
  
  if (result.success) {
    console.log('✅ Template message sent successfully!');
    console.log(`Message ID: ${result.data.data.messageId}`);
  } else {
    console.error('❌ Failed to send template message:', result.data?.error);
  }
}

async function example5_ScheduleMessage() {
  console.log('\n⏰ Example 5: Schedule a Message');
  console.log('===============================');
  
  const chatId = await askQuestion('Enter group chat ID: ');
  const templateId = await askQuestion('Enter template ID: ');
  const minutes = await askQuestion('Schedule in how many minutes? ');
  
  const scheduledFor = new Date(Date.now() + parseInt(minutes) * 60 * 1000);
  
  const result = await makeApiRequest('/api/bot/automated-messaging', 'POST', {
    action: 'schedule-message',
    id: `scheduled_${Date.now()}`,
    chatId: chatId,
    templateId: templateId,
    scheduledFor: scheduledFor.toISOString(),
    variables: {
      groupName: 'Test Group',
      content: 'This is a scheduled message!'
    }
  });
  
  if (result.success) {
    console.log('✅ Message scheduled successfully!');
    console.log(`Scheduled for: ${scheduledFor.toLocaleString()}`);
  } else {
    console.error('❌ Failed to schedule message:', result.data?.error);
  }
}

async function example6_RecurringMessage() {
  console.log('\n🔄 Example 6: Create Recurring Message');
  console.log('=====================================');
  
  const chatId = await askQuestion('Enter group chat ID: ');
  const templateId = await askQuestion('Enter template ID: ');
  const intervalMinutes = await askQuestion('Repeat every how many minutes? ');
  
  const intervalMs = parseInt(intervalMinutes) * 60 * 1000;
  
  const result = await makeApiRequest('/api/bot/automated-messaging', 'POST', {
    action: 'schedule-recurring',
    id: `recurring_${Date.now()}`,
    chatId: chatId,
    templateId: templateId,
    intervalMs: intervalMs,
    variables: {
      groupName: 'Test Group',
      content: 'This is a recurring message!'
    }
  });
  
  if (result.success) {
    console.log('✅ Recurring message created successfully!');
    console.log(`Repeats every: ${intervalMinutes} minutes`);
  } else {
    console.error('❌ Failed to create recurring message:', result.data?.error);
  }
}

async function example7_ViewScheduledMessages() {
  console.log('\n📅 Example 7: View Scheduled Messages');
  console.log('=====================================');
  
  const result = await makeApiRequest('/api/bot/automated-messaging?action=scheduled');
  
  if (result.success) {
    const scheduled = result.data.data;
    console.log('✅ Scheduled Messages:');
    if (scheduled.length === 0) {
      console.log('   No scheduled messages found');
    } else {
      scheduled.forEach((msg, index) => {
        console.log(`   ${index + 1}. ${msg.id}`);
        console.log(`      Chat ID: ${msg.chatId}`);
        console.log(`      Template: ${msg.templateId}`);
        console.log(`      Scheduled for: ${new Date(msg.scheduledFor).toLocaleString()}`);
        console.log(`      Active: ${msg.isActive ? 'Yes' : 'No'}`);
        if (msg.repeatInterval) {
          console.log(`      Repeats every: ${msg.repeatInterval / 1000 / 60} minutes`);
        }
        console.log('');
      });
    }
  } else {
    console.error('❌ Failed to get scheduled messages:', result.data?.error);
  }
}

async function main() {
  console.log('🤖 Telegram Group Messaging Examples');
  console.log('====================================\n');

  const examples = [
    { name: 'Send Manual Message', func: example1_ManualMessage },
    { name: 'Check Bot Status', func: example2_CheckBotStatus },
    { name: 'Get Available Templates', func: example3_GetTemplates },
    { name: 'Send Template Message', func: example4_SendTemplateMessage },
    { name: 'Schedule a Message', func: example5_ScheduleMessage },
    { name: 'Create Recurring Message', func: example6_RecurringMessage },
    { name: 'View Scheduled Messages', func: example7_ViewScheduledMessages }
  ];

  while (true) {
    console.log('\nAvailable Examples:');
    examples.forEach((example, index) => {
      console.log(`   ${index + 1}. ${example.name}`);
    });
    console.log('   0. Exit');

    const choice = await askQuestion('\nSelect an example (0-7): ');
    const choiceNum = parseInt(choice);

    if (choiceNum === 0) {
      console.log('👋 Goodbye!');
      break;
    } else if (choiceNum >= 1 && choiceNum <= examples.length) {
      try {
        await examples[choiceNum - 1].func();
      } catch (error) {
        console.error('❌ Error running example:', error.message);
      }
    } else {
      console.log('❌ Invalid choice. Please try again.');
    }
  }

  rl.close();
}

main();
