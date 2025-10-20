#!/usr/bin/env node

/**
 * Supabase Table Creation using JavaScript Client
 * Creates tables using Supabase client methods
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://uyrpbsxummoqlgnsqjla.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cnBic3h1bW1vcWxnbnNxamxhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg4ODU5NSwiZXhwIjoyMDc2NDY0NTk1fQ.HhJExcOhUWXoUP_r6YzBnAWD7uGlmLT6gdweN35xewY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTablesViaClient() {
  console.log('🏗️  Creating tables using Supabase client...\n');

  // First, let's try to create a simple test table to see if we can create tables
  console.log('Creating test table...');
  
  try {
    // Try to create a simple table first
    const { data, error } = await supabase
      .from('test_table')
      .select('*')
      .limit(1);

    if (error && error.code === 'PGRST116') {
      console.log('✅ Test table does not exist (expected)');
      console.log('📋 Tables need to be created via SQL Editor\n');
      
      console.log('Please follow these steps:');
      console.log('1. Go to: https://supabase.com/dashboard');
      console.log('2. Select your project');
      console.log('3. Click "SQL Editor" in the left sidebar');
      console.log('4. Click "New Query"');
      console.log('5. Copy and paste the SQL from supabase-schema.sql');
      console.log('6. Click "Run"');
      console.log('\nAlternatively, you can copy this SQL:');
      console.log('='.repeat(60));
      
      // Read and display the schema
      const fs = require('fs');
      const schema = fs.readFileSync('supabase-schema.sql', 'utf8');
      console.log(schema);
      console.log('='.repeat(60));
      
      return false;
    } else if (!error) {
      console.log('✅ Test table exists');
      return true;
    } else {
      console.log('❌ Error:', error.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function testExistingTables() {
  console.log('🔍 Testing existing tables...\n');

  const tables = ['connected_chats', 'bot_messages', 'scheduled_messages', 'message_templates'];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);

      if (error && error.code === 'PGRST116') {
        console.log(`❌ Table ${table}: Does not exist`);
      } else if (!error) {
        console.log(`✅ Table ${table}: Exists`);
      } else {
        console.log(`❌ Table ${table}: Error - ${error.message}`);
      }
    } catch (error) {
      console.log(`❌ Table ${table}: Error - ${error.message}`);
    }
  }
}

async function insertTestData() {
  console.log('\n📝 Testing data insertion...\n');

  try {
    // Try to insert a test template
    const { data, error } = await supabase
      .from('message_templates')
      .insert({
        id: 'test-template',
        name: 'Test Template',
        content: 'This is a test template',
        parse_mode: 'HTML',
        variables: ['test']
      })
      .select();

    if (error) {
      console.log('❌ Insert test failed:', error.message);
    } else {
      console.log('✅ Insert test successful!');
      
      // Clean up test data
      await supabase
        .from('message_templates')
        .delete()
        .eq('id', 'test-template');
      
      console.log('✅ Test data cleaned up');
    }
  } catch (error) {
    console.log('❌ Insert test error:', error.message);
  }
}

async function main() {
  console.log('🚀 Supabase Table Creation Check');
  console.log('=================================\n');

  const canCreateTables = await createTablesViaClient();
  
  if (!canCreateTables) {
    console.log('\n📋 Manual setup required');
    console.log('After running the SQL in Supabase dashboard, run:');
    console.log('node test-supabase-connection.js');
  } else {
    await testExistingTables();
    await insertTestData();
    
    console.log('\n🎉 Database is ready!');
    console.log('\nNext steps:');
    console.log('1. Start your bot: pnpm dev');
    console.log('2. Add your bot to a Telegram group');
    console.log('3. Send a message and check if it appears in the database!');
  }
}

main();
