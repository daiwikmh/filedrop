import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface FileMetadata {
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

class FileStorageService {
  private storageFile = path.join(process.cwd(), 'data', 'files.json');
  private files: FileMetadata[] = [];

  constructor() {
    this.ensureDataDir();
    this.loadFiles();
  }

  private ensureDataDir() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  private loadFiles() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const data = fs.readFileSync(this.storageFile, 'utf-8');
        this.files = JSON.parse(data);
        console.log(`📂 Loaded ${this.files.length} files from storage`);
      }
    } catch (error) {
      console.error('Error loading files:', error);
      this.files = [];
    }
  }

  private saveFiles() {
    try {
      fs.writeFileSync(this.storageFile, JSON.stringify(this.files, null, 2));
    } catch (error) {
      console.error('Error saving files:', error);
    }
  }

  addFile(metadata: Omit<FileMetadata, 'id' | 'uploadedAt'>): FileMetadata {
    const fileData: FileMetadata = {
      id: uuidv4(),
      ...metadata,
      uploadedAt: new Date().toISOString(),
    };

    this.files.push(fileData);
    this.saveFiles();

    console.log(`✅ File saved: ${fileData.fileName} (${fileData.cid})`);
    return fileData;
  }

  getAllFiles(): FileMetadata[] {
    return this.files;
  }

  getFilesByUser(telegramUserId: number): FileMetadata[] {
    return this.files.filter((f) => f.telegramUserId === telegramUserId);
  }

  getFileByCID(cid: string): FileMetadata | undefined {
    return this.files.find((f) => f.cid === cid);
  }

  getFileById(id: string): FileMetadata | undefined {
    return this.files.find((f) => f.id === id);
  }

  deleteFile(id: string): boolean {
    const initialLength = this.files.length;
    this.files = this.files.filter((f) => f.id !== id);

    if (this.files.length < initialLength) {
      this.saveFiles();
      console.log(`🗑️  File deleted: ${id}`);
      return true;
    }

    return false;
  }

  getStats() {
    return {
      totalFiles: this.files.length,
      totalSize: this.files.reduce((acc, f) => acc + f.fileSize, 0),
      fileTypes: this.files.reduce((acc, f) => {
        const type = f.fileType.split('/')[0];
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

export default new FileStorageService();
