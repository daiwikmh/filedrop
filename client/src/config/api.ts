/**
 * API Configuration
 * Single source of truth for backend API URL
 */

// Backend API URL - Change this to switch between development and production
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://filedrop-l3vl.onrender.com';

// API Endpoints
export const API_ENDPOINTS = {
  // Telegram endpoints
  telegram: {
    generateToken: `${API_BASE_URL}/api/telegram/generate-token`,
    sendMessage: `${API_BASE_URL}/api/telegram/send-message`,
    broadcast: `${API_BASE_URL}/api/telegram/broadcast`,
    authorizedUsers: `${API_BASE_URL}/api/telegram/authorized-users`,
    checkAuth: (telegramId: number) => `${API_BASE_URL}/api/telegram/check-auth/${telegramId}`,
    autoAuth: `${API_BASE_URL}/api/telegram/auto-auth`,
    userByToken: (token: string) => `${API_BASE_URL}/api/telegram/user-by-token/${token}`,
  },

  // File endpoints
  files: {
    getAll: `${API_BASE_URL}/api/files`,
    getByUser: (telegramUserId: number) => `${API_BASE_URL}/api/files/user/${telegramUserId}`,
    getByCid: (cid: string) => `${API_BASE_URL}/api/files/cid/${cid}`,
    getById: (id: string) => `${API_BASE_URL}/api/files/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/files/${id}`,
    stats: `${API_BASE_URL}/api/files/stats/all`,
    serve: (cid: string) => `${API_BASE_URL}/api/files/serve/${cid}`,
    download: (cid: string) => `${API_BASE_URL}/api/files/download/${cid}`,
  },

  // User profile endpoints
  users: {
    getByWallet: (walletAddress: string) => `${API_BASE_URL}/api/users/profile/wallet/${walletAddress}`,
    getByTelegram: (telegramId: number) => `${API_BASE_URL}/api/users/profile/telegram/${telegramId}`,
    linkProfile: `${API_BASE_URL}/api/users/profile/link`,
    getAllProfiles: `${API_BASE_URL}/api/users/profiles`,
  },

  // Health check
  health: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;
