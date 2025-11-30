# Step-by-Step Deployment Guide to Hostinger

## Prerequisites Checklist

- [x] Database configured on Hostinger
- [x] Frontend built (`frontend/dist/` folder exists)
- [ ] Backend built (`backend/dist/` folder exists)
- [ ] Files uploaded to Hostinger
- [ ] Environment variables configured
- [ ] Website tested

## Step 1: Build Backend for Production

```bash
cd /Users/ilyasmoktary/Documents/foryou/backend
npm run build
```

This creates a `dist/` folder with compiled JavaScript.

## Step 2: Prepare Frontend for Production

### Update API URL for Production

1. **Edit `frontend/.env`:**
   ```env
   VITE_API_URL=https://alobricolage.com/api
   ```
   Or if your backend is on a subdomain:
   ```env
   VITE_API_URL=https://api.alobricolage.com/api
   ```

2. **Rebuild frontend:**
   ```bash
   cd /Users/ilyasmoktary/Documents/foryou/frontend
   npm run build
   ```

## Step 3: Upload Frontend to Hostinger

### Method A: Using File Manager (Easiest)

1. **Go to Hostinger Control Panel:**
   - Login to Hostinger
   - Go to **Websites** → **alobricolage.com** → **Files** → **File Manager**

2. **Navigate to public_html:**
   - Click on `public_html` folder (this is your website root)

3. **Upload files:**
   - Click **"Upload"** button
   - Select ALL files from `frontend/dist/` folder
   - Wait for upload to complete
   - Make sure `index.html` is in the root of `public_html`

4. **Verify:**
   - Check that `index.html` exists in `public_html/`
   - Check that `assets/` folder exists with JavaScript files

### Method B: Using FTP

1. **Get FTP credentials:**
   - Hostinger → **Files** → **FTP Accounts**
   - Note: Host, Username, Password

2. **Use FTP client:**
   - Download FileZilla (free) or use Cyberduck
   - Connect using your FTP credentials
   - Navigate to `public_html/`
   - Upload all files from `frontend/dist/`

## Step 4: Deploy Backend

### Check Your Hosting Plan

First, check what type of hosting you have:

1. **Go to Hostinger → Websites → alobricolage.com → Hosting Plan**
2. **Look for:**
   - **Shared Hosting**: Limited Node.js support
   - **VPS**: Full control, can run Node.js
   - **Node.js Hosting**: Direct Node.js support

### Option A: Node.js Hosting (If Available)

1. **Go to Hostinger → Websites → alobricolage.com**
2. **Look for "Node.js" or "Applications" section**
3. **Create new Node.js app:**
   - App name: `allo-bricolage-api`
   - Upload `backend/` folder
   - Set entry point: `dist/server.js`
   - Set Node version: `18` or `20`

4. **Set Environment Variables:**
   ```
   DATABASE_URL=mysql://u905810677_adminbrico:ALObricolage11@srv1657.hstgr.io:3306/u905810677_alobricolage
   NODE_ENV=production
   PORT=5001
   JWT_ACCESS_SECRET=your-production-secret-key
   JWT_REFRESH_SECRET=your-production-refresh-secret
   FRONTEND_URL=https://alobricolage.com
   ```

5. **Start the application**

### Option B: VPS Hosting

1. **SSH into your VPS:**
   ```bash
   ssh your-username@your-vps-ip
   ```

2. **Upload backend files:**
   - Use SCP or SFTP to upload `backend/` folder
   - Or clone from Git if you have a repository

3. **Install dependencies:**
   ```bash
   cd backend
   npm install --production
   npm run build
   ```

4. **Install PM2 (Process Manager):**
   ```bash
   npm install -g pm2
   ```

5. **Start the server:**
   ```bash
   pm2 start dist/server.js --name allo-bricolage-api
   pm2 save
   pm2 startup
   ```

### Option C: Shared Hosting (Limited)

If you only have shared hosting:
- Backend might need to be on a separate VPS
- Or use a service like Railway, Render, or Heroku for backend
- Update frontend API URL to point to backend URL

## Step 5: Configure Domain and SSL

1. **Check Domain Settings:**
   - Hostinger → **Domains** → **alobricolage.com**
   - Ensure domain points to correct server

2. **Enable SSL:**
   - Hostinger → **Security** → **SSL**
   - Enable free SSL certificate
   - Wait for activation (usually automatic)

## Step 6: Test Your Website

1. **Visit your website:**
   - Go to `https://alobricolage.com`
   - Check if frontend loads

2. **Test API connection:**
   - Open browser console (F12)
   - Check for API errors
   - Test login/registration

3. **Verify database connection:**
   - Try creating an account
   - Check if data saves to database

## Troubleshooting

### Frontend not loading:
- Check if `index.html` is in `public_html/` root
- Check file permissions
- Clear browser cache

### API errors:
- Verify backend is running
- Check CORS settings in backend
- Verify API URL in frontend `.env`

### Database connection errors:
- Verify `DATABASE_URL` in backend environment variables
- Check if remote MySQL access is enabled
- Test connection from backend server

## Quick Commands Reference

```bash
# Build frontend
cd frontend && npm run build

# Build backend
cd backend && npm run build

# Test locally
cd backend && npm run dev
cd frontend && npm run dev

# Check build output
ls -la frontend/dist/
ls -la backend/dist/
```

## Need More Help?

1. **Check Hostinger documentation** for your specific hosting plan
2. **Contact Hostinger support** if you need help with:
   - Node.js hosting setup
   - VPS configuration
   - Domain/SSL issues

3. **Common issues:**
   - Backend needs to run on port 80/443 or configured port
   - CORS must allow your frontend domain
   - Environment variables must be set correctly

