# FileCoin Store - Telegram → IPFS/Filecoin dApp

## 📋 Overview

FileCoin Store is a decentralized file storage application that allows users to upload files via Telegram, which are then permanently stored on IPFS/Filecoin. Users receive a CID and permanent IPFS link to access or share their files.

**Bot Username:** `@filecoinstore_bot`

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  Telegram Bot   │────────▶│  Express API    │────────▶│     Pinata      │
│  (File Upload)  │  File   │  (Processing)   │  Upload │  (IPFS/Filecoin)│
│                 │◀────────│                 │◀────────│                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │                 │
                            │  React Client   │
                            │  (Asset View)   │
                            │                 │
                            └─────────────────┘
```

### **Components:**

1. **Telegram Bot (@filecoinstore_bot)**
   - Receives file uploads (photos, videos, documents, audio)
   - Downloads files from Telegram
   - Sends files to IPFS service
   - Returns CID and IPFS link to user

2. **Backend (Express + TypeScript)**
   - File upload service (IPFS/Pinata)
   - File metadata storage (JSON-based)
   - REST API for file listing
   - User authorization management

3. **Frontend (React + Filecoin Calibration)**
   - Assets gallery view
   - File preview with IPFS links
   - Search and filter functionality
   - Filecoin wallet connection

4. **Storage**
   - **IPFS/Filecoin:** Permanent decentralized file storage
   - **Metadata:** JSON files (`data/files.json`, `data/telegram_users.json`)

---

## 🚀 Setup Instructions

### **1. Get Pinata API Credentials**

1. Visit [app.pinata.cloud](https://app.pinata.cloud) and create a free account
2. Navigate to **Developers → API Keys**
3. Click **New Key** and create a key with upload permissions
4. Save your JWT token, API Key, and API Secret

**Pinata Free Tier Benefits:**
- 1 GB storage
- Unlimited pinning
- Dedicated IPFS gateway
- Fast upload speeds
- No credit card required

### **2. Configure Backend**

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

**Edit `.env`:**
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
PINATA_JWT=your_pinata_jwt_here
PINATA_API_KEY=your_pinata_api_key_here
PINATA_API_SECRET=your_pinata_api_secret_here
PORT=3002
```

**Start backend:**
```bash
npm run dev
```

**Expected output:**
```
✅ Telegram bot initialized successfully
✅ Pinata client initialized
📂 Loaded X files from storage
🚀 Server is running on port 3002
```

### **3. Configure Frontend**

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

**Access UI:** `http://localhost:5173`

### **4. Connect MetaMask to Filecoin Calibration**

The app is configured for **Filecoin Calibration Testnet**:
- Chain ID: `314159`
- RPC: Handled by Wagmi/viem
- Use MetaMask to connect

---

## 📱 How to Use

### **Step 1: Connect Telegram**

1. Visit `http://localhost:5173/connect-telegram`
2. Click **"📱 Open Telegram & Connect"**
3. Telegram opens → Click **"Start"** in bot chat
4. ✅ You're connected!

### **Step 2: Upload Files**

1. Open Telegram chat with `@filecoinstore_bot`
2. Send any file:
   - 📸 Photos/Images
   - 🎥 Videos
   - 📄 Documents (PDF, Word, etc.)
   - 🎵 Audio files

3. Bot responds:
   ```
   ⏳ Uploading to IPFS/Filecoin...

   ✅ File uploaded successfully!

   📄 Name: photo_1234567890.jpg
   🔗 CID: bafybei...xyz
   💾 Size: 245.32 KB

   🌐 IPFS Link:
   https://gateway.pinata.cloud/ipfs/bafybei...xyz

   View all your files in the dApp!
   ```

### **Step 3: View Files**

1. Visit `http://localhost:5173/` (Assets page)
2. Browse all uploaded files
3. Search by filename or CID
4. Filter by type (images, videos, documents)
5. Click **"View on IPFS"** to open file
6. Click **"Copy Link"** to share

---

## 🔌 API Endpoints

### **File Management**

#### `GET /api/files`
Get all uploaded files

