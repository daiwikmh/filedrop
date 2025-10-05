# Predict - AI-Powered Prediction Platform

A full-stack application that combines Telegram bot integration, AI analysis, and decentralized file storage to create an intelligent prediction and data management platform.

## Overview

**Predict** is a modern web application that enables users to interact with AI-powered predictions through multiple interfaces including a web dashboard and Telegram bot. The platform features intelligent file storage, AI-driven analysis, and seamless user profile management.

## Architecture

The project consists of two main components:

- **Backend** (`/backend`): Node.js/Express API server with Telegram bot integration
- **Client** (`/client`): React-based web dashboard with modern UI

## Features

### 🤖 AI-Powered Analysis
- Integrated AI analysis service using LangChain and OpenAI
- Intelligent file processing and categorization
- Real-time predictions and insights

### 📱 Telegram Integration
- Full-featured Telegram bot interface
- Seamless user authentication and profile management
- File upload and management through Telegram

### 🗄️ File Storage & Management
- Decentralized file storage with IPFS integration
- Intelligent compression service for optimized storage
- File categorization and searchable metadata

### 🌐 Modern Web Dashboard
- React-based UI with Tailwind CSS
- Real-time data visualization with Recharts
- Responsive design with Radix UI components
- Blockchain integration with MetaMask SDK and Wagmi

### 🔐 User Management
- User profile service with persistent storage
- Multi-platform authentication (Web + Telegram)
- Secure session management

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **AI/ML**: LangChain, OpenAI
- **Bot**: node-telegram-bot-api
- **Storage**: IPFS integration
- **Utilities**: Axios, UUID, dotenv

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI, Lucide Icons
- **State Management**: Zustand
- **Data Fetching**: TanStack Query, SWR
- **Blockchain**: Viem, Wagmi, MetaMask SDK
- **Visualization**: Recharts
- **Routing**: React Router DOM

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- Telegram Bot Token (for bot features)
- OpenAI API Key (for AI features)
- IPFS node or gateway access

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd predict
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

4. Configure environment variables:

Create a `.env` file in the backend directory:
```env
PORT=3002
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
OPENAI_API_KEY=your_openai_api_key
# Add other required environment variables
```

### Running the Application

**Development mode:**

Backend:
```bash
cd backend
npm run dev
```

Client:
```bash
cd client
npm run dev
```

**Production build:**

Backend:
```bash
cd backend
npm run build
npm start
```

Client:
```bash
cd client
npm run build
npm run preview
```

## API Endpoints

- `GET /health` - Health check endpoint
- `/api/telegram/*` - Telegram bot integration endpoints
- `/api/files/*` - File storage and retrieval endpoints
- `/api/users/*` - User management endpoints

## Project Structure

```
predict/
├── backend/
│   ├── src/
│   │   ├── index.ts           # Main server entry point
│   │   ├── routes/            # API route handlers
│   │   ├── services/          # Business logic services
│   │   └── examples/          # Example implementations
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions
│   │   ├── utils/             # Helper utilities
│   │   └── main.tsx           # Client entry point
│   └── package.json
└── README.md
```

## Documentation

Additional documentation files:
- `TELEGRAM_INTEGRATION.md` - Telegram bot setup and integration guide
- `FILECOIN_STORE_DOCS.md` - Detailed IPFS/Filecoin storage documentation
- `COMPRESSION_GUIDE.md` - File compression strategies and implementation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC
