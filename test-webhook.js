// Test the deployed bot webhook
const testUpdate = {
  "update_id": 123456789,
  "message": {
    "message_id": 1,
    "from": {
      "id": 123456789,
      "is_bot": false,
      "first_name": "Test",
      "username": "testuser"
    },
    "chat": {
      "id": 123456789,
      "first_name": "Test",
      "username": "testuser",
      "type": "private"
    },
    "date": 1640995200,
    "text": "/start"
  }
};

async function testDeployedBot() {
  try {
    console.log('Testing deployed bot at https://what-swap.vercel.app/api/bot...');
    
    const response = await fetch('https://what-swap.vercel.app/api/bot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUpdate)
    });
    
    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', result);
    
    if (response.status === 200) {
      console.log('✅ Bot webhook is working!');
    } else {
      console.log('❌ Bot webhook has issues');
    }
  } catch (error) {
    console.error('❌ Error testing bot webhook:', error.message);
  }
}

testDeployedBot();
