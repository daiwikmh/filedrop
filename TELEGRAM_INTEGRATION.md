# Telegram Integration - Complete Flow Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
4. [Authentication Flows](#authentication-flows)
5. [Function Reference](#function-reference)
6. [API Endpoints](#api-endpoints)
7. [Usage Examples](#usage-examples)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This Telegram integration allows your Predict app to:
- ✅ Connect users via one-click Telegram login
- ✅ Send real-time notifications to users
- ✅ Broadcast messages to all connected users
- ✅ Manage authorized users

**Bot Username:** `@predict123_bot`

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  React Client   │────────▶│  Express API    │────────▶│  Telegram Bot   │
│  (Port 5173)    │  HTTP   │  (Port 3002)    │  API    │  (@predict123)  │
│                 │◀────────│                 │◀────────│                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### Components:

1. **Frontend (React)**
   - `TelegramConnect` page - UI for connection
   - `TelegramLoginButton` - Telegram widget component
   - `telegramApi.ts` - API client functions

2. **Backend (Express)**
   - `telegramService.ts` - Core bot logic
   - `telegramRoutes.ts` - API endpoints
   - `index.ts` - Server entry point

3. **Telegram Bot**
   - Bot commands: `/start`, `/auth`, `/status`
   - Polling for incoming messages
   - Sending notifications

---

## 🚀 Setup Instructions

### 1. Prerequisites
- Node.js installed
- Telegram account
- Bot token from @BotFather

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Edit .env and add:
TELEGRAM_BOT_TOKEN=your_bot_token_here
PORT=3002

# Start backend server
npm run dev
```

**Expected output:**
```
✅ Telegram bot initialized successfully
🚀 Server is running on port 3002
📱 Telegram bot service initialized
```

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

**Access UI:** `http://localhost:5173/connect-telegram`

---

## 🔐 Authentication Flows

### Method 1: Quick Connect (One-Click) ⚡

**Flow:**
```
1. User clicks Telegram button on website
   ↓
2. Telegram Login Widget opens
   ↓
3. User authorizes in Telegram app
   ↓
4. Widget returns user data to frontend
   ↓
5. Frontend sends data to /api/telegram/auto-auth
   ↓
6. Backend authorizes user automatically
   ↓
7. Welcome message sent to user's Telegram
   ✓ Connected!
```

**Function Flow:**

```typescript
// Client Component: TelegramConnect.tsx
<TelegramLoginButton
  botName="predict123_bot"
  onAuth={handleTelegramAuth}  // ← Callback when user clicks
/>

↓

handleTelegramAuth(user) {
  // Sends user data to backend
  fetch('/api/telegram/auto-auth', {
    body: JSON.stringify(user)
  })
}

↓

// Backend Route: telegramRoutes.ts
router.post('/auto-auth', (req, res) => {
  telegramService.autoAuthorizeUser(userData)
})

↓

// Backend Service: telegramService.ts
autoAuthorizeUser(userData) {
  // 1. Generate auth token
  const token = generateAuthToken()

  // 2. Create user object
  const user = {
    telegramId: userData.telegramId,
    username: userData.username,
    firstName: userData.firstName,
    authToken: token,
    authorized: true
  }

  // 3. Store in memory
  authorizedUsers.set(telegramId, user)
}

↓

// Frontend sends welcome message
telegramApi.sendMessage(userId, "Welcome message")

↓

// Backend sends via Telegram API
bot.sendMessage(telegramId, message)
```

---

### Method 2: Manual Token (Alternative) 🔑

**Flow:**
```
1. User clicks "Generate Token"
   ↓
2. Frontend calls /api/telegram/generate-token
   ↓
3. Backend generates random token
   ↓
4. User copies token
   ↓
5. User opens Telegram @predict123_bot
   ↓
6. User sends: /auth abc123xyz
   ↓
7. Bot receives message and validates token
   ↓
8. Bot stores user as authorized
   ↓
9. Bot sends confirmation message
   ✓ Connected!
```

**Function Flow:**

```typescript
// Client: TelegramConnect.tsx
handleGenerateToken() {
  const data = await telegramApi.generateToken()
  setAuthToken(data.token)
}

↓

// Client API: telegramApi.ts
generateToken() {
  return fetch('/api/telegram/generate-token')
}

↓

// Backend Route: telegramRoutes.ts
router.get('/generate-token', (req, res) => {
  const token = telegramService.generateAuthToken()
  res.json({ token })
})

↓

// User manually sends in Telegram: /auth <token>

↓

// Backend Service: telegramService.ts (Bot listener)
bot.onText(/\/auth (.+)/, (msg, match) => {
  const token = match[1]
  const user = {
    telegramId: msg.from.id,
    username: msg.from.username,
    firstName: msg.from.first_name,
    authToken: token,
    authorized: true
  }

  authorizedUsers.set(user.telegramId, user)

  bot.sendMessage(chatId, '🎉 Authorized!')
})
```

---

## 📚 Function Reference

### Frontend Functions

#### `telegramApi.generateToken()`
**Location:** `client/src/lib/telegramApi.ts:10`

Generates authentication token for manual connection.

```typescript
const { token } = await telegramApi.generateToken();
// Returns: { token: "abc123xyz", message: "..." }
```

---

#### `telegramApi.sendMessage(telegramId, message)`
**Location:** `client/src/lib/telegramApi.ts:17`

Sends message to specific Telegram user.

```typescript
await telegramApi.sendMessage(123456789, "Hello User!");
// Returns: { success: true, message: "Message sent successfully" }
```

**Parameters:**
- `telegramId` (number) - User's Telegram ID
- `message` (string) - Message to send

---

#### `telegramApi.broadcast(message)`
**Location:** `client/src/lib/telegramApi.ts:27`

Broadcasts message to all authorized users.

```typescript
await telegramApi.broadcast("New pool created!");
// Returns: { success: true, message: "Broadcast sent..." }
```

---

#### `telegramApi.getAuthorizedUsers()`
**Location:** `client/src/lib/telegramApi.ts:37`

Retrieves list of all authorized users.

```typescript
const { users } = await telegramApi.getAuthorizedUsers();
// Returns: { users: [{ telegramId, username, firstName, ... }] }
```

---

#### `telegramApi.checkAuth(telegramId)`
**Location:** `client/src/lib/telegramApi.ts:44`

Checks if specific user is authorized.

```typescript
const { isAuthorized } = await telegramApi.checkAuth(123456789);
// Returns: { isAuthorized: true/false }
```

---

### Backend Functions

#### `telegramService.init()`
**Location:** `backend/src/services/telegramService.ts:20`

Initializes Telegram bot with environment token.

```typescript
telegramService.init();
// Initializes bot, sets up command handlers
// Called automatically in index.ts
```

---

#### `telegramService.sendMessage(telegramId, message)`
**Location:** `backend/src/services/telegramService.ts:78`

Sends message to Telegram user via bot API.

```typescript
const success = await telegramService.sendMessage(
  123456789,
  "Your notification"
);
// Returns: boolean (true if sent successfully)
```

**Flow:**
```
1. Check if bot initialized
2. Call bot.sendMessage(telegramId, message)
3. Return success/failure
```

---

#### `telegramService.broadcastMessage(message)`
**Location:** `backend/src/services/telegramService.ts:94`

Sends message to all authorized users.

```typescript
await telegramService.broadcastMessage("System announcement");
```

**Flow:**
```
1. Get all authorized user IDs
2. Map through each telegramId
3. Call sendMessage() for each user
4. Return when all complete
```

---

#### `telegramService.generateAuthToken()`
**Location:** `backend/src/services/telegramService.ts:102`

Generates random token for manual auth.

```typescript
const token = telegramService.generateAuthToken();
// Returns: "abc123xyz456" (random string)
```

**Implementation:**
```typescript
Math.random().toString(36).substring(2, 15) +
Math.random().toString(36).substring(2, 15)
```

---

#### `telegramService.autoAuthorizeUser(userData)`
**Location:** `backend/src/services/telegramService.ts:133`

Automatically authorizes user from login widget.

```typescript
const success = telegramService.autoAuthorizeUser({
  telegramId: 123456789,
  firstName: "John",
  username: "john_doe"
});
// Returns: boolean
```

**Flow:**
```
1. Generate auth token
2. Create user object with all data
3. Store in authorizedUsers Map
4. Log authorization
5. Return success
```

---

#### `telegramService.isUserAuthorized(telegramId)`
**Location:** `backend/src/services/telegramService.ts:107`

Checks if user exists in authorized list.

```typescript
const isAuth = telegramService.isUserAuthorized(123456789);
// Returns: boolean
```

---

#### `telegramService.getAuthorizedUsers()`
**Location:** `backend/src/services/telegramService.ts:128`

Returns array of all authorized users.

```typescript
const users = telegramService.getAuthorizedUsers();
// Returns: TelegramUser[]
```

---

#### `telegramService.setupBotHandlers()` (Private)
**Location:** `backend/src/services/telegramService.ts:25`

Sets up bot command handlers. Called during init().

**Commands handled:**
- `/start` - Welcome message
- `/auth <token>` - Manual authorization
- `/status` - Check connection status

```typescript
// /start handler
bot.onText(/\/start/, (msg) => {
  sendMessage(chatId, "Welcome to Predict!")
})

// /auth handler
bot.onText(/\/auth (.+)/, (msg, match) => {
  const token = match[1]
  // Authorize user with token
})

// /status handler
bot.onText(/\/status/, (msg) => {
  const isAuth = isUserAuthorized(userId)
  sendMessage(chatId, isAuth ? "✅ Connected" : "❌ Not connected")
})
```

---

## 🔌 API Endpoints

### `GET /api/telegram/generate-token`
**File:** `backend/src/routes/telegramRoutes.ts:8`

Generates authentication token.

**Response:**
```json
{
  "token": "abc123xyz456",
  "message": "Use this token with /auth command in Telegram bot"
}
```

---

### `POST /api/telegram/send-message`
**File:** `backend/src/routes/telegramRoutes.ts:14`

Sends message to specific user.

**Request:**
```json
{
  "telegramId": 123456789,
  "message": "Your notification"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

---

### `POST /api/telegram/broadcast`
**File:** `backend/src/routes/telegramRoutes.ts:30`

Broadcasts to all users.

**Request:**
```json
{
  "message": "Announcement for all users"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Broadcast sent to all authorized users"
}
```

---

### `GET /api/telegram/authorized-users`
**File:** `backend/src/routes/telegramRoutes.ts:41`

Lists all authorized users.

**Response:**
```json
{
  "users": [
    {
      "telegramId": 123456789,
      "username": "john_doe",
      "firstName": "John",
      "authToken": "abc123",
      "authorized": true
    }
  ]
}
```

---

### `GET /api/telegram/check-auth/:telegramId`
**File:** `backend/src/routes/telegramRoutes.ts:48`

Checks user authorization status.

**Response:**
```json
{
  "isAuthorized": true
}
```

---

### `POST /api/telegram/auto-auth`
**File:** `backend/src/routes/telegramRoutes.ts:55`

Auto-authorizes user from login widget.

**Request:**
```json
{
  "id": 123456789,
  "first_name": "John",
  "last_name": "Doe",
  "username": "john_doe",
  "photo_url": "https://...",
  "auth_date": 1234567890,
  "hash": "..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "User authorized successfully",
  "telegramId": 123456789
}
```

---

## 💡 Usage Examples

### Example 1: Send Notification When Pool Created

```typescript
// In your pool creation logic
import { telegramApi } from '@/lib/telegramApi';

async function createPool(poolData) {
  // ... pool creation logic ...

  // Send notification to all users
  await telegramApi.broadcast(
    `🎉 New Pool Created!\n\n` +
    `Pool ID: #${poolData.id}\n` +
    `Name: ${poolData.name}\n` +
    `Created by: ${poolData.creator}`
  );
}
```

---

### Example 2: Notify Specific User on Prediction Success

```typescript
// When user's prediction succeeds
async function onPredictionSuccess(userId, predictionData) {
  // Get user's Telegram ID from your database
  const telegramId = await getUserTelegramId(userId);

  if (telegramId) {
    await telegramApi.sendMessage(
      telegramId,
      `✅ Your prediction was successful!\n\n` +
      `Pool: ${predictionData.poolName}\n` +
      `Outcome: ${predictionData.outcome}\n` +
      `Winnings: ${predictionData.winnings} tokens`
    );
  }
}
```

---

### Example 3: Daily Summary Broadcast

```typescript
// Run this as a cron job
async function sendDailySummary() {
  const stats = await getDailyStats();

  await telegramApi.broadcast(
    `📊 Daily Summary\n\n` +
    `Active Pools: ${stats.activePools}\n` +
    `Total Predictions: ${stats.predictions}\n` +
    `Top Pool: ${stats.topPool}`
  );
}
```

---

### Example 4: Check Connection Before Sending

```typescript
async function notifyUser(telegramId, message) {
  // Check if user is connected
  const { isAuthorized } = await telegramApi.checkAuth(telegramId);

  if (isAuthorized) {
    await telegramApi.sendMessage(telegramId, message);
  } else {
    console.log('User not connected to Telegram');
    // Prompt user to connect
  }
}
```

---

## 🔧 Troubleshooting

### Bot Not Responding

**Problem:** Bot token not loaded

**Solution:**
```bash
# Check .env file exists
cat backend/.env

# Verify token is set
echo $TELEGRAM_BOT_TOKEN

# Restart backend
cd backend
npm run dev
```

**Expected output:**
```
✅ Telegram bot initialized successfully
```

---

### Login Button Not Appearing

**Problem:** Script not loading

**Solution:**
1. Check browser console for errors
2. Ensure bot username is correct: `predict123_bot`
3. Clear browser cache
4. Check network tab for blocked requests

---

### Messages Not Sending

**Problem:** User not authorized

**Solution:**
```typescript
// Check authorized users
const { users } = await telegramApi.getAuthorizedUsers();
console.log(users);

// If user missing, reconnect via widget or /auth command
```

---

### CORS Error

**Problem:** Frontend can't reach backend

**Solution:**
```typescript
// backend/src/index.ts
app.use(cors()); // Already configured

// Or specify origin:
app.use(cors({
  origin: 'http://localhost:5173'
}));
```

---

## 🎯 Summary

**Key Files:**
- Frontend: `client/src/pages/TelegramConnect.tsx`
- API Client: `client/src/lib/telegramApi.ts`
- Backend Routes: `backend/src/routes/telegramRoutes.ts`
- Bot Service: `backend/src/services/telegramService.ts`

**Authentication:**
- Quick: One-click Telegram widget
- Manual: Token + `/auth` command

**Main Functions:**
- `sendMessage()` - Individual notifications
- `broadcast()` - Mass notifications
- `getAuthorizedUsers()` - User management

**Bot Commands:**
- `/start` - Initialize bot
- `/auth <token>` - Manual auth
- `/status` - Check connection

---

**Need help?** Check the console logs or review the function flow diagrams above! 🚀
