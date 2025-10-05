/**
 * Compression Service Usage Examples
 *
 * This file demonstrates how to use the compression layer for IPFS uploads
 */

import ipfsService from '../services/ipfsService.js';
import compressionService from '../services/compressionService.js';
import fs from 'fs';
import path from 'path';

// ============================================
// Example 1: Compress a file before upload
// ============================================
export async function compressAndUploadExample(filePath: string) {
  try {
    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const mimeType = 'application/pdf'; // or detect from file

    console.log(`📁 Original file: ${fileName}`);
    console.log(`📊 Original size: ${fileBuffer.length} bytes`);

    // The IPFS service now automatically compresses files
    // Compression is enabled by default
    const result = await ipfsService.uploadFile(fileBuffer, fileName, mimeType);

    console.log('\n✅ Upload complete:');
    console.log(`🔗 CID: ${result.cid}`);
    console.log(`🌐 IPFS URL: ${result.ipfsUrl}`);

    if (result.isCompressed) {
      console.log(`📦 Compressed: ${result.originalSize} → ${result.fileSize} bytes`);
      console.log(`💾 Space saved: ${result.compressionRatio?.toFixed(2)}%`);
    } else {
      console.log('⏭️  File was not compressed (already compressed format)');
    }

    return result;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// ============================================
// Example 2: Upload without compression
// ============================================
export async function uploadWithoutCompressionExample(filePath: string) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const mimeType = 'application/pdf';

    // Disable compression by passing false as 4th parameter
    const result = await ipfsService.uploadFile(
      fileBuffer,
      fileName,
      mimeType,
      false // Disable compression
    );

    console.log(`✅ Uploaded without compression: ${result.cid}`);
    return result;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// ============================================
// Example 3: Download and decompress a file
// ============================================
export async function downloadAndDecompressExample(cid: string, isCompressed = true) {
  try {
    console.log(`📥 Downloading from IPFS: ${cid}`);

    // Download and automatically decompress if needed
    const fileBuffer = await ipfsService.downloadAndDecompress(cid, isCompressed);

    console.log(`✅ Downloaded: ${fileBuffer.length} bytes`);

    // Save to disk
    const outputPath = path.join(process.cwd(), 'downloads', `file_${cid.substring(0, 8)}`);
    fs.writeFileSync(outputPath, fileBuffer);

    console.log(`💾 Saved to: ${outputPath}`);

    return fileBuffer;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// ============================================
// Example 4: Manual compression (advanced)
// ============================================
export async function manualCompressionExample() {
  try {
    const fileBuffer = Buffer.from('This is a test file with some text content...');
    const mimeType = 'text/plain';

    // Check if file should be compressed
    const shouldCompress = compressionService.shouldCompress(mimeType);
    console.log(`Should compress ${mimeType}? ${shouldCompress}`);

    if (shouldCompress) {
      // Manually compress
      const compressResult = await compressionService.compressFile(fileBuffer);

      console.log('Compression results:');
      console.log(`  Original: ${compressResult.originalSize} bytes`);
      console.log(`  Compressed: ${compressResult.compressedSize} bytes`);
      console.log(`  Ratio: ${compressResult.compressionRatio.toFixed(2)}%`);

      // Later, decompress
      const decompressResult = await compressionService.decompressFile(
        compressResult.compressedBuffer
      );

      console.log(`Decompressed: ${decompressResult.originalSize} bytes`);

      // Verify data integrity
      const isIdentical = Buffer.compare(fileBuffer, decompressResult.decompressedBuffer) === 0;
      console.log(`Data integrity check: ${isIdentical ? '✅ PASS' : '❌ FAIL'}`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// ============================================
// Example 5: Smart compression (recommended)
// ============================================
export async function smartCompressionExample(fileBuffer: Buffer, mimeType: string) {
  try {
    console.log(`\n🔍 Testing smart compression for ${mimeType}`);

    // Smart compress only compresses if beneficial (>10% reduction)
    const result = await compressionService.smartCompress(fileBuffer, mimeType);

    if (result) {
      console.log('✅ Compression applied:');
      console.log(`  ${result.originalSize} → ${result.compressedSize} bytes`);
      console.log(`  Saved: ${result.compressionRatio.toFixed(2)}%`);
      return result.compressedBuffer;
    } else {
      console.log('⏭️  Compression skipped (not beneficial)');
      return fileBuffer;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// ============================================
// Example 6: File type compression matrix
// ============================================
export function demonstrateFileTypeCompression() {
  const testFileTypes = [
    'text/plain',
    'application/json',
    'application/pdf',
    'text/html',
    'text/css',
    'application/javascript',
    'image/jpeg',
    'image/png',
    'video/mp4',
    'audio/mp3',
    'application/zip',
  ];

  console.log('\n📊 File Type Compression Matrix:');
  console.log('─'.repeat(50));

  testFileTypes.forEach((mimeType) => {
    const shouldCompress = compressionService.shouldCompress(mimeType);
    const icon = shouldCompress ? '✅ COMPRESS' : '⏭️  SKIP';
    console.log(`${icon.padEnd(15)} ${mimeType}`);
  });

  console.log('─'.repeat(50));
}

// ============================================
// Running examples
// ============================================
if (require.main === module) {
  (async () => {
    try {
      console.log('🚀 Compression Service Examples\n');

      // Example 6: Show which file types get compressed
      demonstrateFileTypeCompression();

      // You can run other examples by uncommenting:
      // await compressAndUploadExample('./test.pdf');
      // await downloadAndDecompressExample('QmYourCID', true);
      // await manualCompressionExample();

      console.log('\n✅ All examples completed!');
    } catch (error) {
      console.error('❌ Example failed:', error);
    }
  })();
}

/**
 * USAGE IN YOUR TELEGRAM BOT:
 *
 * The compression is now automatic! When you upload files via the Telegram bot,
 * compression happens automatically for suitable file types.
 *
 * In telegramService.ts handleFileUpload:
 *
 * ```typescript
 * // Upload to IPFS (compression happens automatically)
 * const uploadResult = await ipfsService.uploadFile(fileBuffer, fileName, mimeType);
 *
 * // Save with compression metadata
 * const fileMetadata = fileStorageService.addFile({
 *   fileName: uploadResult.fileName,
 *   cid: uploadResult.cid,
 *   telegramUserId: userId,
 *   userName: user?.firstName,
 *   fileType: uploadResult.fileType,
 *   fileSize: uploadResult.fileSize,
 *   ipfsUrl: uploadResult.ipfsUrl,
 *   isCompressed: uploadResult.isCompressed,
 *   originalSize: uploadResult.originalSize,
 *   compressionRatio: uploadResult.compressionRatio,
 * });
 * ```
 *
 * To download and decompress:
 *
 * ```typescript
 * // GET /api/files/download/:cid
 * const fileBuffer = await ipfsService.downloadAndDecompress(cid, file.isCompressed);
 * res.send(fileBuffer); // User gets original decompressed file
 * ```
 */