**Response:**
```json
{
  "files": [
    {
      "id": "uuid-here",
      "fileName": "photo.jpg",
      "cid": "bafybei...xyz",
      "telegramUserId": 123456789,
      "userName": "John",
      "uploadedAt": "2025-10-02T10:30:00.000Z",
      "fileType": "image/jpeg",
      "fileSize": 251238,
      "ipfsUrl": "https://gateway.pinata.cloud/ipfs/bafybei...xyz"
    }
  ]
}
```

#### `GET /api/files/user/:telegramUserId`
Get files by specific user

#### `GET /api/files/cid/:cid`
Get file by CID

#### `GET /api/files/:id`
Get file by ID

#### `DELETE /api/files/:id`
Delete file metadata (Note: IPFS file remains permanent)

#### `GET /api/files/stats/all`
Get storage statistics

**Response:**
```json
{
  "totalFiles": 42,
  "totalSize": 15728640,
  "fileTypes": {
    "image": 25,
    "video": 10,
    "application": 7
  }
}
```

### **Telegram Management**

#### `GET /api/telegram/generate-token`
Generate auth token for Telegram connection

#### `POST /api/telegram/send-message`
Send message to Telegram user

#### `GET /api/telegram/authorized-users`
List all authorized users

---

## 🤖 Telegram Bot Commands

### `/start`
Initialize bot and auto-connect with token

### `/auth <token>`
Manual authorization with token (alternative method)

### `/status`
Check connection status and view your file statistics

**Example response:**
```
✅ You are authorized and connected to FileCoin Store.

📁 Your files: 15
💾 Total storage used: 45.23 MB
```

---

## 📂 File Upload Flow

```
1. User sends file to Telegram bot
   ↓
2. Bot validates user authorization
   ↓
3. Bot downloads file from Telegram servers
   ↓
4. File buffer sent to IPFS service
   ↓
5. Pinata uploads to IPFS (instant) with pinning
   ↓
6. CID generated and returned
   ↓
7. Metadata saved to files.json
   ↓
8. Bot sends IPFS link to user
   ↓
9. File appears in dApp Assets page
```

---

## 🗄️ Data Storage

### **Files Metadata** (`backend/data/files.json`)
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fileName": "document.pdf",
    "cid": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    "telegramUserId": 123456789,
    "userName": "John Doe",
    "uploadedAt": "2025-10-02T10:30:00.000Z",
    "fileType": "application/pdf",
    "fileSize": 1048576,
    "ipfsUrl": "https://gateway.pinata.cloud/ipfs/bafybei..."
  }
]
```

### **Telegram Users** (`backend/data/telegram_users.json`)
```json
[
  {
    "telegramId": 123456789,
    "username": "johndoe",
    "firstName": "John",
    "authToken": "abc123xyz",
    "authorized": true
  }
]
```

---

## 🔧 Backend Services Reference

### **IPFSService** (`backend/src/services/ipfsService.ts`)

**Implementation:** Direct Pinata API using axios and FormData

#### `uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult>`

Uploads file to IPFS via Pinata API with automatic pinning.

**Implementation:**
```typescript
async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult> {
  // Initialize JWT on first use
  if (!this.initialized) {
    this.initClient();
  }

  // Create FormData and append file
  const formData = new FormData();
  formData.append('file', fileBuffer, {
    filename: fileName,
    contentType: mimeType,
  });

  // Upload to IPFS via Pinata API
  const response = await axios.post(
    'https://api.pinata.cloud/pinning/pinFileToIPFS',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${this.pinataJwt}`,
        ...formData.getHeaders(),
      },
      maxBodyLength: Infinity,
    }
  );

  const cid = response.data.IpfsHash;
  const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;

  return { cid, ipfsUrl, fileName, fileSize: fileBuffer.length, fileType: mimeType };
}
```

**Returns:**
```typescript
{
  cid: string;              // IPFS Content Identifier
  ipfsUrl: string;          // Pinata gateway URL
  fileName: string;         // Original filename
  fileSize: number;         // File size in bytes
  fileType: string;         // MIME type
}
```

**Example Response:**
```json
{
  "cid": "QmY9m2QziWeN1SmkYJXEdi2i553PQSp8o4eC1QA7LWYR5Q",
  "ipfsUrl": "https://gateway.pinata.cloud/ipfs/QmY9m2QziWeN1SmkYJXEdi2i553PQSp8o4eC1QA7LWYR5Q",
  "fileName": "photo_1759425245170.jpg",
  "fileSize": 54330,
  "fileType": "image/jpeg"
}
```

#### `downloadTelegramFile(fileUrl: string, botToken: string): Promise<Buffer>`

Downloads file from Telegram servers as a Buffer.

**Implementation:**
```typescript
async downloadTelegramFile(fileUrl: string, botToken: string): Promise<Buffer> {
  const response = await axios.get(fileUrl, {
    responseType: 'arraybuffer',
    headers: {
      'Authorization': `Bearer ${botToken}`,
    },
  });
  return Buffer.from(response.data);
}
```

#### `getGatewayUrl(cid: string, fileName: string): string`

Generates primary Pinata gateway URL.

```typescript
getGatewayUrl(cid: string, fileName: string): string {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}
```

#### `getAlternativeUrls(cid: string, fileName: string)`

Get multiple IPFS gateway options for redundancy.

```typescript
getAlternativeUrls(cid: string, fileName: string) {
  return {
    pinata: `https://gateway.pinata.cloud/ipfs/${cid}`,
    ipfsIo: `https://ipfs.io/ipfs/${cid}`,
    cloudflare: `https://cloudflare-ipfs.com/ipfs/${cid}`,
    dweb: `https://dweb.link/ipfs/${cid}`,
  };
}
```

---

### **FileStorageService** (`backend/src/services/fileStorageService.ts`)

**Implementation:** JSON file-based storage with auto-save functionality

#### `addFile(metadata: Omit<FileMetadata, 'id' | 'uploadedAt'>): FileMetadata`

Save file metadata to storage.

**Implementation:**
```typescript
addFile(metadata: Omit<FileMetadata, 'id' | 'uploadedAt'>): FileMetadata {
  const file: FileMetadata = {
    id: uuidv4(),
    ...metadata,
    uploadedAt: new Date().toISOString(),
  };

  this.files.push(file);
  this.saveFiles();  // Auto-save to files.json

  return file;
}
```

**Example:**
```typescript
const fileMetadata = fileStorageService.addFile({
  fileName: 'photo_1759425245170.jpg',
  cid: 'QmY9m2QziWeN1SmkYJXEdi2i553PQSp8o4eC1QA7LWYR5Q',
  telegramUserId: 8294027606,
  userName: 'Development',
  fileType: 'image/jpeg',
  fileSize: 54330,
  ipfsUrl: 'https://gateway.pinata.cloud/ipfs/QmY9m2QziWeN1SmkYJXEdi2i553PQSp8o4eC1QA7LWYR5Q',
});
```

#### `getAllFiles(): FileMetadata[]`

Get all uploaded files.

```typescript
getAllFiles(): FileMetadata[] {
  return this.files;
}
```

#### `getFilesByUser(telegramUserId: number): FileMetadata[]`

Get files uploaded by specific user.

```typescript
getFilesByUser(telegramUserId: number): FileMetadata[] {
  return this.files.filter(f => f.telegramUserId === telegramUserId);
}
```

#### `getFileByCID(cid: string): FileMetadata | undefined`

Find file by IPFS CID.

```typescript
getFileByCID(cid: string): FileMetadata | undefined {
  return this.files.find(f => f.cid === cid);
}
```

#### `getFileById(id: string): FileMetadata | undefined`

Find file by unique ID.

```typescript
getFileById(id: string): FileMetadata | undefined {
  return this.files.find(f => f.id === id);
}
```

#### `deleteFile(id: string): boolean`

Remove file metadata (IPFS file remains permanent).

```typescript
deleteFile(id: string): boolean {
  const index = this.files.findIndex(f => f.id === id);
  if (index !== -1) {
    this.files.splice(index, 1);
    this.saveFiles();
    return true;
  }
  return false;
}
```

#### `getStats()`

Get storage statistics.

**Implementation:**
```typescript
getStats() {
  const totalSize = this.files.reduce((acc, f) => acc + f.fileSize, 0);
  const fileTypes: Record<string, number> = {};

  this.files.forEach(file => {
    const type = file.fileType.split('/')[0]; // e.g., 'image', 'video', 'application'
    fileTypes[type] = (fileTypes[type] || 0) + 1;
  });

  return {
    totalFiles: this.files.length,
    totalSize,
    fileTypes,
  };
}
```

**Example Response:**
```json
{
  "totalFiles": 2,
  "totalSize": 108660,
  "fileTypes": {
    "image": 2
  }
}
```

---

### **TelegramService** (`backend/src/services/telegramService.ts`)

**Implementation:** Telegram Bot API integration with file upload handling

#### Bot Event Handlers

The service registers handlers for different file types:

```typescript
this.bot.on('photo', (msg) => this.handleFileUpload(msg, 'photo'));
this.bot.on('document', (msg) => this.handleFileUpload(msg, 'document'));
this.bot.on('video', (msg) => this.handleFileUpload(msg, 'video'));
this.bot.on('audio', (msg) => this.handleFileUpload(msg, 'audio'));
```

#### `handleFileUpload(msg: any, fileType: string): Promise<void>`

Complete file upload flow with error handling.

**Implementation:**
```typescript
private async handleFileUpload(msg: any, fileType: string) {
  const chatId = msg.chat.id;
  const userId = msg.from?.id || chatId;

  // 1. Check authorization
  if (!this.authorizedUsers.has(userId)) {
    this.bot?.sendMessage(chatId, '❌ Please connect your account first using the dApp.');
    return;
  }

  try {
    // 2. Send uploading message (with error handling for polling conflicts)
    let uploadMsg;
    try {
      uploadMsg = await this.bot?.sendMessage(chatId, '⏳ Uploading to IPFS/Filecoin...');
    } catch (msgError) {
      console.warn('⚠️  Could not send initial message to Telegram');
    }

    // 3. Get file info based on type
    let fileId: string;
    let fileName: string;
    let mimeType: string;

    if (fileType === 'photo') {
      const photo = msg.photo[msg.photo.length - 1]; // Highest resolution
      fileId = photo.file_id;
      fileName = `photo_${Date.now()}.jpg`;
      mimeType = 'image/jpeg';
    } else if (fileType === 'document') {
      fileId = msg.document.file_id;
      fileName = msg.document.file_name || `document_${Date.now()}`;
      mimeType = msg.document.mime_type || 'application/octet-stream';
    } else if (fileType === 'video') {
      fileId = msg.video.file_id;
      fileName = msg.video.file_name || `video_${Date.now()}.mp4`;
      mimeType = msg.video.mime_type || 'video/mp4';
    } else if (fileType === 'audio') {
      fileId = msg.audio.file_id;
      fileName = msg.audio.file_name || `audio_${Date.now()}.mp3`;
      mimeType = msg.audio.mime_type || 'audio/mpeg';
    } else {
      return;
    }

    // 4. Get file from Telegram
    const file = await this.bot?.getFile(fileId);
    if (!file) throw new Error('Failed to get file from Telegram');

    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

    // 5. Download file
    const fileBuffer = await ipfsService.downloadTelegramFile(
      fileUrl,
      process.env.TELEGRAM_BOT_TOKEN!
    );

    // 6. Upload to IPFS via Pinata
    const uploadResult = await ipfsService.uploadFile(fileBuffer, fileName, mimeType);

    // 7. Save metadata to database
    const user = this.authorizedUsers.get(userId);
    const fileMetadata = fileStorageService.addFile({
      fileName: uploadResult.fileName,
      cid: uploadResult.cid,
      telegramUserId: userId,
      userName: user?.firstName || user?.username,
      fileType: uploadResult.fileType,
      fileSize: uploadResult.fileSize,
      ipfsUrl: uploadResult.ipfsUrl,
    });

    // 8. Send success message (with error handling for polling conflicts)
    try {
      await this.bot?.editMessageText(
        `✅ File uploaded successfully!\n\n` +
        `📄 Name: ${uploadResult.fileName}\n` +
        `🔗 CID: ${uploadResult.cid}\n` +
        `💾 Size: ${(uploadResult.fileSize / 1024).toFixed(2)} KB\n\n` +
        `🌐 IPFS Link:\n${uploadResult.ipfsUrl}\n\n` +
        `View all your files in the dApp!`,
        { chat_id: chatId, message_id: uploadMsg?.message_id }
      );
    } catch (telegramError) {
      console.warn('⚠️  Could not send Telegram message (bot polling conflict)');
    }

    console.log(`✅ File uploaded by user ${userId}: ${uploadResult.cid}`);
  } catch (error) {
    console.error('Error handling file upload:', error);
    try {
      await this.bot?.sendMessage(
        chatId,
        '❌ Failed to upload file to IPFS. Please try again or contact support.'
      );
    } catch (telegramError) {
      console.warn('⚠️  Could not send error message to Telegram');
    }
  }
}
```

**Flow Summary:**
1. ✅ Check user authorization
2. ⏳ Send "uploading" message (with error handling)
3. 📋 Extract file metadata (ID, name, MIME type)
4. 📥 Download file from Telegram servers
5. ☁️ Upload to IPFS via Pinata API
6. 💾 Save metadata to database
7. ✅ Send success message with CID and link
8. 🔒 Error handling for Telegram polling conflicts

#### Other Methods

```typescript
// Send message to specific user
async sendMessage(telegramId: number, message: string): Promise<boolean>

