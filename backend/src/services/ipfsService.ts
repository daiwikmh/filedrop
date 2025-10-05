import axios from 'axios';
import FormData from 'form-data';
import compressionService from './compressionService.js';

export interface UploadResult {
  cid: string;
  ipfsUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  isCompressed?: boolean;
  originalSize?: number;
  compressionRatio?: number;
}

class IPFSService {
  private pinataJwt: string | null = null;
  private initialized: boolean = false;

  constructor() {
    // Don't initialize here - wait for first use to ensure env vars are loaded
  }

  private initClient() {
    if (this.initialized) return;

    const pinataJwt = process.env.PINATA_JWT;

    if (!pinataJwt || pinataJwt === 'your_pinata_jwt_here') {
      console.warn('⚠️  PINATA_JWT not configured - IPFS uploads will fail');
      return;
    }

    this.pinataJwt = pinataJwt;
    this.initialized = true;
    console.log('✅ Pinata client initialized successfully');
  }

  async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string, enableCompression = true): Promise<UploadResult> {
    // Initialize on first use to ensure env vars are loaded
    if (!this.initialized) {
      this.initClient();
    }

    if (!this.pinataJwt) {
      throw new Error('Pinata JWT not initialized. Please set PINATA_JWT in .env');
    }

    try {
      let bufferToUpload = fileBuffer;
      let uploadFileName = fileName;
      let isCompressed = false;
      let originalSize = fileBuffer.length;
      let compressionRatio = 0;

      // Try to compress the file if enabled
      if (enableCompression) {
        const compressionResult = await compressionService.smartCompress(fileBuffer, mimeType);

        if (compressionResult) {
          bufferToUpload = compressionResult.compressedBuffer;
          uploadFileName = `${fileName}.gz`; // Add .gz extension
          isCompressed = true;
          compressionRatio = compressionResult.compressionRatio;
          console.log(`✅ File compressed: ${compressionResult.originalSize} → ${compressionResult.compressedSize} bytes (${compressionRatio.toFixed(2)}% saved)`);
        }
      }

      // Create FormData and append file
      const formData = new FormData();
      formData.append('file', bufferToUpload, {
        filename: uploadFileName,
        contentType: isCompressed ? 'application/gzip' : mimeType,
      });

      console.log(`📤 Uploading to IPFS: ${uploadFileName} (${bufferToUpload.length} bytes, ${(bufferToUpload.length / 1024 / 1024).toFixed(2)} MB)`);

      // Upload to IPFS via Pinata API with extended timeout for large files
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.pinataJwt}`,
            ...formData.getHeaders(),
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          timeout: 300000, // 5 minute timeout for large files
          onUploadProgress: (progressEvent) => {
            const percentCompleted = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            if (percentCompleted % 25 === 0) {
              console.log(`📊 Upload progress: ${percentCompleted}%`);
            }
          },
        }
      );

      console.log(`📥 Pinata response received:`, response.data);

      const cid = response.data.IpfsHash;

      if (!cid) {
        throw new Error('Failed to get IPFS hash from Pinata');
      }

      // Use Pinata's dedicated gateway for faster access
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;

      console.log(`✅ File uploaded to IPFS via Pinata: ${cid}${isCompressed ? ' (compressed)' : ''}`);

      return {
        cid,
        ipfsUrl,
        fileName: uploadFileName,
        fileSize: bufferToUpload.length,
        fileType: mimeType,
        isCompressed,
        originalSize: isCompressed ? originalSize : undefined,
        compressionRatio: isCompressed ? compressionRatio : undefined,
      };
    } catch (error: any) {
      console.error('❌ Error uploading to IPFS:', error);

      // Log detailed error information
      if (error.response) {
        console.error('Pinata API error response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      } else if (error.request) {
        console.error('No response received from Pinata:', error.message);
      } else {
        console.error('Error setting up request:', error.message);
      }

      throw new Error(`Failed to upload file to IPFS via Pinata: ${error.message}`);
    }
  }

  async downloadTelegramFile(fileUrl: string, botToken: string): Promise<Buffer> {
    try {
      const response = await axios.get(fileUrl, {
        responseType: 'arraybuffer',
        headers: {
          'Authorization': `Bearer ${botToken}`,
        },
      });
      return Buffer.from(response.data);
    } catch (error) {
      console.error('Error downloading Telegram file:', error);
      throw new Error('Failed to download file from Telegram');
    }
  }

  getGatewayUrl(cid: string, fileName: string): string {
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }

  // Alternative IPFS gateways
  getAlternativeUrls(cid: string, fileName: string) {
    return {
      pinata: `https://gateway.pinata.cloud/ipfs/${cid}`,
      ipfsIo: `https://ipfs.io/ipfs/${cid}`,
      cloudflare: `https://cloudflare-ipfs.com/ipfs/${cid}`,
      dweb: `https://dweb.link/ipfs/${cid}`,
    };
  }

  /**
   * Downloads and decompresses a file from IPFS if it was compressed
   * @param cid - The IPFS CID of the file
   * @param isCompressed - Whether the file is gzip compressed
   * @returns The file buffer (decompressed if needed)
   */
  async downloadAndDecompress(cid: string, isCompressed = false): Promise<Buffer> {
    try {
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;

      const response = await axios.get(ipfsUrl, {
        responseType: 'arraybuffer',
      });

      const fileBuffer = Buffer.from(response.data);

      if (isCompressed) {
        console.log('📂 Decompressing file from IPFS...');
        const decompressed = await compressionService.decompressFile(fileBuffer);
        return decompressed.decompressedBuffer;
      }

      return fileBuffer;
    } catch (error) {
      console.error('Error downloading/decompressing file from IPFS:', error);
      throw new Error('Failed to download file from IPFS');
    }
  }
}

export default new IPFSService();
