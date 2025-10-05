# 🚀 Backend Deployment Guide for Render

This guide will help you deploy the Predict backend to Render.com using Docker.

---

## 📋 Prerequisites

1. **GitHub Repository** - Your code must be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **Environment Variables** - Have your API keys ready:
   - `TELEGRAM_BOT_TOKEN` - From @BotFather
   - `PINATA_JWT` - From Pinata dashboard
   - `PINATA_API_KEY` - From Pinata dashboard
   - `PINATA_API_SECRET` - From Pinata dashboard

---

## 🐳 Deployment Methods

### Method 1: Using Render Dashboard (Recommended)

#### Step 1: Push Code to GitHub

```bash
cd /home/daiwi/projects/predict
git add backend/
git commit -m "Add backend Dockerfile and deployment config"
git push origin main
```

#### Step 2: Create New Web Service on Render

1. Go to [render.com/dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

   **Basic Settings:**
   - **Name:** `predict-backend`
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Docker`

   **Build Settings:**
   - **Dockerfile Path:** `./Dockerfile` (relative to root directory)

   **Instance Type:**
   - Free tier or Starter ($7/month)

#### Step 3: Set Environment Variables

In the Render dashboard, add these environment variables:

```
TELEGRAM_BOT_TOKEN=your_bot_token_here
PINATA_JWT=your_pinata_jwt_here
PINATA_API_KEY=your_pinata_api_key_here
PINATA_API_SECRET=your_pinata_secret_here
PORT=3002
NODE_ENV=production
```

#### Step 4: Add Persistent Disk (Important!)

1. Scroll to **"Disks"** section
2. Click **"Add Disk"**
3. Configure:
   - **Name:** `predict-data`
   - **Mount Path:** `/app/data`
   - **Size:** 1 GB (or more based on needs)

This ensures your Telegram user data and file metadata persist across deployments.

#### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy your app
3. Wait for build to complete (2-3 minutes)
4. Your backend will be available at: `https://predict-backend.onrender.com`

---

### Method 2: Using render.yaml Blueprint

#### Step 1: Update render.yaml

Edit `backend/render.yaml` and update the repository URL:

```yaml
repo: https://github.com/YOUR_USERNAME/predict
```

#### Step 2: Deploy via Blueprint

1. Go to [render.com/dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your repository
4. Select `backend/render.yaml`
5. Set environment variables when prompted
6. Click **"Apply"**

---

## 🔍 Verify Deployment

### Check Health Endpoint

```bash
curl https://your-app-name.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Predict backend server is running"
}
```

### Check Logs

1. Go to your service in Render dashboard
2. Click **"Logs"** tab
3. Look for:
   ```
   ✅ Telegram bot initialized successfully
   ✅ Pinata client initialized successfully
   📂 Loaded X files from storage
   🚀 Server is running on port 3002
   ```

### Test Telegram Bot

1. Open your Telegram bot: `@your_bot_name`
2. Send `/start`
3. You should receive a welcome message

### Test File Upload

1. Send a file to your Telegram bot
2. Check logs for upload confirmation
3. Visit frontend to see uploaded files

---

## 📁 File Structure

```
backend/
├── Dockerfile              # Docker build instructions
├── .dockerignore          # Files to exclude from Docker
├── render.yaml            # Render deployment config (optional)
├── DEPLOYMENT.md          # This file
├── package.json           # Node.js dependencies
├── tsconfig.json          # TypeScript config
├── src/
│   ├── index.ts           # Main server file
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── examples/          # Usage examples
└── data/                  # Persistent storage (created by Docker)
    ├── files.json         # File metadata
    └── telegram_users.json # User data
```

---

## 🔧 Dockerfile Explanation

```dockerfile
# Use Node.js 20 Alpine (lightweight)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Build TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm install -g typescript && \
    npm run build && \
    npm uninstall -g typescript

# Create data directory for persistence
RUN mkdir -p /app/data

# Expose port
EXPOSE 3002

# Start application
CMD ["npm", "start"]
```

**Key Features:**
- ✅ Uses Alpine Linux (smaller image)
- ✅ Production dependencies only
- ✅ Builds TypeScript during image build
- ✅ Creates data directory
- ✅ Optimized for fast startup

---

## 🌐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | ✅ | Your Telegram bot token from @BotFather |
| `PINATA_JWT` | ✅ | Pinata API JWT token |
| `PINATA_API_KEY` | ⚠️ | Pinata API key (optional if using JWT) |
| `PINATA_API_SECRET` | ⚠️ | Pinata API secret (optional if using JWT) |
| `PORT` | ❌ | Port to run server (default: 3002, Render sets automatically) |
| `NODE_ENV` | ❌ | Environment (default: production) |

---

## 💾 Persistent Storage

**Important:** Render's free tier containers are ephemeral. Without a persistent disk, your data will be lost on each deployment!

**What gets stored:**
- `data/files.json` - IPFS file metadata
- `data/telegram_users.json` - Authorized Telegram users

**To enable persistence:**
1. Add a disk in Render dashboard
2. Mount to `/app/data`
3. Minimum 1 GB recommended

**Alternative:** Use a database (PostgreSQL, MongoDB) for production deployments.

---

## 🐛 Troubleshooting

### Build Fails

**Issue:** `npm install` fails

**Solution:**
- Check `package.json` is valid
- Ensure all dependencies have compatible versions
- Check Render build logs for specific errors

---

### Bot Not Responding

**Issue:** Telegram bot doesn't respond to messages

**Solutions:**
1. Check environment variable `TELEGRAM_BOT_TOKEN` is set
2. Verify token is correct (test with `curl`)
3. Check logs for initialization errors:
   ```
   ✅ Telegram bot initialized successfully
   ```
4. Ensure webhook is not set (we use polling):
   ```bash
   curl https://api.telegram.org/bot<TOKEN>/deleteWebhook
   ```

---

### Files Not Uploading to IPFS

**Issue:** "Failed to upload file to IPFS"

**Solutions:**
1. Check `PINATA_JWT` is set correctly
2. Verify Pinata account has free space
3. Check logs for Pinata API errors
4. Test Pinata credentials:
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT" \
        https://api.pinata.cloud/data/testAuthentication
   ```

---

### Data Lost After Deployment

**Issue:** User data and files disappear after redeployment

**Solution:**
- Add a persistent disk mounted to `/app/data`
- Or migrate to a database solution

---

### Port Binding Error

**Issue:** `Error: listen EADDRINUSE: address already in use`

**Solution:**
- Render automatically sets the `PORT` environment variable
- Don't hardcode port 3002 in production
- Use: `const PORT = process.env.PORT || 3002;`

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Use Render's environment variables
2. **Use HTTPS only** - Render provides automatic SSL
3. **Rotate API keys regularly** - Update in Render dashboard
4. **Enable Render's built-in DDoS protection**
5. **Use secrets for sensitive data** - Don't log tokens

---

## 📊 Monitoring

### Check Application Health

```bash
# Health check
curl https://your-app.onrender.com/health

# Get file stats
curl https://your-app.onrender.com/api/files/stats/all

# Get authorized users
curl https://your-app.onrender.com/api/telegram/authorized-users
```

### Render Monitoring

1. **Metrics Tab** - CPU, memory, request count
2. **Logs Tab** - Real-time application logs
3. **Events Tab** - Deployment history

---

## 🚀 Production Optimizations

### 1. Use Starter Plan or Higher
- Better performance
- No spin-down delay
- More resources

### 2. Enable Autoscaling
```yaml
# In render.yaml
scaling:
  minInstances: 1
  maxInstances: 3
  targetCPUPercent: 70
```

### 3. Add Redis for Caching
```yaml
# In render.yaml
services:
  - type: redis
    name: predict-cache
    plan: starter
```

### 4. Use PostgreSQL for Data
```yaml
# In render.yaml
databases:
  - name: predict-db
    plan: starter
```

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render Docker Guide](https://render.com/docs/docker)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Render Persistent Disks](https://render.com/docs/disks)

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Dockerfile created
- [ ] .dockerignore created
- [ ] Environment variables prepared
- [ ] Render account created
- [ ] Web service created on Render
- [ ] Environment variables added
- [ ] Persistent disk added
- [ ] Deployment successful
- [ ] Health check passes
- [ ] Telegram bot responds
- [ ] File uploads work
- [ ] Frontend connected to backend

---

## 🎯 Next Steps

1. **Update Frontend** - Point frontend API calls to your Render URL
2. **Set Up Custom Domain** - Add your own domain in Render
3. **Enable Auto-Deploy** - Automatic deployments on git push
4. **Set Up Monitoring** - Use Render's built-in monitoring or integrate with tools like Sentry
5. **Backup Data** - Regularly backup your `/app/data` directory

---

## 🆘 Support

If you encounter issues:
1. Check Render logs first
2. Review this troubleshooting guide
3. Contact Render support (they're very responsive!)
4. Check Render community forums

---

**Your backend is now ready for production! 🎉**
