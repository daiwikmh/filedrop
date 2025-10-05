# Predict Backend Server - Docker Guide

Backend server for Predict app with Telegram bot integration, IPFS file storage, and compression layer.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start development server
npm run dev
```

### Production (Docker)

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Production (Render.com)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.ts                    # Main server entry point
│   ├── routes/
│   │   ├── telegramRoutes.ts       # Telegram API endpoints
│   │   └── filesRoutes.ts          # File management endpoints
│   ├── services/
│   │   ├── telegramService.ts      # Telegram bot logic
│   │   ├── ipfsService.ts          # IPFS/Pinata integration
│   │   ├── compressionService.ts   # File compression/decompression
│   │   └── fileStorageService.ts   # File metadata storage
│   └── examples/
│       └── compressionExample.ts   # Usage examples
├── data/
│   ├── files.json                  # File metadata (auto-created)
│   └── telegram_users.json         # User data (auto-created)
├── dist/                           # Built JavaScript (generated)
├── Dockerfile                      # Docker configuration
├── docker-compose.yml              # Local Docker setup
├── render.yaml                     # Render deployment config
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔧 Environment Variables

Create a `.env` file with these variables:

```env
# Server
PORT=3002
NODE_ENV=development

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather

# Pinata (IPFS)
PINATA_JWT=your_pinata_jwt_token
PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_api_secret
```

---

## 🐳 Docker Commands

### Build Image

```bash
docker build -t predict-backend .
```

### Run Container

```bash
docker run -d \
  -p 3002:3002 \
  -e TELEGRAM_BOT_TOKEN=your_token \
  -e PINATA_JWT=your_jwt \
  -v $(pwd)/data:/app/data \
  --name predict-backend \
  predict-backend
```

### View Logs

```bash
docker logs -f predict-backend
```

### Stop Container

```bash
docker stop predict-backend
docker rm predict-backend
```

---

## 📦 Compression Features

### Supported File Types

**Compressed:**
- PDF, Text, JSON/XML, HTML/CSS/JS
- Word documents (.docx)
- **MKV videos** (container overhead)

**Not Compressed:**
- JPEG/PNG, MP4/WebM, MP3/OGG, ZIP/RAR

---

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide for Render
- [COMPRESSION_GUIDE.md](../COMPRESSION_GUIDE.md) - Compression docs
- [TELEGRAM_INTEGRATION.md](../TELEGRAM_INTEGRATION.md) - Telegram bot docs

---

**Ready to deploy! 🎉**
