#!/usr/bin/env node

/**
 * Simple Supabase Database Setup via REST API
 * Alternative approach using Supabase REST API
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Supabase environment variables not set');
  console.log('Please set in .env.local:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

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

async function setupDatabase() {
  console.log('🏗️  Setting up Supabase database...\n');

  // Read the schema file
  const fs = require('fs');
  const schema = fs.readFileSync('supabase-schema.sql', 'utf8');
  
  // Split into individual statements
  const statements = schema
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`Executing statement ${i + 1}/${statements.length}...`);
    
    const result = await executeSQL(statement + ';');
    if (result) {
      console.log(`✅ Statement ${i + 1} executed successfully`);
    } else {
      console.log(`❌ Failed to execute statement ${i + 1}`);
    }
  }

  console.log('\n🎉 Database setup completed!');
}

setupDatabase().catch(console.error);