// Broadcast to all authorized users
async broadcastMessage(message: string): Promise<void>

// Generate random auth token
generateAuthToken(): string

// Check if user is authorized
isUserAuthorized(telegramId: number): boolean

// Get user by auth token
getUserByToken(token: string): TelegramUser | undefined

// Get all authorized users
getAuthorizedUsers(): TelegramUser[]

// Auto-authorize user (called from web app)
autoAuthorizeUser(userData: { telegramId, firstName?, username? }): boolean
```

---

## 🌐 IPFS Gateways

Files are accessible through multiple gateways:

- **Pinata (Primary):** `https://gateway.pinata.cloud/ipfs/{cid}` - Dedicated, fast gateway
- **IPFS.io:** `https://ipfs.io/ipfs/{cid}` - Public IPFS gateway
- **Cloudflare:** `https://cloudflare-ipfs.com/ipfs/{cid}` - CDN-backed gateway
- **Dweb:** `https://dweb.link/ipfs/{cid}` - Decentralized gateway

**Why Pinata Gateway?**
- Faster access with dedicated infrastructure
- Better reliability for pinned files
- Optimized for content delivery
- Free tier includes gateway access

---

## 🎨 Frontend Components

### **Assets Page** (`client/src/pages/Assets.tsx`)
- Grid view of all uploaded files
- Image previews for photos
- File type icons for other formats
- Search by filename/CID
- Filter by file type
- Copy CID/IPFS link
- View on IPFS gateway

