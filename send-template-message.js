#!/usr/bin/env node

/**
 * Send Template Message to What Swap Channel
 * Uses message templates from Supabase database
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://uyrpbsxummoqlgnsqjla.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cnBic3h1bW1vcWxnbnNxamxhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg4ODU5NSwiZXhwIjoyMDc2NDY0NTk1fQ.HhJExcOhUWXoUP_r6YzBnAWD7uGlmLT6gdweN35xewY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Your channel data
const CHANNEL_DATA = {
  chat_id: "-1003105272477",
  title: "What Swap Channel",
  username: "what_swap"
};

// Get bot token from environment or config
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN not found. Please set it in your environment variables');
  console.error('Example: BOT_TOKEN=your_bot_token node send-template-message.js template_id variables');
  process.exit(1);
}

async function getMessageTemplates() {
  console.log('🔍 Fetching message templates from Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('❌ Error fetching templates:', error.message);
      return [];
    }

    console.log(`✅ Found ${data.length} active templates`);
    return data;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return [];
  }
}

function replaceTemplateVariables(template, variables) {
  let content = template.content;
  
  // Replace variables like {{variableName}}
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    content = content.replace(regex, value);
  }
  
  return content;
}

async function sendTemplateMessage(templateId, variables = {}, buttonText = null, buttonUrl = null) {
  console.log(`📤 Sending template message: ${templateId}`);
  
  try {
    // Get template from database
    const { data: templates, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('id', templateId)
      .eq('is_active', true)
      .single();

    if (error || !templates) {
      console.error('❌ Template not found:', templateId);
      return null;
    }

    // Replace variables in template
    const message = replaceTemplateVariables(templates, variables);
    
    console.log(`📝 Template: ${templates.name}`);
    console.log(`📄 Content: ${message}`);

    // Prepare message payload
    const payload = {
      chat_id: CHANNEL_DATA.chat_id,
      text: message,
      parse_mode: templates.parse_mode || 'HTML'
    };

    // Add button if provided
    if (buttonText && buttonUrl) {
      payload.reply_markup = {
        inline_keyboard: [
          [{
            text: buttonText,
            url: buttonUrl
          }]
        ]
      };
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
      console.log('✅ Message sent successfully!');
      console.log(`📊 Message ID: ${result.result.message_id}`);
      
      // Store the message in database
      try {
        await supabase
          .from('bot_messages')
          .insert({
            chat_id: CHANNEL_DATA.chat_id,
            message_id: result.result.message_id,
            template_id: templateId,
            content: message,
            parse_mode: templates.parse_mode || 'HTML',
            variables: variables
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
  console.log('🚀 What Swap Channel Template Message Sender');
  console.log('============================================\n');

  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node send-template-message.js <template_id> [variables] [button_text] [button_url]');
    console.log('\nAvailable templates:');
    
    const templates = await getMessageTemplates();
    templates.forEach(template => {
      console.log(`- ${template.id}: ${template.name}`);
      if (template.variables && template.variables.length > 0) {
        console.log(`  Variables: ${template.variables.join(', ')}`);
      }
    });
    
    console.log('\nExamples:');
    console.log('node send-template-message.js welcome \'{"groupName": "What Swap Channel"}\' "Visit Website" "https://what-swap.vercel.app"');
    console.log('node send-template-message.js announcement \'{"title": "New Feature", "message": "Check out our latest update!", "date": "2025-10-20"}\' "Try Now" "https://what-swap.vercel.app"');
    process.exit(1);
  }

  const [templateId, variablesJson, buttonText, buttonUrl] = args;

  let variables = {};
  if (variablesJson) {
    try {
      variables = JSON.parse(variablesJson);
    } catch (error) {
      console.error('❌ Invalid JSON for variables:', error.message);
      process.exit(1);
    }
  }

  console.log(`📋 Channel: ${CHANNEL_DATA.title} (@${CHANNEL_DATA.username})`);
  console.log(`📝 Template: ${templateId}`);
  console.log(`🔧 Variables:`, variables);
  if (buttonText && buttonUrl) {
    console.log(`🔘 Button: ${buttonText} → ${buttonUrl}`);
  }
  console.log('');

  const result = await sendTemplateMessage(templateId, variables, buttonText, buttonUrl);
  
  if (result) {
    console.log('\n🎉 Message sent successfully!');
    console.log(`📊 Message ID: ${result.message_id}`);
    console.log(`🔗 Channel: @${CHANNEL_DATA.username}`);
  } else {
    console.log('\n❌ Failed to send message');
  }
}

main();
