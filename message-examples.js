#!/usr/bin/env node

/**
 * Test Script for Channel Message Sending
 * Shows examples of how to use the message sending scripts
 */

console.log('🚀 What Swap Channel Message Sender - Examples');
console.log('==============================================\n');

console.log('📋 Available Scripts:');
console.log('1. send-what-swap-message.js - Simple direct message');
console.log('2. send-channel-message.js - Multi-channel support');
console.log('3. send-template-message.js - Template-based messages\n');

console.log('🔧 Setup:');
console.log('First, set your BOT_TOKEN environment variable:');
console.log('export BOT_TOKEN=your_bot_token_here\n');

console.log('📝 Examples:');
console.log('');

console.log('1. Simple Message with Button:');
console.log('BOT_TOKEN=your_token node send-what-swap-message.js "🎉 Welcome to What Swap!" "Visit Website" "https://what-swap.vercel.app"');
console.log('');

console.log('2. Daily Update Message:');
console.log('BOT_TOKEN=your_token node send-what-swap-message.js "📊 Daily Update - Check out our latest stats!" "View Stats" "https://what-swap.vercel.app/stats"');
console.log('');

console.log('3. Using Templates:');
console.log('BOT_TOKEN=your_token node send-template-message.js welcome \'{"groupName": "What Swap Channel"}\' "Visit Website" "https://what-swap.vercel.app"');
console.log('');

console.log('4. Announcement Template:');
console.log('BOT_TOKEN=your_token node send-template-message.js announcement \'{"title": "New Feature", "message": "Check out our latest update!", "date": "2025-10-20"}\' "Try Now" "https://what-swap.vercel.app"');
console.log('');

console.log('📊 Channel Info:');
console.log('- Channel ID: -1003105272477');
console.log('- Channel Name: What Swap Channel');
console.log('- Username: @what_swap');
console.log('');

console.log('✅ All messages will be stored in your Supabase database!');
