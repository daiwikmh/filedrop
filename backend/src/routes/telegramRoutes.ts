import express, { Request, Response } from 'express';
import telegramService from '../services/telegramService.js';

const router = express.Router();

// Generate auth token for user to connect telegram
router.get('/generate-token', (req: Request, res: Response) => {
  const token = telegramService.generateAuthToken();
  res.json({ token, message: 'Use this token with /auth command in Telegram bot' });
});

// Send message to specific user
router.post('/send-message', async (req: Request, res: Response) => {
  const { telegramId, message } = req.body;

  if (!telegramId || !message) {
    return res.status(400).json({ error: 'telegramId and message are required' });
  }

  const success = await telegramService.sendMessage(Number(telegramId), message);

  if (success) {
    res.json({ success: true, message: 'Message sent successfully' });
  } else {
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

// Broadcast message to all authorized users
router.post('/broadcast', async (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }

  await telegramService.broadcastMessage(message);
  res.json({ success: true, message: 'Broadcast sent to all authorized users' });
});

// Get all authorized users
router.get('/authorized-users', (req: Request, res: Response) => {
  const users = telegramService.getAuthorizedUsers();
  res.json({ users });
});

// Check if user is authorized
router.get('/check-auth/:telegramId', (req: Request, res: Response) => {
  const { telegramId } = req.params;
  const isAuthorized = telegramService.isUserAuthorized(Number(telegramId));
  res.json({ isAuthorized });
});

// Auto-authorize user from Telegram Login Widget
router.post('/auto-auth', (req: Request, res: Response) => {
  const { id, first_name, last_name, username, photo_url, auth_date, hash, walletAddress } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Invalid Telegram user data' });
  }

  // Auto-authorize the user
  const success = telegramService.autoAuthorizeUser({
    telegramId: id,
    firstName: first_name,
    lastName: last_name,
    username: username,
    walletAddress: walletAddress, // Pass wallet address if provided
  });

  if (success) {
    res.json({
      success: true,
      message: 'User authorized successfully',
      telegramId: id
    });
  } else {
    res.status(500).json({ success: false, error: 'Failed to authorize user' });
  }
});

// Get user info by token
router.get('/user-by-token/:token', (req: Request, res: Response) => {
  const { token } = req.params;
  const user = telegramService.getUserByToken(token);

  if (user) {
    res.json({ found: true, user });
  } else {
    res.json({ found: false });
  }
});

export default router;
