import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import path from 'path';
import ipfsService from './ipfsService.js';
import fileStorageService from './fileStorageService.js';
import aiAnalysisService from './aiAnalysisService.js';
import userProfileService from './userProfileService.js';

interface TelegramUser {
  telegramId: number;
  username?: string;
  firstName?: string;
  authToken: string;
  authorized: boolean;
  walletAddress?: string;
}

class TelegramService {
  private bot: TelegramBot | null = null;
  private authorizedUsers: Map<number, TelegramUser> = new Map();
  private initialized: boolean = false;
  private storageFile = path.join(process.cwd(), 'data', 'telegram_users.json');

  constructor() {
    // Don't initialize here, wait for init() to be called
    this.ensureDataDir();
  }

  private ensureDataDir() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  private loadUsers() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const data = fs.readFileSync(this.storageFile, 'utf-8');
        const users = JSON.parse(data);
        this.authorizedUsers = new Map(
          users.map((user: TelegramUser) => [user.telegramId, user])
        );
        console.log(`📂 Loaded ${this.authorizedUsers.size} authorized users from storage`);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  private saveUsers() {
    try {
      const users = Array.from(this.authorizedUsers.values());
      fs.writeFileSync(this.storageFile, JSON.stringify(users, null, 2));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  init() {
    if (this.initialized) return;

    // Load existing users first
    this.loadUsers();

    const token = process.env.TELEGRAM_BOT_TOKEN;
    console.log('Initializing Telegram bot with token:', token ? 'Found' : 'Not found');

    if (token) {
      this.bot = new TelegramBot(token, { polling: true });
      this.setupBotHandlers();
      this.initialized = true;
      console.log('✅ Telegram bot initialized successfully');
    } else {
      console.warn('❌ TELEGRAM_BOT_TOKEN not found in environment variables');
    }
  }

  private setupBotHandlers() {
    if (!this.bot) return;

    // Handle /start command (with optional token parameter)
    this.bot.onText(/\/start(.*)/, (msg, match) => {
      const chatId = msg.chat.id;
      const token = match?.[1]?.trim();

      if (token) {
        // Auto-authorize with token from deep link
        const user: TelegramUser = {
          telegramId: msg.from?.id || chatId,
          username: msg.from?.username,
          firstName: msg.from?.first_name,
          authToken: token,
          authorized: true,
        };

        this.authorizedUsers.set(user.telegramId, user);
        this.saveUsers(); // Persist to file

        this.bot?.sendMessage(
          chatId,
          `🎉 Hello ${user.firstName || 'there'}! You are now authorized to receive notifications from Predict.\n\n✅ Your account is connected!`
        );
      } else {
        // Regular start command without token
        this.bot?.sendMessage(
          chatId,
          'Welcome to Predict! To connect your account, please use the auth command with your token from the app.\n\nExample: /auth YOUR_TOKEN'
        );
      }
    });

    // Handle /auth command
    this.bot.onText(/\/auth (.+)/, (msg, match) => {
      const chatId = msg.chat.id;
      const token = match?.[1];

      if (!token) {
        this.bot?.sendMessage(chatId, 'Please provide a valid token.');
        return;
      }

      // Authorize user
      const user: TelegramUser = {
        telegramId: msg.from?.id || chatId,
        username: msg.from?.username,
        firstName: msg.from?.first_name,
        authToken: token,
        authorized: true,
      };

      this.authorizedUsers.set(user.telegramId, user);
      this.saveUsers(); // Persist to file

      this.bot?.sendMessage(
        chatId,
        `🎉 Hello ${user.firstName || 'there'}! You are now authorized to receive notifications from Predict.`
      );
    });

    // Handle /status command
    this.bot.onText(/\/status/, (msg) => {
      const chatId = msg.chat.id;
      const isAuthorized = this.authorizedUsers.has(msg.from?.id || chatId);

      if (isAuthorized) {
        const userFiles = fileStorageService.getFilesByUser(msg.from?.id || chatId);
        const stats = fileStorageService.getStats();

        this.bot?.sendMessage(
          chatId,
          `✅ You are authorized and connected to FileCoin Store.\n\n` +
          `📁 Your files: ${userFiles.length}\n` +
          `💾 Total storage used: ${(userFiles.reduce((acc, f) => acc + f.fileSize, 0) / 1024 / 1024).toFixed(2)} MB`
        );
      } else {
        this.bot?.sendMessage(chatId, '❌ You are not authorized. Use /auth with your token to connect.');
      }
    });

    // Handle file uploads (photos, documents, videos)
    this.bot.on('photo', (msg) => this.handleFileUpload(msg, 'photo'));
    this.bot.on('document', (msg) => this.handleFileUpload(msg, 'document'));
    this.bot.on('video', (msg) => this.handleFileUpload(msg, 'video'));
    this.bot.on('audio', (msg) => this.handleFileUpload(msg, 'audio'));
  }

  private async handleFileUpload(msg: any, fileType: string) {
    const chatId = msg.chat.id;
    const userId = msg.from?.id || chatId;

    // Check if user is authorized
    if (!this.authorizedUsers.has(userId)) {
      this.bot?.sendMessage(chatId, '❌ Please connect your account first using the dApp.');
      return;
    }

    // Declare variables outside try block for error logging
    let fileId: string = '';
    let fileName: string = '';
    let mimeType: string = '';

    try {
      // Send uploading message
      let uploadMsg;
      try {
        uploadMsg = await this.bot?.sendMessage(chatId, '⏳ Uploading to IPFS/Filecoin...');
      } catch (msgError) {
        console.warn('⚠️  Could not send initial message to Telegram');
      }

      // Get file info based on type
      if (fileType === 'photo') {
        const photo = msg.photo[msg.photo.length - 1]; // Get highest resolution
        fileId = photo.file_id;
        fileName = `photo_${Date.now()}.jpg`;
        mimeType = 'image/jpeg';
      } else if (fileType === 'document') {
        fileId = msg.document.file_id;
        fileName = msg.document.file_name || `document_${Date.now()}`;
        mimeType = msg.document.mime_type || 'application/octet-stream';

        // Handle MKV files sent as documents
        if (fileName.toLowerCase().endsWith('.mkv')) {
          mimeType = 'video/x-matroska';
        }
      } else if (fileType === 'video') {
        fileId = msg.video.file_id;
        fileName = msg.video.file_name || `video_${Date.now()}.mp4`;
        mimeType = msg.video.mime_type || 'video/mp4';

        // Handle MKV files specifically
        if (fileName.toLowerCase().endsWith('.mkv')) {
          mimeType = 'video/x-matroska';
        }
      } else if (fileType === 'audio') {
        fileId = msg.audio.file_id;
        fileName = msg.audio.file_name || `audio_${Date.now()}.mp3`;
        mimeType = msg.audio.mime_type || 'audio/mpeg';
      } else {
        return;
      }

      // Get file from Telegram
      const file = await this.bot?.getFile(fileId);
      if (!file) throw new Error('Failed to get file from Telegram');

      const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

      // Download file
      const fileBuffer = await ipfsService.downloadTelegramFile(fileUrl, process.env.TELEGRAM_BOT_TOKEN!);

      // AI Analysis (BEFORE compression) - for images only
      let aiAnalysis;
      if (aiAnalysisService.isImageSupported(mimeType)) {
        console.log('🔍 Running AI analysis on image...');
        aiAnalysis = await aiAnalysisService.analyzeImage(fileBuffer, mimeType, fileName);
        console.log(`📊 AI Analysis: ${aiAnalysis.category} - ${aiAnalysis.description.substring(0, 50)}...`);
      }

      // Upload to IPFS (with compression)
      const uploadResult = await ipfsService.uploadFile(fileBuffer, fileName, mimeType);

      // Save metadata
      const user = this.authorizedUsers.get(userId);
      const fileMetadata = fileStorageService.addFile({
        fileName: uploadResult.fileName,
        cid: uploadResult.cid,
        telegramUserId: userId,
        userName: user?.firstName || user?.username,
        fileType: uploadResult.fileType,
        fileSize: uploadResult.fileSize,
        ipfsUrl: uploadResult.ipfsUrl,
        isCompressed: uploadResult.isCompressed,
        originalSize: uploadResult.originalSize,
        compressionRatio: uploadResult.compressionRatio,
        aiAnalysis: aiAnalysis, // Include AI analysis
      });

      // Send success message with IPFS link
      try {
        const compressionInfo = uploadResult.isCompressed
          ? `\n📦 Compressed: ${((uploadResult.originalSize || 0) / 1024).toFixed(2)} KB → ${(uploadResult.fileSize / 1024).toFixed(2)} KB (${uploadResult.compressionRatio?.toFixed(1)}% saved)\n`
          : '';

        const aiInfo = aiAnalysis
          ? `\n🤖 AI Analysis:\n` +
            `   Category: ${aiAnalysis.category}\n` +
            `   Description: ${aiAnalysis.description}\n` +
            `   Tags: ${aiAnalysis.tags.slice(0, 5).join(', ')}\n`
          : '';

        await this.bot?.editMessageText(
          `✅ File uploaded successfully!\n\n` +
          `📄 Name: ${uploadResult.fileName}\n` +
          `🔗 CID: ${uploadResult.cid}\n` +
          `💾 Size: ${(uploadResult.fileSize / 1024).toFixed(2)} KB` +
          compressionInfo +
          aiInfo +
          `\n🌐 IPFS Link:\n${uploadResult.ipfsUrl}\n\n` +
          `View all your files in the dApp!`,
          { chat_id: chatId, message_id: uploadMsg?.message_id }
        );
      } catch (telegramError) {
        console.warn('⚠️  Could not send Telegram message (bot polling conflict):', (telegramError as Error).message);
      }

      console.log(`✅ File uploaded by user ${userId}: ${uploadResult.cid} (${uploadResult.isCompressed ? 'compressed' : 'uncompressed'})`);
    } catch (error) {
      console.error('❌ Error handling file upload:', error);
      console.error('Error details:', {
        fileName,
        fileType,
        mimeType,
        error: (error as Error).message,
        stack: (error as Error).stack
      });

      try {
        await this.bot?.sendMessage(
          chatId,
          `❌ Failed to upload file to IPFS.\n\nError: ${(error as Error).message}\n\nPlease try again or contact support.`
        );
      } catch (telegramError) {
        console.warn('⚠️  Could not send error message to Telegram');
      }
    }
  }

  // Send message to specific telegram user
  async sendMessage(telegramId: number, message: string): Promise<boolean> {
    if (!this.bot) {
      console.error('Telegram bot not initialized');
      return false;
    }

    try {
      await this.bot.sendMessage(telegramId, message);
      return true;
    } catch (error) {
      console.error('Error sending telegram message:', error);
      return false;
    }
  }

  // Send message to all authorized users
  async broadcastMessage(message: string): Promise<void> {
    const promises = Array.from(this.authorizedUsers.keys()).map((telegramId) =>
      this.sendMessage(telegramId, message)
    );
    await Promise.all(promises);
  }

  // Generate auth token for user
  generateAuthToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Check if user is authorized
  isUserAuthorized(telegramId: number): boolean {
    return this.authorizedUsers.has(telegramId);
  }

  // Get user by token
  getUserByToken(token: string): TelegramUser | undefined {
    return Array.from(this.authorizedUsers.values()).find((user) => user.authToken === token);
  }

  // Get all authorized users
  getAuthorizedUsers(): TelegramUser[] {
    return Array.from(this.authorizedUsers.values());
  }

  // Auto-authorize user from Telegram Login Widget
  autoAuthorizeUser(userData: {
    telegramId: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    walletAddress?: string;
  }): boolean {
    try {
      const authToken = this.generateAuthToken();

      const user: TelegramUser = {
        telegramId: userData.telegramId,
        username: userData.username,
        firstName: userData.firstName,
        authToken: authToken,
        authorized: true,
        walletAddress: userData.walletAddress,
      };

      this.authorizedUsers.set(userData.telegramId, user);
      this.saveUsers(); // Persist to file

      // Link to user profile if wallet address is provided
      if (userData.walletAddress) {
        userProfileService.linkTelegram(userData.walletAddress, {
          telegramId: userData.telegramId,
          telegramUsername: userData.username,
          telegramFirstName: userData.firstName,
        });
        console.log(`✅ Linked Telegram ${userData.telegramId} to wallet ${userData.walletAddress}`);
      }

      console.log(`✅ Auto-authorized user: ${userData.firstName} (ID: ${userData.telegramId})`);

      return true;
    } catch (error) {
      console.error('Error auto-authorizing user:', error);
      return false;
    }
  }
}

export default new TelegramService();
