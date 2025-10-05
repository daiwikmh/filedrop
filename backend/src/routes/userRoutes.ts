import express, { Request, Response } from 'express';
import userProfileService from '../services/userProfileService.js';

const router = express.Router();

// Get user profile by wallet address
router.get('/profile/wallet/:walletAddress', (req: Request, res: Response) => {
  const { walletAddress } = req.params;
  const profile = userProfileService.getProfileByWallet(walletAddress);

  if (profile) {
    res.json({ profile });
  } else {
    res.status(404).json({ error: 'Profile not found' });
  }
});

// Get user profile by Telegram ID
router.get('/profile/telegram/:telegramId', (req: Request, res: Response) => {
  const { telegramId } = req.params;
  const profile = userProfileService.getProfileByTelegramId(Number(telegramId));

  if (profile) {
    res.json({ profile });
  } else {
    res.status(404).json({ error: 'Profile not found' });
  }
});

// Create or update user profile (link wallet and Telegram)
router.post('/profile/link', (req: Request, res: Response) => {
  const { walletAddress, telegramId, telegramUsername, telegramFirstName } = req.body;

  if (!walletAddress && !telegramId) {
    return res.status(400).json({ error: 'Either walletAddress or telegramId is required' });
  }

  let profile;

  if (walletAddress && telegramId) {
    // Link both wallet and Telegram
    profile = userProfileService.linkTelegram(walletAddress, {
      telegramId,
      telegramUsername,
      telegramFirstName,
    });
  } else if (walletAddress) {
    // Check if profile exists by wallet
    profile = userProfileService.getProfileByWallet(walletAddress);
    if (!profile) {
      // Create new profile with wallet only
      profile = userProfileService.createProfile({ walletAddress });
    }
  } else if (telegramId) {
    // Check if profile exists by Telegram
    profile = userProfileService.getProfileByTelegramId(telegramId);
    if (!profile) {
      // Create new profile with Telegram only
      profile = userProfileService.createProfile({
        telegramId,
        telegramUsername,
        telegramFirstName,
      });
    }
  }

  res.json({ profile, message: 'Profile linked successfully' });
});

// Get all user profiles (admin/debug endpoint)
router.get('/profiles', (req: Request, res: Response) => {
  const profiles = userProfileService.getAllProfiles();
  res.json({ profiles, total: profiles.length });
});

export default router;
