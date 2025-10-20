#!/usr/bin/env node

/**
 * Test Supabase Connection
 * Simple script to verify Supabase is working
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'https://uyrpbsxummoqlgnsqjla.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cnBic3h1bW1vcWxnbnNxamxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4ODg1OTUsImV4cCI6MjA3NjQ2NDU5NX0.nQBeilxuMgdNwL77mkveJ0Z5V7a_cEXTNmzgIAmSqrM';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cnBic3h1bW1vcWxnbnNxamxhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg4ODU5NSwiZXhwIjoyMDc2NDY0NTk1fQ.HhJExcOhUWXoUP_r6YzBnAWD7uGlmLT6gdweN35xewY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  try {
    // Test basic connection
    console.log('Testing basic connection...');
    const { data, error } = await supabase
      .from('message_templates')
      .select('count')
      .limit(1);

    if (error && error.code === 'PGRST116') {
      console.log('✅ Connection successful! (Tables not created yet)');
      return true;
    } else if (!error) {
      console.log('✅ Connection successful! (Tables exist)');
      return true;
    } else {
      console.log('❌ Connection failed:', error.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
    return false;
  }
}

async function testTables() {
  console.log('\n📊 Testing tables...\n');

  const tables = ['connected_chats', 'bot_messages', 'scheduled_messages', 'message_templates'];

  for (const table of tables) {
    try {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('count')
        .limit(1);

      if (error) {
        console.log(`❌ Table ${table}: ${error.message}`);
      } else {
        console.log(`✅ Table ${table}: OK`);
      }
    } catch (error) {
      console.log(`❌ Table ${table}: ${error.message}`);
    }
  }
}

async function testInsert() {
  console.log('\n📝 Testing insert...\n');

  try {
    const { data, error } = await supabaseAdmin
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
      await supabaseAdmin
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
  console.log('🧪 Supabase Connection Test');
  console.log('===========================\n');

  const connected = await testConnection();
  
  if (connected) {
    await testTables();
    await testInsert();
    
    console.log('\n🎉 All tests completed!');
    console.log('\nIf you see any errors above, run:');
    console.log('node setup-supabase-client.js');
  } else {
    console.log('\n❌ Connection test failed');
    console.log('Please check your Supabase configuration');
  }
}

main();
