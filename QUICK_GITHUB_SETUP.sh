#!/bin/bash

# Quick GitHub Setup Script
# Run this after creating your GitHub repository

echo "🚀 Setting up GitHub for Allo Bricolage"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Run: git init"
    exit 1
fi

# Get GitHub repository URL
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/allo-bricolage.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ Repository URL is required"
    exit 1
fi

echo ""
echo "📦 Adding files to git..."
git add .

echo ""
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Allo Bricolage website"

echo ""
echo "🔗 Adding GitHub remote..."
git remote add origin "$REPO_URL" 2>/dev/null || git remote set-url origin "$REPO_URL"

echo ""
echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Done! Your code is now on GitHub!"
echo ""
echo "Next steps:"
echo "1. Set up auto-deployment in Hostinger (if available)"
echo "2. Or use GitHub Actions for automatic deployment"
echo "3. Update frontend API URL for production"

