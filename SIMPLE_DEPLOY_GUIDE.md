# Simple Deployment Guide - Make Your Website Live

## ✅ What's Ready

- ✅ Frontend built: `frontend/dist/` folder exists
- ✅ Database: Active on Hostinger
- ✅ Files ready to upload

## 🚀 Quick Deployment Steps

### Step 1: Update Frontend API URL

Before uploading, update the API URL for production:

1. **Edit `frontend/.env`:**
   ```env
   VITE_API_URL=https://alobricolage.com/api
   ```

2. **Rebuild:**
   ```bash
   cd /Users/ilyasmoktary/Documents/foryou/frontend
   npm run build
   ```

### Step 2: Upload Frontend to Hostinger

**Using File Manager (Easiest):**

1. **Login to Hostinger:**
   - Go to https://hpanel.hostinger.com
   - Login with your credentials

2. **Open File Manager:**
   - Click **"Websites"** → **"alobricolage.com"**
   - Click **"Files"** → **"File Manager"**

3. **Navigate to public_html:**
   - Click on **"public_html"** folder
   - This is where your website files go

4. **Upload Files:**
   - Click **"Upload"** button (top toolbar)
   - Select ALL files from: `/Users/ilyasmoktary/Documents/foryou/frontend/dist/`
   - Wait for upload to complete
   - **Important:** Make sure `index.html` is directly in `public_html/`

5. **Verify Upload:**
   - You should see `index.html` in `public_html/`
   - You should see `assets/` folder with JavaScript files

### Step 3: Test Your Website

1. **Visit:** `https://alobricolage.com`
2. **Check if it loads:**
   - If you see your website → ✅ Frontend is working!
   - If you see errors → Check browser console (F12)

### Step 4: Deploy Backend (Required for Full Functionality)

Your backend needs to run somewhere. Options:

**Option A: Check if Hostinger has Node.js Hosting**

1. In Hostinger → **Websites** → **alobricolage.com**
2. Look for **"Node.js"** or **"Applications"** section
3. If available, create a Node.js app and upload your `backend/` folder

**Option B: Use a Backend Hosting Service**

- **Railway** (railway.app) - Free tier available
- **Render** (render.com) - Free tier available  
- **Heroku** - Paid
- **DigitalOcean App Platform** - Paid

**Option C: Use VPS**

If you have VPS access, SSH in and deploy there.

## 📋 Quick Checklist

- [ ] Update `frontend/.env` with production API URL
- [ ] Rebuild frontend (`npm run build`)
- [ ] Upload `frontend/dist/` files to `public_html/`
- [ ] Test website at `https://alobricolage.com`
- [ ] Deploy backend (choose one option above)
- [ ] Configure backend environment variables
- [ ] Test full functionality (login, registration, etc.)

## 🔧 What to Upload

**From `frontend/dist/` folder, upload:**
- `index.html` (must be in root)
- `assets/` folder (contains JavaScript and CSS)
- Any other files/folders in `dist/`

**Do NOT upload:**
- `node_modules/`
- Source files (`src/`)
- Configuration files (`.env`, `package.json`, etc.)

## ⚠️ Important Notes

1. **Backend is Required:**
   - Frontend alone won't work fully
   - You need backend for API calls (login, data, etc.)
   - Database is ready, but backend must connect to it

2. **API URL:**
   - If backend is on same domain: `https://alobricolage.com/api`
   - If backend is on subdomain: `https://api.alobricolage.com/api`
   - If backend is on different service: Use that URL

3. **SSL Certificate:**
   - Hostinger usually provides free SSL
   - Make sure it's enabled in Hostinger → Security → SSL

## 🆘 Need Help?

**If frontend doesn't load:**
- Check if `index.html` is in `public_html/` root
- Check file permissions
- Clear browser cache (Cmd+Shift+R)

**If you see API errors:**
- Backend is not deployed yet
- Deploy backend first (Step 4)

**If you need help with backend deployment:**
- Tell me which option you want to use
- I can guide you through specific steps

