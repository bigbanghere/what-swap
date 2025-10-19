// Test bot commands and message handling
const testCases = [
  {
    name: "Test /start command",
    payload: {
      update_id: 123456789,
      message: {
        message_id: 1,
        from: { id: 123456789, is_bot: false, first_name: "Test", username: "testuser" },
        chat: { id: 123456789, first_name: "Test", username: "testuser", type: "private" },
        date: Math.floor(Date.now() / 1000),
        text: "/start"
      }
    }
  },
  {
    name: "Test /help command",
    payload: {
      update_id: 123456790,
      message: {
        message_id: 2,
        from: { id: 123456789, is_bot: false, first_name: "Test", username: "testuser" },
        chat: { id: 123456789, first_name: "Test", username: "testuser", type: "private" },
        date: Math.floor(Date.now() / 1000),
        text: "/help"
      }
    }
  },
  {
    name: "Test /ping command",
    payload: {
      update_id: 123456791,
      message: {
        message_id: 3,
        from: { id: 123456789, is_bot: false, first_name: "Test", username: "testuser" },
        chat: { id: 123456789, first_name: "Test", username: "testuser", type: "private" },
        date: Math.floor(Date.now() / 1000),
        text: "/ping"
      }
    }
  },
  {
    name: "Test hello message",
    payload: {
      update_id: 123456792,
      message: {
        message_id: 4,
        from: { id: 123456789, is_bot: false, first_name: "Test", username: "testuser" },
        chat: { id: 123456789, first_name: "Test", username: "testuser", type: "private" },
        date: Math.floor(Date.now() / 1000),
        text: "hello"
      }
    }
  },
  {
    name: "Test regular message",
    payload: {
      update_id: 123456793,
      message: {
        message_id: 5,
        from: { id: 123456789, is_bot: false, first_name: "Test", username: "testuser" },
        chat: { id: 123456789, first_name: "Test", username: "testuser", type: "private" },
        date: Math.floor(Date.now() / 1000),
        text: "This is a regular message"
      }
    }
  }
];

async function testBotCommands() {
  console.log('🤖 Testing bot commands and message handling...\n');
  
  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      
      const response = await fetch('https://what-swap.vercel.app/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.payload)
      });
      
      const result = await response.json();
      
      if (response.status === 200) {
        console.log(`✅ ${testCase.name}: SUCCESS (Status: ${response.status})`);
      } else {
        console.log(`❌ ${testCase.name}: FAILED (Status: ${response.status}, Response: ${JSON.stringify(result)})`);
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`❌ ${testCase.name}: ERROR - ${error.message}`);
    }
  }
  
  console.log('\n🎉 Bot testing completed!');
}

testBotCommands();
