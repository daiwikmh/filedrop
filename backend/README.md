# Predict Backend - Telegram Integration

Backend server for Predict app with Telegram bot integration.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create Telegram Bot:**
   - Open Telegram and search for `@BotFather`
   - Send `/newbot` command
   - Follow instructions to create your bot
   - Copy the bot token

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your `TELEGRAM_BOT_TOKEN`

4. **Start the server:**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

## API Endpoints

### Generate Auth Token
```
GET /api/telegram/generate-token
```
Returns a token for users to authenticate with the Telegram bot.

### Send Message to User
```
POST /api/telegram/send-message
Body: { telegramId: number, message: string }
```

### Broadcast to All Users
```
POST /api/telegram/broadcast
Body: { message: string }
```

### Get Authorized Users
```
GET /api/telegram/authorized-users
```

### Check User Authorization
```
GET /api/telegram/check-auth/:telegramId
```

## Telegram Bot Commands

- `/start` - Welcome message
- `/auth TOKEN` - Authenticate with token from app
- `/status` - Check authorization status

## Usage Flow

1. User clicks "Connect Telegram" in the app
2. App calls `/api/telegram/generate-token` to get auth token
3. User is shown instructions to message the bot with `/auth TOKEN`
4. User sends `/auth TOKEN` in Telegram
5. Bot confirms: "Hello! You are now authorized to receive notifications from Predict."
6. App can now send notifications via `/api/telegram/send-message`
