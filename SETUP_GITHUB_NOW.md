# Set Up GitHub - Step by Step

## Step 1: Configure Git (If Not Done)

Run these commands:

```bash
cd /Users/ilyasmoktary/Documents/foryou

# Set your name (replace with your name)
git config user.name "Your Name"

# Set your email (replace with your GitHub email)
git config user.email "your-email@example.com"
```

## Step 2: Create GitHub Repository

1. **Go to GitHub:**
   - Visit: https://github.com
   - Login (or create account if needed)

2. **Create New Repository:**
   - Click the **"+"** icon (top right)
   - Click **"New repository"**
   - Repository name: `allo-bricolage`
   - Description: "Allo Bricolage - Moroccan Maintenance Marketplace"
   - Choose: **Public** or **Private**
   - **DO NOT** check "Initialize with README"
   - Click **"Create repository"**

3. **Copy Repository URL:**
   - You'll see: `https://github.com/YOUR_USERNAME/allo-bricolage.git`
   - **Copy this URL** (you'll need it)

## Step 3: Push Your Code to GitHub

Run these commands in your terminal:

```bash
cd /Users/ilyasmoktary/Documents/foryou

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

**Note:** You'll be asked for your GitHub username and password (or token).

## Step 4: Set Up Auto-Deployment

### Option A: Hostinger Git Integration

1. **In Hostinger:**
   - Go to **Websites** → **alobricolage.com**
   - Look for **"Git"** or **"Version Control"** section
   - If available:
     - Connect GitHub account
     - Select repository: `allo-bricolage`
     - Set branch: `main`
     - Set deployment folder: `public_html/`
     - Enable auto-deploy

### Option B: GitHub Actions (Auto-Deploy)

I can create a GitHub Actions workflow that automatically deploys to Hostinger when you push code.

### Option C: Manual Deployment

After pushing to GitHub:
1. Pull latest code on Hostinger (via SSH or File Manager)
2. Rebuild and restart

## Step 5: Update Frontend API URL

Before deploying, make sure `frontend/.env` has production API URL:

```env
VITE_API_URL=https://alobricolage.com/api
```

Then rebuild:
```bash
cd frontend
npm run build
```

## Benefits

- ✅ Code backup on GitHub
- ✅ Version control (see all changes)
- ✅ Easy updates (just push to GitHub)
- ✅ Automatic deployment (if configured)
- ✅ Collaboration ready

## Future Updates

After setup, to update your website:

```bash
# Make changes to your code
# Then:
git add .
git commit -m "Description of changes"
git push
```

If auto-deploy is set up, your website updates automatically!

## Need Help?

Tell me:
1. Your GitHub username
2. If you want me to create the GitHub Actions workflow
3. If you need help with Hostinger Git integration

