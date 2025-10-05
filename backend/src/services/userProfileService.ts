import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UserProfile {
  id: string;
  walletAddress?: string;
  telegramId?: number;
  telegramUsername?: string;
  telegramFirstName?: string;
  createdAt: string;
  updatedAt: string;
}

class UserProfileService {
  private storageFile = path.join(process.cwd(), 'data', 'user_profiles.json');
  private profiles: UserProfile[] = [];

  constructor() {
    this.ensureDataDir();
    this.loadProfiles();
  }

  private ensureDataDir() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  private loadProfiles() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const data = fs.readFileSync(this.storageFile, 'utf-8');
        this.profiles = JSON.parse(data);
        console.log(`📂 Loaded ${this.profiles.length} user profiles from storage`);
      }
    } catch (error) {
      console.error('Error loading user profiles:', error);
      this.profiles = [];
    }
  }

  private saveProfiles() {
    try {
      fs.writeFileSync(this.storageFile, JSON.stringify(this.profiles, null, 2));
    } catch (error) {
      console.error('Error saving user profiles:', error);
    }
  }

  // Get profile by wallet address
  getProfileByWallet(walletAddress: string): UserProfile | undefined {
    return this.profiles.find(
      (p) => p.walletAddress?.toLowerCase() === walletAddress.toLowerCase()
    );
  }

  // Get profile by Telegram ID
  getProfileByTelegramId(telegramId: number): UserProfile | undefined {
    return this.profiles.find((p) => p.telegramId === telegramId);
  }

  // Create new profile
  createProfile(data: Partial<UserProfile>): UserProfile {
    const profile: UserProfile = {
      id: uuidv4(),
      walletAddress: data.walletAddress,
      telegramId: data.telegramId,
      telegramUsername: data.telegramUsername,
      telegramFirstName: data.telegramFirstName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.profiles.push(profile);
    this.saveProfiles();
    console.log(`✅ Created user profile: ${profile.id}`);
    return profile;
  }

  // Link Telegram to existing wallet profile
  linkTelegram(
    walletAddress: string,
    telegramData: {
      telegramId: number;
      telegramUsername?: string;
      telegramFirstName?: string;
    }
  ): UserProfile {
    // Check if profile exists by wallet
    let profile = this.getProfileByWallet(walletAddress);

    if (profile) {
      // Update existing profile
      profile.telegramId = telegramData.telegramId;
      profile.telegramUsername = telegramData.telegramUsername;
      profile.telegramFirstName = telegramData.telegramFirstName;
      profile.updatedAt = new Date().toISOString();
      this.saveProfiles();
      console.log(`✅ Linked Telegram to wallet profile: ${walletAddress}`);
    } else {
      // Create new profile
      profile = this.createProfile({
        walletAddress,
        ...telegramData,
      });
    }

    return profile;
  }

  // Link wallet to existing Telegram profile
  linkWallet(telegramId: number, walletAddress: string): UserProfile {
    // Check if profile exists by Telegram ID
    let profile = this.getProfileByTelegramId(telegramId);

    if (profile) {
      // Update existing profile
      profile.walletAddress = walletAddress;
      profile.updatedAt = new Date().toISOString();
      this.saveProfiles();
      console.log(`✅ Linked wallet to Telegram profile: ${telegramId}`);
    } else {
      // Create new profile
      profile = this.createProfile({
        telegramId,
        walletAddress,
      });
    }

    return profile;
  }

  // Get all profiles
  getAllProfiles(): UserProfile[] {
    return this.profiles;
  }

  // Update profile
  updateProfile(id: string, updates: Partial<UserProfile>): UserProfile | null {
    const profile = this.profiles.find((p) => p.id === id);

    if (!profile) {
      return null;
    }

    Object.assign(profile, updates, { updatedAt: new Date().toISOString() });
    this.saveProfiles();
    console.log(`✅ Updated user profile: ${id}`);
    return profile;
  }

  // Delete profile
  deleteProfile(id: string): boolean {
    const initialLength = this.profiles.length;
    this.profiles = this.profiles.filter((p) => p.id !== id);

    if (this.profiles.length < initialLength) {
      this.saveProfiles();
      console.log(`🗑️  Deleted user profile: ${id}`);
      return true;
    }

    return false;
  }
}

export default new UserProfileService();
