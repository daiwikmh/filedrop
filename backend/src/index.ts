import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import telegramRoutes from './routes/telegramRoutes.js';
import filesRoutes from './routes/filesRoutes.js';
import userRoutes from './routes/userRoutes.js';
import telegramService from './services/telegramService.js';

const app: Application = express();
const PORT = process.env.PORT || 3002;

// Initialize Telegram bot
telegramService.init();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/telegram', telegramRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Predict backend server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 Telegram bot service initialized`);
});
