import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/config/api';

interface FileAsset {
  id: string;
  fileName: string;
  cid: string;
  telegramUserId: number;
  userName?: string;
  uploadedAt: string;
  fileType: string;
  fileSize: number;
  ipfsUrl: string;
  isCompressed?: boolean;
  originalSize?: number;
  compressionRatio?: number;
  // AI Analysis metadata
  aiAnalysis?: {
    description: string;
    tags: string[];
    category: string;
    safetyRating: 'safe' | 'questionable' | 'unsafe';
    confidence: number;
  };
}

export default function Assets() {
  const [assets, setAssets] = useState<FileAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchAssets();

    // Auto-refresh when user uploads files via Telegram
    const interval = setInterval(() => {
      fetchAssets();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.files.getAll);
      const data = await response.json();
      setAssets(data.files || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const query = searchQuery.toLowerCase();

    // Search in filename and CID
    const matchesBasic =
      asset.fileName.toLowerCase().includes(query) ||
      asset.cid.toLowerCase().includes(query);

    // Search in AI analysis data if available
    const matchesAI = asset.aiAnalysis ? (
      asset.aiAnalysis.description.toLowerCase().includes(query) ||
      asset.aiAnalysis.tags.some(tag => tag.toLowerCase().includes(query)) ||
      asset.aiAnalysis.category.toLowerCase().includes(query)
    ) : false;

    const matchesSearch = matchesBasic || matchesAI;

    const matchesType =
      filterType === 'all' || asset.fileType.startsWith(filterType);

    return matchesSearch && matchesType;
  });

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    return '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // Get the correct URL for viewing/downloading the file
  const getFileUrl = (asset: FileAsset) => {
    // Use backend serve endpoint to fetch and decompress files from IPFS
    return API_ENDPOINTS.files.serve(asset.cid);
  };

  // Get download URL (forces download instead of inline display)
  const getDownloadUrl = (asset: FileAsset) => {
    return API_ENDPOINTS.files.download(asset.cid);
  };

  // Get display filename (remove .gz extension for compressed files)
  const getDisplayFileName = (asset: FileAsset) => {
    if (asset.isCompressed && asset.fileName.endsWith('.gz')) {
      return asset.fileName.slice(0, -3); // Remove .gz extension
    }
    return asset.fileName;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">File Assets</h1>
        <p className="text-gray-600 mt-2">
          Browse all files uploaded via Telegram and stored on Filecoin/IPFS
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <Input
              placeholder="Search by filename, tags, description, or CID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
            >
              All
            </Button>
            <Button
              variant={filterType === 'image' ? 'default' : 'outline'}
              onClick={() => setFilterType('image')}
            >
              Images
            </Button>
            <Button
              variant={filterType === 'video' ? 'default' : 'outline'}
              onClick={() => setFilterType('video')}
            >
              Videos
            </Button>
            <Button
              variant={filterType === 'application' ? 'default' : 'outline'}
              onClick={() => setFilterType('application')}
            >
              Documents
            </Button>
          </div>
          <Button onClick={fetchAssets} variant="outline">
            🔄 Refresh
          </Button>
        </div>
      </Card>

      {/* Assets Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading assets...</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="text-6xl">📂</div>
            <h3 className="text-xl font-semibold">No files yet</h3>
            <p className="text-gray-600">
              Upload files via Telegram bot (@filecoinstore_bot) to see them here
            </p>
            <Button
              onClick={() => window.open('https://t.me/filecoinstore_bot', '_blank')}
              className="mt-4"
            >
              Open Telegram Bot
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="p-4 space-y-4">
              {/* Preview */}
              <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center overflow-hidden">
                {asset.fileType.startsWith('image/') ? (
                  <img
                    src={getFileUrl(asset)}
                    alt={getDisplayFileName(asset)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-6xl">{getFileTypeIcon(asset.fileType)}</div>
                )}
              </div>

              {/* File Info */}
              <div className="space-y-2">
                <h3 className="font-semibold truncate" title={getDisplayFileName(asset)}>
                  {getDisplayFileName(asset)}
                </h3>

                {/* AI Analysis Info */}
                {asset.aiAnalysis && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-700 line-clamp-2" title={asset.aiAnalysis.description}>
                      {asset.aiAnalysis.description}
                    </div>
                    {asset.aiAnalysis.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {asset.aiAnalysis.tags.slice(0, 5).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {asset.aiAnalysis.tags.length > 5 && (
                          <span className="px-2 py-0.5 text-xs text-gray-500">
                            +{asset.aiAnalysis.tags.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Category: {asset.aiAnalysis.category}
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-600 space-y-1">
                  <p>👤 {asset.userName || `User ${asset.telegramUserId}`}</p>
                  <p>📅 {formatDate(asset.uploadedAt)}</p>
                  <p>
                    💾 {formatFileSize(asset.originalSize || asset.fileSize)}
                    {asset.isCompressed && (
                      <span className="ml-2 text-green-600 font-medium">
                        📦 {asset.compressionRatio?.toFixed(1)}% saved
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* CID */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">IPFS CID</label>
                <div className="flex gap-2">
                  <Input
                    value={asset.cid}
                    readOnly
                    className="text-xs font-mono"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(asset.cid)}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(getFileUrl(asset), '_blank')}
                >
                  👁️ View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(getDownloadUrl(asset), '_blank')}
                >
                  📥 Download
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      <Card className="p-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <span className="text-sm text-gray-600">
            Showing {filteredAssets.length} of {assets.length} files
          </span>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>
              📁 Original: {formatFileSize(assets.reduce((acc, a) => acc + (a.originalSize || a.fileSize), 0))}
            </span>
            <span>
              💾 Stored: {formatFileSize(assets.reduce((acc, a) => acc + a.fileSize, 0))}
            </span>
            {assets.some(a => a.isCompressed) && (
              <span className="text-green-600 font-medium">
                💰 Saved: {formatFileSize(
                  assets.reduce((acc, a) => acc + ((a.originalSize || a.fileSize) - a.fileSize), 0)
                )}
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