### **TelegramConnect Page** (`client/src/pages/TelegramConnect.tsx`)
- One-click Telegram connection
- Connection status check
- Upload instructions
- Test broadcast functionality

### **Wallet Integration**
- Filecoin Calibration testnet
- MetaMask connector
- Wallet display in sidebar

---

## 🔐 Security Notes

1. **File Privacy:** Files uploaded to IPFS are **public** by default
2. **CID Permanence:** Files on IPFS/Filecoin are permanent and **cannot be deleted**
3. **Metadata Only:** Deleting via API only removes metadata, not the IPFS file
4. **Authorization:** Users must connect Telegram before uploading
5. **Token Storage:** Auth tokens stored in `data/telegram_users.json`

---

## 🐛 Troubleshooting

### Bot Not Uploading Files

**Problem:** "Failed to upload file" error

**Solution:**
1. Check `PINATA_JWT` in `.env` is set correctly
2. Verify Pinata API key has upload permissions
3. Check backend logs for specific errors
4. Ensure you haven't exceeded Pinata free tier limits (1GB)

### Files Not Showing in dApp

**Problem:** Files uploaded but not visible in Assets page

**Solution:**
1. Check `data/files.json` exists and has data
2. Verify `/api/files` endpoint returns data
3. Check browser console for API errors
4. Ensure CORS is enabled

### IPFS Link Not Working

**Problem:** IPFS gateway shows 404

**Solution:**
1. Pinata gateway should work instantly (files are pinned immediately)
2. Try alternative gateways (ipfs.io, cloudflare, dweb) if Pinata is slow
3. Verify CID is correct in the database
4. Check Pinata dashboard at app.pinata.cloud to confirm file was uploaded

---

## 📊 Usage Example

