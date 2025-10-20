# Telegram Group Messaging System

A comprehensive system for sending messages to Telegram groups, both manually and automatically. This system allows you to add your bot as an admin to a Telegram group and send messages on behalf of the bot.

## 🚀 Quick Start

### 1. Setup Bot Token

```bash
# Copy the example config
cp bot-config.example .env.local

# Edit .env.local and add your bot token
BOT_TOKEN=your_bot_token_here
```

### 2. Start the Development Server

```bash
npm run dev
```

### 3. Setup Your Bot in Telegram Group

1. **Add Bot to Group:**
   - Search for your bot username in Telegram
   - Add the bot to your group

2. **Make Bot Admin:**
   - Go to group settings → Administrators
   - Add your bot as admin
   - Enable "Post Messages" permission
   - Enable "Edit Messages" permission (optional)
   - Enable "Delete Messages" permission (optional)

3. **Get Group Chat ID:**
   - Send a message in the group
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Look for `"chat":{"id":-123456789}` in the response
   - The negative number is your group chat ID

### 4. Test the Setup

```bash
# Run the setup script
node setup-telegram-group.js

# Or send a manual message
node send-group-message.js "Hello from the bot!"
```

## 📋 Available Scripts

### Manual Messaging

- **`send-group-message.js`** - Send messages manually to groups
- **`setup-telegram-group.js`** - Interactive setup and testing
- **`telegram-group-examples.js`** - Comprehensive examples

### Usage Examples

```bash
# Send a message with command line
node send-group-message.js "Your message here"

# Interactive mode
node send-group-message.js

# Run examples
node telegram-group-examples.js

# Setup and test
node setup-telegram-group.js
```

## 🔧 API Endpoints

### Send Message
```http
POST /api/bot/send-message
Content-Type: application/json

{
  "chatId": "-123456789",
  "message": "Hello from the bot!",
  "parseMode": "HTML",
  "replyToMessageId": 123
}
```

### Group Management
```http
GET /api/bot/group-management?action=bot-info
GET /api/bot/group-management?action=group-info&chatId=-123456789
GET /api/bot/group-management?action=bot-status&chatId=-123456789
GET /api/bot/group-management?action=setup-instructions&chatId=-123456789
```

### Automated Messaging
```http
# Get templates
GET /api/bot/automated-messaging?action=templates

# Send template message
POST /api/bot/automated-messaging
{
  "action": "send-message",
  "chatId": "-123456789",
  "templateId": "welcome",
  "variables": { "groupName": "My Group" }
}

# Schedule message
POST /api/bot/automated-messaging
{
  "action": "schedule-message",
  "id": "msg_001",
  "chatId": "-123456789",
  "templateId": "announcement",
  "scheduledFor": "2024-01-01T12:00:00Z",
  "variables": { "title": "Important", "message": "Update" }
}

# Create recurring message
POST /api/bot/automated-messaging
{
  "action": "schedule-recurring",
  "id": "daily_001",
  "chatId": "-123456789",
  "templateId": "daily-update",
  "intervalMs": 86400000,
  "variables": { "content": "Daily report" }
}
```

## 📝 Message Templates

The system comes with pre-built templates:

### Welcome Message
- **ID:** `welcome`
- **Variables:** `groupName`
- **Content:** Welcome message for new members

### Daily Update
- **ID:** `daily-update`
- **Variables:** `date`, `content`
- **Content:** Daily status updates

### Announcement
- **ID:** `announcement`
- **Variables:** `title`, `message`, `date`
- **Content:** Important announcements

### Reminder
- **ID:** `reminder`
- **Variables:** `message`, `time`
- **Content:** Time-based reminders

## 🔄 Automated Messaging Features

### Scheduled Messages
- One-time scheduled messages
- Recurring messages with custom intervals
- Template-based messaging with variables
- Multiple chat support

### Message Management
- View all scheduled messages
- Cancel scheduled messages
- Check message status
- Template management

## 🛠️ Advanced Usage

### Custom Templates

```javascript
// Add custom template via API
POST /api/bot/automated-messaging
{
  "action": "add-template",
  "template": {
    "id": "custom",
    "name": "Custom Template",
    "content": "Hello {{name}}, welcome to {{group}}!",
    "parseMode": "HTML",
    "variables": ["name", "group"]
  }
}
```

### Multiple Group Messaging

```javascript
// Send to multiple groups
POST /api/bot/automated-messaging
{
  "action": "send-to-multiple",
  "chatIds": ["-123456789", "-987654321"],
  "templateId": "announcement",
  "variables": {
    "title": "Important Update",
    "message": "New features available!"
  }
}
```

## 🔐 Security Considerations

1. **Bot Token:** Keep your bot token secure and never expose it in client-side code
2. **Group Access:** Only add the bot to groups you trust
3. **Permissions:** Only grant necessary permissions to the bot
4. **Rate Limiting:** Be mindful of Telegram's rate limits

## 🐛 Troubleshooting

### Common Issues

1. **Bot not sending messages:**
   - Check if bot is admin in the group
   - Verify "Post Messages" permission is enabled
   - Check group chat ID is correct

2. **"Chat not found" error:**
   - Verify the chat ID is correct
   - Ensure bot is added to the group
   - Check if group is public or bot has access

3. **"Bot was blocked by the user" error:**
   - Bot was removed from the group
   - Re-add the bot to the group

### Debug Steps

1. Check bot status: `GET /api/bot/group-management?action=bot-status&chatId=YOUR_CHAT_ID`
2. Verify group info: `GET /api/bot/group-management?action=group-info&chatId=YOUR_CHAT_ID`
3. Test with manual script: `node send-group-message.js "Test message"`

## 📚 Additional Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Grammy Library Documentation](https://grammy.dev/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is part of the What Swap application.
