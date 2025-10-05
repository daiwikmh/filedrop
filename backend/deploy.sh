#!/bin/bash

# Deployment script for backend updates

echo "🚀 Backend Deployment Script"
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the backend directory"
    exit 1
fi

# Build the project
echo "📦 Building TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Fix errors before deploying."
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Git operations
echo "📝 Preparing Git commit..."
cd ..

git add backend/

echo ""
echo "📋 Changes to be committed:"
git status backend/ --short

echo ""
read -p "Continue with commit? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter commit message: " commit_msg

    if [ -z "$commit_msg" ]; then
        commit_msg="Update backend with AI image analysis"
    fi

    git commit -m "$commit_msg"

    echo ""
    read -p "Push to remote? (y/n) " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push origin main

        echo ""
        echo "✅ Deployment complete!"
        echo ""
        echo "📌 Next steps:"
        echo "1. Go to Render Dashboard: https://dashboard.render.com"
        echo "2. Add environment variable: OPENROUTER_API_KEY"
        echo "3. Wait for auto-deploy to complete (~3-5 min)"
        echo "4. Check logs for: ✅ AI Analysis service initialized"
        echo ""
    else
        echo "Deployment cancelled."
    fi
else
    echo "Deployment cancelled."
fi
