# Supabase Integration Setup Guide

This guide will help you set up Supabase database integration for your Telegram bot to store connected chats data.

## 🚀 Quick Setup

### 1. Run Database Schema

1. **Open Supabase Dashboard:**
   - Go to your Supabase project dashboard
   - Click on "SQL Editor" in the left sidebar

2. **Run the Schema:**
   - Copy the contents of `supabase-schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the schema

### 2. Environment Variables

Make sure your `.env.local` file has all the Supabase environment variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Bot Configuration
BOT_TOKEN=your_bot_token
```

### 3. Test the Integration

```bash
# Start your development server
pnpm dev

# In another terminal, test the database connection
node view-connected-chats.js
```

## 📊 Database Schema

The integration creates 4 main tables:

### `connected_chats`
Stores information about all chats that interact with your bot:
- `chat_id` - Unique chat identifier
- `chat_type` - Type of chat (private, group, supergroup, channel)
- `title` - Chat title/name
- `username` - Chat username (if available)
- `bot_status` - Bot's status in the chat
- `can_post_messages` - Whether bot can post messages
- `is_active` - Whether chat is currently active
- `message_count` - Number of messages sent to this chat
- `first_seen` - When bot first interacted with this chat
- `last_activity` - Last activity timestamp

### `bot_messages`
Stores all messages sent by the bot:
- `chat_id` - Reference to connected chat
- `message_id` - Telegram message ID
- `template_id` - Template used (if any)
- `content` - Message content
- `parse_mode` - Message format (HTML, Markdown, etc.)
- `variables` - Template variables used
- `sent_at` - When message was sent

### `scheduled_messages`
Stores scheduled and recurring messages:
- `chat_id` - Target chat
- `template_id` - Template to use
- `scheduled_for` - When to send the message
- `repeat_interval_ms` - Recurring interval (if any)
- `is_active` - Whether schedule is active

### `message_templates`
Stores reusable message templates:
- `id` - Template identifier
- `name` - Human-readable name
- `content` - Template content with variables
- `variables` - Available variables for the template

## 🔧 API Endpoints

### Connected Chats Management
```http
# Get all connected chats
GET /api/bot/connected-chats?action=all

# Get active chats only
GET /api/bot/connected-chats?action=active

# Get specific chat details
GET /api/bot/connected-chats?action=single&chatId=CHAT_ID

# Get chat messages
GET /api/bot/connected-chats?action=messages&chatId=CHAT_ID&limit=50

# Get statistics
GET /api/bot/connected-chats?action=statistics
```

### Send Messages (with database storage)
```http
POST /api/bot/send-message
{
  "chatId": "-123456789",
  "message": "Hello from the bot!",
  "templateId": "welcome",
  "variables": { "groupName": "My Group" }
}
```

## 📝 Available Scripts

### `view-connected-chats.js`
Interactive script to view and manage connected chats:
```bash
node view-connected-chats.js
```

Options:
1. View All Chats - Shows all chats in database
2. View Active Chats - Shows only active chats
3. View Chat Details - Detailed view of specific chat
4. View Statistics - Database statistics

### `send-group-message.js`
Send messages manually (now stores in database):
```bash
node send-group-message.js "Your message here"
```

### `setup-telegram-group.js`
Setup and test bot in groups (stores chat data):
```bash
node setup-telegram-group.js
```

## 🔄 How It Works

### Automatic Data Storage

1. **Webhook Updates:** When your bot receives any update via webhook, it automatically:
   - Stores chat information in `connected_chats`
   - Updates chat activity timestamps
   - Tracks message counts

2. **Message Sending:** When you send messages via API:
   - Message is sent to Telegram
   - Message details are stored in `bot_messages`
   - Chat activity is updated

3. **Bot Commands:** When users interact with bot commands:
   - Chat data is stored/updated
   - Bot responses are logged

### Data Flow

```
Telegram Update → Webhook → Bot Handler → Database Storage
                     ↓
User Message → Bot Response → Database Log
                     ↓
Manual Send → API → Telegram → Database Log
```

## 🛠️ Advanced Usage

### Custom Templates

Add custom templates via API:
```javascript
POST /api/bot/automated-messaging
{
  "action": "add-template",
  "template": {
    "id": "custom-welcome",
    "name": "Custom Welcome",
    "content": "Welcome {{name}} to {{group}}!",
    "parseMode": "HTML",
    "variables": ["name", "group"]
  }
}
```

### Scheduled Messages

Create recurring messages:
```javascript
POST /api/bot/automated-messaging
{
  "action": "schedule-recurring",
  "id": "daily_announcement",
  "chatId": "-123456789",
  "templateId": "daily-update",
  "intervalMs": 86400000, // 24 hours
  "variables": { "content": "Daily report" }
}
```

### Analytics

Get chat statistics:
```javascript
GET /api/bot/connected-chats?action=statistics
```

Returns:
- Total chats
- Active chats
- Total messages sent
- Chats by type (group, private, etc.)

## 🔐 Security

- **Row Level Security (RLS)** is enabled on all tables
- **Service role key** is used for server-side operations
- **Anonymous key** is used for client-side operations
- All sensitive operations require proper authentication

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error:**
   - Check environment variables
   - Verify Supabase project is active
   - Check network connectivity

2. **Permission Errors:**
   - Ensure service role key has correct permissions
   - Check RLS policies are set up correctly

3. **Schema Errors:**
   - Re-run the schema SQL
   - Check for table conflicts
   - Verify all indexes are created

### Debug Steps

1. **Check Database Connection:**
   ```bash
   node view-connected-chats.js
   # Select option 4 (View Statistics)
   ```

2. **Test Message Storage:**
   ```bash
   node send-group-message.js "Test message"
   # Check if message appears in database
   ```

3. **Verify Webhook Storage:**
   - Send a message to your bot
   - Check if chat appears in database
   - Verify message count increases

## 📈 Monitoring

### Key Metrics to Track

- **Active Chats:** Number of chats actively using the bot
- **Message Volume:** Total messages sent per day/week
- **Chat Types:** Distribution of private vs group chats
- **Template Usage:** Which templates are most popular
- **Error Rates:** Failed message sends

### Database Queries

```sql
-- Most active chats
SELECT title, message_count, last_activity 
FROM connected_chats 
WHERE is_active = true 
ORDER BY message_count DESC 
LIMIT 10;

-- Daily message volume
SELECT DATE(sent_at) as date, COUNT(*) as messages
FROM bot_messages 
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(sent_at)
ORDER BY date DESC;

-- Template usage
SELECT template_id, COUNT(*) as usage_count
FROM bot_messages 
WHERE template_id IS NOT NULL
GROUP BY template_id
ORDER BY usage_count DESC;
```

## 🎯 Next Steps

1. **Set up monitoring** for your bot's performance
2. **Create custom templates** for your specific use cases
3. **Implement automated messaging** based on your needs
4. **Set up alerts** for failed message sends
5. **Analyze usage patterns** to optimize bot behavior

Your Telegram bot is now fully integrated with Supabase! All chat interactions will be automatically stored and tracked.
