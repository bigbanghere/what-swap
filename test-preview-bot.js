// Test the preview environment bot
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

async function testPreviewBot() {
  try {
    console.log('Testing preview bot at https://what-swap-agsnk3vb7-somewallets-projects.vercel.app/api/bot...');
    
    const response = await fetch('https://what-swap-agsnk3vb7-somewallets-projects.vercel.app/api/bot', {
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
      console.log('✅ Preview bot webhook is working!');
    } else {
      console.log('❌ Preview bot webhook has issues');
    }
  } catch (error) {
    console.error('❌ Error testing preview bot webhook:', error.message);
  }
}

testPreviewBot();
