#!/usr/bin/env node

/**
 * Supabase Table Creation Script
 * Creates tables using Supabase Management API
 */

const SUPABASE_URL = 'https://uyrpbsxummoqlgnsqjla.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cnBic3h1bW1vcWxnbnNxamxhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg4ODU5NSwiZXhwIjoyMDc2NDY0NTk1fQ.HhJExcOhUWXoUP_r6YzBnAWD7uGlmLT6gdweN35xewY';

async function executeSQL(sql) {
  try {
    console.log('Executing SQL...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log('✅ SQL executed successfully');
    return result;
  } catch (error) {
    console.error('❌ SQL execution error:', error.message);
    return null;
  }
}

async function createTables() {
  console.log('🏗️  Creating Telegram Bot Tables...\n');

  const sqlStatements = [
    // Create connected_chats table
    `CREATE TABLE IF NOT EXISTS connected_chats (
      id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      chat_id TEXT NOT NULL UNIQUE,
      chat_type TEXT NOT NULL CHECK (chat_type IN ('private', 'group', 'supergroup', 'channel')),
      title TEXT,
      username TEXT,
      description TEXT,
      invite_link TEXT,
      bot_status TEXT CHECK (bot_status IN ('member', 'administrator', 'creator', 'left', 'kicked')),
      can_post_messages BOOLEAN DEFAULT FALSE,
      can_edit_messages BOOLEAN DEFAULT FALSE,
      can_delete_messages BOOLEAN DEFAULT FALSE,
      can_manage_chat BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      first_seen TIMESTAMPTZ DEFAULT NOW(),
      last_activity TIMESTAMPTZ DEFAULT NOW(),
      message_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Create bot_messages table
    `CREATE TABLE IF NOT EXISTS bot_messages (
      id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      chat_id TEXT NOT NULL,
      message_id INTEGER NOT NULL,
      template_id TEXT,
      content TEXT NOT NULL,
      parse_mode TEXT DEFAULT 'HTML' CHECK (parse_mode IN ('HTML', 'Markdown', 'MarkdownV2')),
      variables JSONB,
      sent_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Create scheduled_messages table
    `CREATE TABLE IF NOT EXISTS scheduled_messages (
      id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      chat_id TEXT NOT NULL,
      template_id TEXT NOT NULL,
      variables JSONB,
      scheduled_for TIMESTAMPTZ NOT NULL,
      repeat_interval_ms BIGINT,
      is_active BOOLEAN DEFAULT TRUE,
      last_sent TIMESTAMPTZ,
      next_run TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Create message_templates table
    `CREATE TABLE IF NOT EXISTS message_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      parse_mode TEXT DEFAULT 'HTML' CHECK (parse_mode IN ('HTML', 'Markdown', 'MarkdownV2')),
      variables TEXT[],
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`
  ];

  for (let i = 0; i < sqlStatements.length; i++) {
    console.log(`Creating table ${i + 1}/4...`);
    const result = await executeSQL(sqlStatements[i]);
    if (result) {
      console.log(`✅ Table ${i + 1} created successfully\n`);
    } else {
      console.log(`❌ Failed to create table ${i + 1}\n`);
    }
  }
}

async function createIndexes() {
  console.log('📊 Creating indexes...\n');

  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_connected_chats_chat_id ON connected_chats(chat_id);',
    'CREATE INDEX IF NOT EXISTS idx_connected_chats_chat_type ON connected_chats(chat_type);',
    'CREATE INDEX IF NOT EXISTS idx_connected_chats_is_active ON connected_chats(is_active);',
    'CREATE INDEX IF NOT EXISTS idx_bot_messages_chat_id ON bot_messages(chat_id);',
    'CREATE INDEX IF NOT EXISTS idx_bot_messages_sent_at ON bot_messages(sent_at);',
    'CREATE INDEX IF NOT EXISTS idx_scheduled_messages_chat_id ON scheduled_messages(chat_id);',
    'CREATE INDEX IF NOT EXISTS idx_scheduled_messages_is_active ON scheduled_messages(is_active);',
    'CREATE INDEX IF NOT EXISTS idx_scheduled_messages_next_run ON scheduled_messages(next_run);',
    'CREATE INDEX IF NOT EXISTS idx_message_templates_is_active ON message_templates(is_active);'
  ];

  for (let i = 0; i < indexes.length; i++) {
    console.log(`Creating index ${i + 1}/${indexes.length}...`);
    const result = await executeSQL(indexes[i]);
    if (result) {
      console.log(`✅ Index ${i + 1} created successfully`);
    } else {
      console.log(`❌ Failed to create index ${i + 1}`);
    }
  }
}

async function createTriggers() {
  console.log('\n⚡ Creating triggers...\n');

  const triggers = [
    // Create updated_at trigger function
    `CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';`,

    // Create triggers for updated_at
    'CREATE TRIGGER update_connected_chats_updated_at BEFORE UPDATE ON connected_chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
    'CREATE TRIGGER update_scheduled_messages_updated_at BEFORE UPDATE ON scheduled_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
    'CREATE TRIGGER update_message_templates_updated_at BEFORE UPDATE ON message_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();'
  ];

  for (let i = 0; i < triggers.length; i++) {
    console.log(`Creating trigger ${i + 1}/${triggers.length}...`);
    const result = await executeSQL(triggers[i]);
    if (result) {
      console.log(`✅ Trigger ${i + 1} created successfully`);
    } else {
      console.log(`❌ Failed to create trigger ${i + 1}`);
    }
  }
}

async function insertDefaultTemplates() {
  console.log('\n📝 Inserting default templates...\n');

  const templates = [
    {
      id: 'welcome',
      name: 'Welcome Message',
      content: '🎉 Welcome to {{groupName}}!\n\nWe\'re excited to have you here. Feel free to ask any questions!',
      parse_mode: 'HTML',
      variables: ['groupName']
    },
    {
      id: 'daily-update',
      name: 'Daily Update',
      content: '📊 Daily Update - {{date}}\n\n{{content}}',
      parse_mode: 'HTML',
      variables: ['date', 'content']
    },
    {
      id: 'announcement',
      name: 'Announcement',
      content: '📢 **{{title}}**\n\n{{message}}\n\n_Posted on {{date}}_',
      parse_mode: 'Markdown',
      variables: ['title', 'message', 'date']
    },
    {
      id: 'reminder',
      name: 'Reminder',
      content: '⏰ Reminder: {{message}}\n\nTime: {{time}}',
      parse_mode: 'HTML',
      variables: ['message', 'time']
    }
  ];

  for (const template of templates) {
    console.log(`Inserting template: ${template.name}...`);
    
    const sql = `INSERT INTO message_templates (id, name, content, parse_mode, variables) VALUES ('${template.id}', '${template.name}', '${template.content}', '${template.parse_mode}', ARRAY[${template.variables.map(v => `'${v}'`).join(',')}]) ON CONFLICT (id) DO NOTHING;`;
    
    const result = await executeSQL(sql);
    if (result) {
      console.log(`✅ Template ${template.name} inserted successfully`);
    } else {
      console.log(`❌ Failed to insert template ${template.name}`);
    }
  }
}

async function setupRLS() {
  console.log('\n🔐 Setting up Row Level Security...\n');

  const rlsStatements = [
    'ALTER TABLE connected_chats ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE bot_messages ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;',
    'CREATE POLICY "Service role can do everything on connected_chats" ON connected_chats FOR ALL USING (true);',
    'CREATE POLICY "Service role can do everything on bot_messages" ON bot_messages FOR ALL USING (true);',
    'CREATE POLICY "Service role can do everything on scheduled_messages" ON scheduled_messages FOR ALL USING (true);',
    'CREATE POLICY "Service role can do everything on message_templates" ON message_templates FOR ALL USING (true);',
    'CREATE POLICY "Anonymous can read message_templates" ON message_templates FOR SELECT USING (is_active = true);'
  ];

  for (let i = 0; i < rlsStatements.length; i++) {
    console.log(`Setting up RLS ${i + 1}/${rlsStatements.length}...`);
    const result = await executeSQL(rlsStatements[i]);
    if (result) {
      console.log(`✅ RLS ${i + 1} set up successfully`);
    } else {
      console.log(`❌ Failed to set up RLS ${i + 1}`);
    }
  }
}

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      }
    });

    if (response.ok) {
      console.log('✅ Supabase connection successful!\n');
      return true;
    } else {
      console.log('❌ Supabase connection failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Supabase connection error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Supabase Table Creation Script');
  console.log('===================================\n');

  const connected = await testConnection();
  
  if (!connected) {
    console.log('❌ Cannot proceed without database connection');
    process.exit(1);
  }

  try {
    await createTables();
    await createIndexes();
    await createTriggers();
    await insertDefaultTemplates();
    await setupRLS();

    console.log('\n🎉 All tables created successfully!');
    console.log('\nNext steps:');
    console.log('1. Test the connection: node test-supabase-connection.js');
    console.log('2. Start your bot: pnpm dev');
    console.log('3. Add your bot to a Telegram group');
    console.log('4. Send a message and check if it appears in the database!');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
  }
}

main();
