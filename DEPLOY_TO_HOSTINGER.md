# Deploy Your Website to Hostinger

## Current Situation

✅ **Database**: Already set up and active on Hostinger  
❌ **Website**: Still running locally, not deployed to Hostinger

## What You Need to Deploy

1. **Frontend** (React/Vite app) → Upload to Hostinger's `public_html`
2. **Backend** (Node.js/Express API) → Deploy to Hostinger's Node.js hosting or VPS

## Step 1: Build Your Frontend

```bash
cd frontend
npm run build
```

This creates a `dist` folder with production-ready files.

## Step 2: Build Your Backend

```bash
cd backend
npm run build
```

This creates a `dist` folder with compiled JavaScript.

## Step 3: Deploy to Hostinger

### Option A: Using Hostinger File Manager

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload to Hostinger:**
   - Go to Hostinger → **Files** → **File Manager**
   - Navigate to `public_html` (or your domain's root folder)
   - Upload all files from `frontend/dist/` folder
   - Make sure `index.html` is in the root

3. **Configure API URL:**
   - Create a `.env` file in the uploaded folder (if needed)
   - Or update `vite.config.ts` to use production API URL

### Option B: Using FTP/SFTP

1. **Get FTP credentials from Hostinger:**
   - Go to Hostinger → **Files** → **FTP Accounts**
   - Note your FTP host, username, and password

2. **Upload files:**
   ```bash
   # Build first
   cd frontend && npm run build
   
   # Then upload dist/ folder contents to public_html/
   ```

### Option C: Using Git (if available)

1. **Push to Git repository**
2. **Connect Hostinger to Git** (if Hostinger supports Git deployment)
3. **Auto-deploy on push**

## Step 4: Deploy Backend

### For Node.js Hosting on Hostinger:

1. **Upload backend files:**
   - Upload `backend/` folder to Hostinger
   - Or use Hostinger's Node.js hosting feature

2. **Set environment variables:**
   - In Hostinger → **Node.js** → **Environment Variables**
   - Add your `.env` variables:
     ```
     DATABASE_URL=mysql://u905810677_adminbrico:ALObricolage11@srv1657.hstgr.io:3306/u905810677_alobricolage
     PORT=5001
     NODE_ENV=production
     JWT_ACCESS_SECRET=your-production-secret
     JWT_REFRESH_SECRET=your-production-refresh-secret
     FRONTEND_URL=https://alobricolage.com
     ```

3. **Install dependencies and start:**
   ```bash
   cd backend
   npm install --production
   npm run build
   npm start
   ```

### For VPS Hosting:

1. **SSH into your VPS**
2. **Clone/upload your project**
3. **Install dependencies**
4. **Use PM2 or similar to run the server:**
   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name allo-bricolage-api
   pm2 save
   pm2 startup
   ```

## Step 5: Update Frontend API URL

After deploying backend, update frontend to point to production API:

1. **Create production `.env` in frontend:**
   ```env
   VITE_API_URL=https://api.alobricolage.com/api
   ```
   Or if backend is on same domain:
   ```env
   VITE_API_URL=https://alobricolage.com/api
   ```

2. **Rebuild frontend:**
   ```bash
   cd frontend
   npm run build
   ```

3. **Re-upload the new `dist/` folder**

## Step 6: Configure Domain

1. **Point domain to Hostinger:**
   - Update DNS settings if needed
   - Ensure domain points to Hostinger's servers

2. **SSL Certificate:**
   - Hostinger usually provides free SSL
   - Enable it in Hostinger → **Security** → **SSL**

## Quick Checklist

- [ ] Build frontend (`npm run build` in frontend/)
- [ ] Build backend (`npm run build` in backend/)
- [ ] Upload frontend `dist/` to `public_html/`
- [ ] Deploy backend (Node.js hosting or VPS)
- [ ] Set production environment variables
- [ ] Update frontend API URL to production
- [ ] Test website at `https://alobricolage.com`

## Need Help?

Check Hostinger's documentation for:
- Node.js hosting setup
- File upload methods
- Environment variables configuration
- Domain and DNS setup

