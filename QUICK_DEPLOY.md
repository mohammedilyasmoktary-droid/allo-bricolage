# Quick Deployment Guide - Make Your Website Live

## Why Your Website Isn't Live

Your website is currently **only running locally** on your computer:
- ✅ Database: Set up on Hostinger (working)
- ❌ Frontend: Running on `localhost:5173` (local only)
- ❌ Backend: Running on `localhost:5001` (local only)

To make it live, you need to **deploy** both to Hostinger.

## Quick Steps to Deploy

### 1. Build Your Frontend

```bash
cd /Users/ilyasmoktary/Documents/foryou/frontend
npm run build
```

This creates a `dist/` folder with production files.

### 2. Upload Frontend to Hostinger

**Option A: Via File Manager**
1. Go to Hostinger → **Files** → **File Manager**
2. Navigate to `public_html/` (or your domain root)
3. Upload ALL files from `frontend/dist/` folder
4. Make sure `index.html` is in the root

**Option B: Via FTP**
1. Get FTP credentials from Hostinger → **Files** → **FTP Accounts**
2. Use an FTP client (FileZilla, Cyberduck, etc.)
3. Connect and upload `frontend/dist/` contents to `public_html/`

### 3. Deploy Backend

**Check if Hostinger supports Node.js hosting:**
1. Go to Hostinger → **Websites** → **alobricolage.com**
2. Look for **"Node.js"** or **"Applications"** section
3. If available, upload your `backend/` folder there

**Or use VPS/SSH:**
1. SSH into your Hostinger server
2. Upload backend files
3. Run: `npm install --production && npm run build && npm start`

### 4. Update Environment Variables

In Hostinger, set these environment variables:
```
DATABASE_URL=mysql://u905810677_adminbrico:ALObricolage11@srv1657.hstgr.io:3306/u905810677_alobricolage
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://alobricolage.com
```

### 5. Update Frontend API URL

Before building, update `frontend/.env`:
```env
VITE_API_URL=https://api.alobricolage.com/api
```
Or if backend is on same domain:
```env
VITE_API_URL=https://alobricolage.com/api
```

Then rebuild:
```bash
cd frontend
npm run build
```

## What Hostinger Plan Do You Have?

- **Shared Hosting**: Upload frontend to `public_html/`, backend might need VPS
- **VPS**: Full control, can deploy both frontend and backend
- **Node.js Hosting**: Can deploy backend directly

## Need Help?

1. Check Hostinger → **Websites** → **alobricolage.com** → **Hosting Plan**
2. Look for deployment options (File Manager, Git, Node.js, etc.)
3. Contact Hostinger support if you need help with deployment

## Current Status

- ✅ Database: Active on Hostinger
- ✅ Local Development: Working
- ⏳ Production Deployment: Needs to be done

Once deployed, your website will be live at `https://alobricolage.com`!

