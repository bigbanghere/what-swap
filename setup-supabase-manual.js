#!/usr/bin/env node

/**
 * Supabase Database Setup via REST API
 * Creates tables using direct SQL execution
 */

const SUPABASE_URL = 'https://uyrpbsxummoqlgnsqjla.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cnBic3h1bW1vcWxnbnNxamxhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg4ODU5NSwiZXhwIjoyMDc2NDY0NTk1fQ.HhJExcOhUWXoUP_r6YzBnAWD7uGlmLT6gdweN35xewY';

async function executeSQL(sql) {
  try {
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

    return await response.json();
  } catch (error) {
    console.error('SQL execution error:', error.message);
    return null;
  }
}

async function createTablesViaSQL() {
  console.log('🏗️  Creating tables via SQL Editor approach...\n');
  
  console.log('📋 Please follow these steps:');
  console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Click "SQL Editor" in the left sidebar');
  console.log('4. Click "New Query"');
  console.log('5. Copy and paste the following SQL:');
  console.log('\n' + '='.repeat(60));
  
  // Read and display the schema
  const fs = require('fs');
  const schema = fs.readFileSync('supabase-schema.sql', 'utf8');
  console.log(schema);
  console.log('='.repeat(60));
  
  console.log('\n6. Click "Run" to execute the SQL');
  console.log('7. Come back here and run: node test-supabase-connection.js');
}

async function testBasicConnection() {
  console.log('🔍 Testing basic Supabase connection...\n');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      }
    });

    if (response.ok) {
      console.log('✅ Supabase connection successful!');
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
  console.log('🚀 Supabase Database Setup');
  console.log('==========================\n');

  const connected = await testBasicConnection();
  
  if (connected) {
    await createTablesViaSQL();
  } else {
    console.log('❌ Cannot connect to Supabase');
    console.log('Please check your Supabase URL and service key');
  }
}

main();
