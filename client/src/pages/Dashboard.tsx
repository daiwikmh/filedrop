import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { API_ENDPOINTS } from '@/config/api';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });

  const [storageStats, setStorageStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    fileTypes: {} as Record<string, number>,
  });

  const [userFiles, setUserFiles] = useState<any[]>([]);

  useEffect(() => {
    fetchStorageStats();
  }, []);

  const fetchStorageStats = async () => {
    try {
      const [statsRes, filesRes] = await Promise.all([
        fetch(API_ENDPOINTS.files.stats),
        fetch(API_ENDPOINTS.files.getAll),
      ]);

      const stats = await statsRes.json();
      const filesData = await filesRes.json();

      setStorageStats(stats);
      setUserFiles(filesData.files || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const filBalance = balance ? formatEther(balance.value) : '0';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage your assets and storage on Filecoin network
        </p>
      </div>

      {/* Wallet Connection Status */}
      {!isConnected ? (
        <Card className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600">
            Connect your Filecoin wallet from the sidebar to view your assets
          </p>
        </Card>
      ) : (
        <>
          {/* Asset Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* FIL Balance */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">FIL Balance</p>
                  <p className="text-3xl font-bold mt-2">
                    {parseFloat(filBalance).toFixed(4)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Filecoin</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💎</span>
                </div>
              </div>
            </Card>

            {/* USDFE Balance (Mock - replace with actual token contract) */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">USDFE Balance</p>
                  <p className="text-3xl font-bold mt-2">0.00</p>
                  <p className="text-xs text-gray-500 mt-1">USD on Filecoin</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💵</span>
                </div>
              </div>
            </Card>

            {/* Network */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Network</p>
                  <p className="text-2xl font-bold mt-2">Calibration</p>
                  <p className="text-xs text-gray-500 mt-1">Filecoin Testnet</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🌐</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Wallet Address */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Connected Address</p>
                <p className="font-mono text-sm px-3 py-2 rounded">
                  {address}
                </p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(address || '')}
                className="px-4 py-2 hover:bg-gray-200 rounded-md text-sm"
              >
                Copy
              </button>
            </div>
          </Card>

          {/* Storage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Files</p>
                  <p className="text-3xl font-bold mt-2">{storageStats.totalFiles}</p>
                  <p className="text-xs text-gray-500 mt-1">Stored on IPFS</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📁</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Storage Used</p>
                  <p className="text-3xl font-bold mt-2">
                    {formatBytes(storageStats.totalSize).split(' ')[0]}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatBytes(storageStats.totalSize).split(' ')[1]}
                  </p>
                </div>
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💾</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">File Types</p>
                  <p className="text-3xl font-bold mt-2">
                    {Object.keys(storageStats.fileTypes).length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Different formats</p>
                </div>
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </Card>
          </div>

          {/* File Type Breakdown */}
          {Object.keys(storageStats.fileTypes).length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Storage Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(storageStats.fileTypes).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {type === 'image' && '🖼️'}
                        {type === 'video' && '🎥'}
                        {type === 'audio' && '🎵'}
                        {type === 'application' && '📄'}
                        {!['image', 'video', 'audio', 'application'].includes(type) && '📁'}
                      </span>
                      <span className="capitalize font-medium">{type}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">{count} files</span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${(count / storageStats.totalFiles) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-12 text-right">
                        {Math.round((count / storageStats.totalFiles) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recent Files */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Files</h3>
              <button
                onClick={() => (window.location.href = '/')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All →
              </button>
            </div>
            <div className="space-y-2">
              {userFiles.slice(0, 5).map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {file.fileType.startsWith('image/') && '🖼️'}
                      {file.fileType.startsWith('video/') && '🎥'}
                      {file.fileType.startsWith('audio/') && '🎵'}
                      {file.fileType.includes('pdf') && '📄'}
                      {!file.fileType.match(/image|video|audio|pdf/) && '📁'}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{file.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {formatBytes(file.fileSize)}
                    </p>
                    <button
                      onClick={() => window.open(file.ipfsUrl, '_blank')}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View IPFS
                    </button>
                  </div>
                </div>
              ))}
              {userFiles.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No files uploaded yet. Send files to @filecoinstore_bot to get started!
                </p>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
