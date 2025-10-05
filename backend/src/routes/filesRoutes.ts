import express, { Request, Response } from 'express';
import fileStorageService from '../services/fileStorageService.js';
import ipfsService from '../services/ipfsService.js';

const router = express.Router();

// Get all files
router.get('/', (req: Request, res: Response) => {
  const files = fileStorageService.getAllFiles();
  res.json({ files });
});

// Get files by user
router.get('/user/:telegramUserId', (req: Request, res: Response) => {
  const { telegramUserId } = req.params;
  const files = fileStorageService.getFilesByUser(Number(telegramUserId));
  res.json({ files });
});

// Get file by CID
router.get('/cid/:cid', (req: Request, res: Response) => {
  const { cid } = req.params;
  const file = fileStorageService.getFileByCID(cid);

  if (file) {
    res.json({ file });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Get file by ID
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const file = fileStorageService.getFileById(id);

  if (file) {
    res.json({ file });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Delete file
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const success = fileStorageService.deleteFile(id);

  if (success) {
    res.json({ success: true, message: 'File deleted successfully' });
  } else {
    res.status(404).json({ success: false, error: 'File not found' });
  }
});

// Get storage stats
router.get('/stats/all', (req: Request, res: Response) => {
  const stats = fileStorageService.getStats();
  res.json(stats);
});

// Serve file from IPFS (for viewing/displaying)
router.get('/serve/:cid', async (req: Request, res: Response) => {
  try {
    const { cid } = req.params;
    const file = fileStorageService.getFileByCID(cid);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Download file from IPFS (will decompress if compressed)
    const fileBuffer = await ipfsService.downloadAndDecompress(cid, file.isCompressed);

    // Set appropriate headers for inline viewing
    const fileName = file.isCompressed
      ? file.fileName.replace('.gz', '') // Remove .gz extension
      : file.fileName;

    res.setHeader('Content-Type', file.fileType);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    res.send(fileBuffer);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ error: 'Failed to serve file from IPFS' });
  }
});

// Download and decompress file from IPFS
router.get('/download/:cid', async (req: Request, res: Response) => {
  try {
    const { cid } = req.params;
    const file = fileStorageService.getFileByCID(cid);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Download file from IPFS (will decompress if compressed)
    const fileBuffer = await ipfsService.downloadAndDecompress(cid, file.isCompressed);

    // Set appropriate headers
    const fileName = file.isCompressed
      ? file.fileName.replace('.gz', '') // Remove .gz extension
      : file.fileName;

    res.setHeader('Content-Type', file.fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', fileBuffer.length);

    res.send(fileBuffer);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file from IPFS' });
  }
});

export default router;
