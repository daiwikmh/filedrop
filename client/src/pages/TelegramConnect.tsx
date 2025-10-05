import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { telegramApi, type TelegramUser } from '@/lib/telegramApi';
import { API_ENDPOINTS } from '@/config/api';
import { useAccount } from 'wagmi';

export default function TelegramConnect() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [authorizedUsers, setAuthorizedUsers] = useState<TelegramUser[]>([]);
  const [connectedUser, setConnectedUser] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [polling, setPolling] = useState(false);

  const handleBroadcast = async () => {
    if (!testMessage.trim()) return;

    setLoading(true);
    try {
      await telegramApi.broadcast(testMessage);
      setMessage('Message broadcasted to all authorized users!');
      setTestMessage('');
    } catch (error) {
      setMessage('Failed to send broadcast');
    } finally {
      setLoading(false);
    }
  };

  const handleGetUsers = async () => {
    setLoading(true);
    try {
      const data = await telegramApi.getAuthorizedUsers();
      setAuthorizedUsers(data.users);
      setMessage(`Found ${data.users.length} authorized users`);
    } catch (error) {
      setMessage('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };


  // Check connection status on page load
  const checkConnectionStatus = async () => {
    setCheckingStatus(true);
    try {
      // If wallet is connected, check if user profile exists
      if (address) {
        const response = await fetch(API_ENDPOINTS.users.getByWallet(address));
        if (response.ok) {
          const data = await response.json();
          if (data.profile && data.profile.telegramId) {
            setConnectedUser({
              id: data.profile.telegramId,
              first_name: data.profile.telegramFirstName,
              username: data.profile.telegramUsername,
            });
            setMessage(`✅ Wallet is linked to Telegram account!`);
            localStorage.setItem('wallet_telegram_linked', 'true');
            return;
          }
        }
      }

      // Fallback: Check if there's a stored token in localStorage
      const storedToken = localStorage.getItem('telegram_connection_token');
      if (storedToken) {
        const response = await fetch(API_ENDPOINTS.telegram.userByToken(storedToken));
        const data = await response.json();

        if (data.found && data.user) {
          setConnectedUser({
            id: data.user.telegramId,
            first_name: data.user.firstName,
            username: data.user.username,
          });
          setMessage('✅ Already connected to Telegram!');
        }
      }
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  // Poll for connection status after opening Telegram
  const startPolling = () => {
    setPolling(true);
    setMessage('⏳ Waiting for you to click "Start" in Telegram...');

    const pollInterval = setInterval(async () => {
      const storedToken = localStorage.getItem('telegram_connection_token');
      if (storedToken) {
        try {
          const response = await fetch(API_ENDPOINTS.telegram.userByToken(storedToken));
          const data = await response.json();

          if (data.found && data.user) {
            // Link telegram to wallet if wallet is connected
            if (address) {
              await fetch(API_ENDPOINTS.telegram.autoAuth, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: data.user.telegramId,
                  first_name: data.user.firstName,
                  username: data.user.username,
                  walletAddress: address,
                }),
              });
              localStorage.setItem('wallet_telegram_linked', 'true');
              setMessage(`🎉 Successfully connected Telegram to wallet ${address.slice(0, 6)}...${address.slice(-4)}!`);
            } else {
              setMessage(`🎉 Successfully connected! Hello ${data.user.firstName}!`);
            }

            setConnectedUser({
              id: data.user.telegramId,
              first_name: data.user.firstName,
              username: data.user.username,
            });
            setPolling(false);
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }
    }, 2000); // Check every 2 seconds

    // Stop polling after 60 seconds
    setTimeout(() => {
      clearInterval(pollInterval);
      setPolling(false);
      if (!connectedUser) {
        setMessage('⏱️ Connection timeout. Please click "Check Connection Status" if you connected.');
      }
    }, 60000);
  };

  // Check on mount and when wallet address changes
  useEffect(() => {
    checkConnectionStatus();
  }, [address]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Connect Telegram</h1>
        <p className="text-gray-600 mt-2">
          Connect your Telegram account to upload files to Filecoin/IPFS via @filecoinstore_bot
        </p>
      </div>

      {/* Wallet Status */}
      {address && (
        <Card className="p-4 bg-blue-50 border border-blue-200">
          <p className="text-blue-800 text-sm">
            💼 Wallet connected: <span className="font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
            <br />
            {connectedUser ? (
              <span className="text-green-700 font-medium">✅ Linked to Telegram</span>
            ) : (
              <span className="text-orange-700">⚠️ Not linked to Telegram yet</span>
            )}
          </p>
        </Card>
      )}

      {!address && (
        <Card className="p-4 bg-yellow-50 border border-yellow-200">
          <p className="text-yellow-800 text-sm">
            💡 Connect your wallet first to link it with your Telegram account
          </p>
        </Card>
      )}

      {/* Quick Connect */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Quick Connect (Recommended)</h2>
        <p className="text-sm text-gray-600">
          Click the button below to open Telegram and connect your account.
          {address && ' Your wallet will be automatically linked!'}
        </p>

        {connectedUser ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
            <p className="text-green-800 font-medium">
              ✅ Connected as {connectedUser.first_name}{' '}
              {connectedUser.username && `(@${connectedUser.username})`}
            </p>
            {address && localStorage.getItem('wallet_telegram_linked') === 'true' && (
              <p className="text-green-700 text-sm">
                🔗 Linked to wallet: {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={async () => {
                setLoading(true);
                try {
                  const data = await telegramApi.generateToken();
                  // Store token for later status checking
                  localStorage.setItem('telegram_connection_token', data.token);
                  // Open Telegram directly
                  window.open(`https://t.me/filecoinstore_bot?start=${data.token}`, '_blank');
                  // Start polling for connection
                  startPolling();
                } catch (error) {
                  setMessage('Failed to generate token');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || checkingStatus || polling}
              className="bg-[#0088cc] hover:bg-[#0077b3]"
            >
              {polling ? '⏳ Waiting for connection...' : '📱 Open Telegram & Connect'}
            </Button>
            <p className="text-xs text-gray-500">
              This will open Telegram and automatically start a chat with the bot
            </p>
            <Button
              onClick={checkConnectionStatus}
              variant="outline"
              size="sm"
              disabled={checkingStatus}
            >
              {checkingStatus ? 'Checking...' : '🔄 Check Connection Status'}
            </Button>
          </div>
        )}
      </Card>

      {/* How to Use */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">How to Upload Files</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center shrink-0">
              1
            </span>
            <p>Connect your Telegram account using the button above</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center shrink-0">
              2
            </span>
            <p>Send any file (image, video, document) to @filecoinstore_bot in Telegram</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center shrink-0">
              3
            </span>
            <p>Bot uploads file to Filecoin/IPFS and sends you the permanent link</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center shrink-0">
              4
            </span>
            <p>View all your uploaded files in the Assets page</p>
          </div>
        </div>
      </Card>

      {/* Test Area */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Test Your Connection</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium">Send Test Broadcast</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter test message..."
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
            />
            <Button onClick={handleBroadcast} disabled={loading || !testMessage.trim()}>
              Send
            </Button>
          </div>
        </div>

        <Button onClick={handleGetUsers} variant="outline" disabled={loading}>
          View Authorized Users
        </Button>

        {authorizedUsers.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Authorized Users:</p>
            <div className="space-y-2">
              {authorizedUsers.map((user) => (
                <div key={user.telegramId} className="p-3 bg-gray-50 rounded-lg text-sm">
                  <p>
                    <strong>{user.firstName || 'Unknown'}</strong>{' '}
                    {user.username && `(@${user.username})`}
                  </p>
                  <p className="text-gray-600">ID: {user.telegramId}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Status Message */}
      {message && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          {message}
        </div>
      )}
    </div>
  );
}