```bash
# 1. Connect Telegram
curl http://localhost:3002/api/telegram/generate-token

# 2. Open bot in Telegram
# Send: /start <token>

# 3. Upload a file
# Send any file to @filecoinstore_bot

# 4. Get file list
curl http://localhost:3002/api/files

# 5. Get user's files
curl http://localhost:3002/api/files/user/123456789

# 6. Get stats
curl http://localhost:3002/api/files/stats/all
```

---

## 🎯 Summary

**Key Features:**
- ✅ One-click Telegram connection
- ✅ Upload any file type via Telegram
- ✅ Permanent IPFS/Filecoin storage
- ✅ CID generation and sharing
- ✅ Web interface for file browsing
- ✅ Filecoin wallet integration
- ✅ File metadata tracking
- ✅ Multiple IPFS gateways

**Tech Stack:**
- **Frontend:** React, Viem, Wagmi, TailwindCSS
- **Backend:** Node.js, Express, TypeScript
- **Storage:** IPFS (via Pinata) - Instant uploads with pinning
- **Bot:** Telegram Bot API
- **Blockchain:** Filecoin Calibration Testnet

**Cost Savings with Pinata:**
- Free tier: 1GB storage, unlimited bandwidth
- Instant IPFS uploads (no waiting for Filecoin deals)
- Dedicated gateway for faster access
- Optional Filecoin deals can be made later for high-value files

---

---

## ✅ Implementation Status & Testing

### **Verified Working Features:**

1. **✅ IPFS Upload via Pinata**
   - Direct API implementation using `axios` and `form-data`
   - Successfully tested with real file upload
   - Example CID: `QmY9m2QziWeN1SmkYJXEdi2i553PQSp8o4eC1QA7LWYR5Q`
   - File accessible at: https://gateway.pinata.cloud/ipfs/QmY9m2QziWeN1SmkYJXEdi2i553PQSp8o4eC1QA7LWYR5Q

2. **✅ File Metadata Storage**
   - JSON-based storage in `data/files.json`
   - Auto-save on every upload
   - Includes: CID, filename, user info, file size, MIME type, upload timestamp

3. **✅ Telegram Integration**
   - File upload from Telegram bot works
   - Supports: photos, documents, videos, audio
   - Error handling for bot polling conflicts
   - Graceful degradation (upload succeeds even if messaging fails)

4. **✅ REST API Endpoints**
   - `GET /api/files` - List all files
   - `GET /api/files/user/:id` - User's files
   - `GET /api/files/cid/:cid` - Find by CID
   - `GET /api/files/stats/all` - Storage statistics

5. **✅ Frontend Features**
   - Dashboard with FIL balance, storage stats, recent files
   - Assets page with auto-refresh (every 10 seconds)
   - TelegramConnect with connection polling
   - Real-time connection status updates

### **Dependencies Installed:**

**Backend:**
```json
{
  "axios": "^1.x.x",
  "form-data": "^4.x.x",
  "node-telegram-bot-api": "^0.x.x",
  "express": "^4.x.x",
  "dotenv": "^16.x.x"
}
```

**Frontend:**
```json
{
  "wagmi": "^2.x.x",
  "viem": "^2.x.x",
  "@tanstack/react-query": "^5.x.x"
}
```

### **Example File Upload Result:**

```json
{
  "id": "15627e99-dfae-48e9-aa2e-060dc2e84ceb",
  "fileName": "photo_1759425245170.jpg",
  "cid": "QmY9m2QziWeN1SmkYJXEdi2i553PQSp8o4eC1QA7LWYR5Q",
  "telegramUserId": 8294027606,
  "userName": "Development",
  "fileType": "image/jpeg",
  "fileSize": 54330,
  "ipfsUrl": "https://gateway.pinata.cloud/ipfs/QmY9m2QziWeN1SmkYJXEdi2i553PQSp8o4eC1QA7LWYR5Q",
  "uploadedAt": "2025-10-02T17:14:10.998Z"
}
```

### **Known Issues & Solutions:**

**Issue:** Telegram Bot Polling Error (`EFATAL: AggregateError`)
- **Cause:** Multiple bot instances running with same token
- **Impact:** Telegram messaging may fail, but file upload still works
- **Solution:** Ensure only one backend instance is running
- **Workaround:** Error handling prevents crashes, uploads succeed silently

---

**Need help?** Check console logs or review the function flow diagrams above! 🚀
