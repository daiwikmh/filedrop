import { API_ENDPOINTS } from '@/config/api';

export interface TelegramUser {
  telegramId: number;
  username?: string;
  firstName?: string;
  authToken: string;
  authorized: boolean;
}

export const telegramApi = {
  // Generate auth token for connecting Telegram
  async generateToken(): Promise<{ token: string; message: string }> {
    const response = await fetch(API_ENDPOINTS.telegram.generateToken);
    if (!response.ok) throw new Error('Failed to generate token');
    return response.json();
  },

  // Send message to specific Telegram user
  async sendMessage(telegramId: number, message: string): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(API_ENDPOINTS.telegram.sendMessage, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramId, message }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  // Broadcast message to all authorized users
  async broadcast(message: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(API_ENDPOINTS.telegram.broadcast, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error('Failed to broadcast message');
    return response.json();
  },

  // Get all authorized users
  async getAuthorizedUsers(): Promise<{ users: TelegramUser[] }> {
    const response = await fetch(API_ENDPOINTS.telegram.authorizedUsers);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  // Check if user is authorized
  async checkAuth(telegramId: number): Promise<{ isAuthorized: boolean }> {
    const response = await fetch(API_ENDPOINTS.telegram.checkAuth(telegramId));
    if (!response.ok) throw new Error('Failed to check authorization');
    return response.json();
  },
};
