// Test bot locally with environment variable
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

async function testLocalBot() {
  try {
    console.log('Testing local bot at http://localhost:3000/api/bot...');
    
    const response = await fetch('http://localhost:3000/api/bot', {
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
      console.log('✅ Local bot webhook is working!');
    } else {
      console.log('❌ Local bot webhook has issues');
    }
  } catch (error) {
    console.error('❌ Error testing local bot webhook:', error.message);
    console.log('Make sure to run: npm run dev');
  }
}

testLocalBot();
