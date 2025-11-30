# GitHub Setup and Deployment Guide

## Step 1: Create GitHub Repository

1. **Go to GitHub:**
   - Visit: https://github.com
   - Login or create account

2. **Create New Repository:**
   - Click **"+"** (top right) → **"New repository"**
   - Repository name: `allo-bricolage` (or your choice)
   - Description: "Allo Bricolage - Moroccan Maintenance Marketplace"
   - Choose: **Public** or **Private**
   - **DO NOT** initialize with README, .gitignore, or license
   - Click **"Create repository"**

3. **Copy the repository URL:**
   - You'll see: `https://github.com/YOUR_USERNAME/allo-bricolage.git`
   - Copy this URL

## Step 2: Initialize Git and Push to GitHub

### On Your Computer:

```bash
cd /Users/ilyasmoktary/Documents/foryou

# Initialize git (if not already)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Allo Bricolage website"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/allo-bricolage.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Set Up Automatic Deployment

### Option A: Hostinger Git Deployment (If Available)

1. **In Hostinger:**
   - Go to **Websites** → **alobricolage.com**
   - Look for **"Git"** or **"Version Control"** section
   - If available:
     - Connect your GitHub account
     - Select repository: `allo-bricolage`
     - Set branch: `main`
     - Set deployment path: `public_html/`
     - Enable auto-deploy

### Option B: GitHub Actions (Recommended)

1. **Create GitHub Actions workflow:**
   - In your GitHub repository
   - Click **"Actions"** tab
   - Click **"New workflow"**
   - Choose **"Node.js"** or create custom

2. **Create deployment workflow file:**
   - Create: `.github/workflows/deploy.yml`
   - This will auto-deploy on push

### Option C: Use GitHub Pages (For Frontend Only)

1. **In GitHub repository:**
   - Go to **Settings** → **Pages**
   - Source: **"Deploy from a branch"**
   - Branch: `main`
   - Folder: `/frontend/dist`
   - Save

2. **Your site will be at:**
   - `https://YOUR_USERNAME.github.io/allo-bricolage`

## Step 4: Configure for Production

### Update Frontend for GitHub Pages:

If using GitHub Pages, update `frontend/vite.config.ts`:

```typescript
export default defineConfig({
  base: '/allo-bricolage/', // Your repository name
  // ... rest of config
});
```

### Environment Variables:

**For GitHub Actions or Hostinger:**
- Set environment variables in deployment settings
- Never commit `.env` files to GitHub

## Step 5: Deploy Backend Separately

Backend needs to be deployed separately:

1. **Option A: Railway.app** (Free tier)
   - Connect GitHub repository
   - Select `backend/` folder
   - Set environment variables
   - Auto-deploys on push

2. **Option B: Render.com** (Free tier)
   - Connect GitHub
   - Select `backend/` folder
   - Set environment variables
   - Auto-deploys

3. **Option C: Hostinger VPS/Node.js**
   - SSH into server
   - Clone repository
   - Deploy backend folder

## Quick Commands Reference

```bash
# Initialize git
git init

# Add files
git add .

# Commit
git commit -m "Your message"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/allo-bricolage.git

# Push
git push -u origin main

# Future updates
git add .
git commit -m "Update message"
git push
```

## Benefits of GitHub

- ✅ Version control
- ✅ Backup of your code
- ✅ Easy collaboration
- ✅ Automatic deployments
- ✅ Rollback if needed

## Next Steps

1. Create GitHub repository
2. Push your code
3. Set up automatic deployment
4. Update frontend API URL to production backend
5. Your site will auto-update on every push!

