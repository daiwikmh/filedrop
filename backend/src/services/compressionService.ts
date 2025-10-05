import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

interface CompressionResult {
  compressedBuffer: Buffer;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

interface DecompressionResult {
  decompressedBuffer: Buffer;
  originalSize: number;
}

class CompressionService {
  /**
   * Compresses a file buffer using gzip compression
   * @param fileBuffer - The original file buffer to compress
   * @returns CompressionResult with compressed buffer and compression stats
   */
  async compressFile(fileBuffer: Buffer): Promise<CompressionResult> {
    try {
      const originalSize = fileBuffer.length;

      // Compress using gzip
      const compressedBuffer = await gzipAsync(fileBuffer);
      const compressedSize = compressedBuffer.length;

      // Calculate compression ratio (percentage saved)
      const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

      console.log(`📦 Compression complete: ${originalSize} bytes → ${compressedSize} bytes (${compressionRatio.toFixed(2)}% reduction)`);

      return {
        compressedBuffer,
        originalSize,
        compressedSize,
        compressionRatio,
      };
    } catch (error) {
      console.error('Error compressing file:', error);
      throw new Error('Failed to compress file');
    }
  }

  /**
   * Decompresses a gzip-compressed file buffer
   * @param compressedBuffer - The compressed file buffer
   * @returns DecompressionResult with decompressed buffer
   */
  async decompressFile(compressedBuffer: Buffer): Promise<DecompressionResult> {
    try {
      const decompressedBuffer = await gunzipAsync(compressedBuffer);
      const originalSize = decompressedBuffer.length;

      console.log(`📂 Decompression complete: ${compressedBuffer.length} bytes → ${originalSize} bytes`);

      return {
        decompressedBuffer,
        originalSize,
      };
    } catch (error) {
      console.error('Error decompressing file:', error);
      throw new Error('Failed to decompress file. The file may be corrupted or not compressed.');
    }
  }

  /**
   * Determines if compression would be beneficial for the file
   * Some file types (images, videos, already compressed files) don't benefit from compression
   * @param mimeType - The MIME type of the file
   * @returns true if file should be compressed
   */
  shouldCompress(mimeType: string): boolean {
    // File types that are already compressed or don't compress well
    const skipCompressionTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',        // MP4 container is already optimized
      'video/mpeg',       // MPEG is already compressed
      'video/webm',       // WebM uses compressed codecs
      'audio/mp3',
      'audio/mpeg',
      'audio/ogg',
      'application/zip',
      'application/gzip',
      'application/x-gzip',
      'application/x-7z-compressed',
      'application/x-rar-compressed',
    ];

    // MKV (Matroska) is a container format that CAN benefit from compression
    // The container itself is not compressed, only the video/audio streams inside
    // So we SHOULD compress MKV files
    return !skipCompressionTypes.includes(mimeType.toLowerCase());
  }

  /**
   * Smart compression - only compresses if beneficial
   * @param fileBuffer - The file buffer to compress
   * @param mimeType - The MIME type of the file
   * @returns CompressionResult or null if compression was skipped
   */
  async smartCompress(fileBuffer: Buffer, mimeType: string): Promise<CompressionResult | null> {
    if (!this.shouldCompress(mimeType)) {
      console.log(`⏭️  Skipping compression for ${mimeType} (already compressed format)`);
      return null;
    }

    const result = await this.compressFile(fileBuffer);

    // If compression doesn't save at least 10%, skip it
    if (result.compressionRatio < 10) {
      console.log(`⏭️  Skipping compression (only ${result.compressionRatio.toFixed(2)}% reduction)`);
      return null;
    }

    return result;
  }
}

export default new CompressionService();
