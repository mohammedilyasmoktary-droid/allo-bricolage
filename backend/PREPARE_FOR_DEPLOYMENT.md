# Prepare Backend for Deployment

## Before Uploading Backend

### Step 1: Build the Backend

```bash
cd /Users/ilyasmoktary/Documents/foryou/backend
npm run build
```

This creates a `dist/` folder with compiled JavaScript.

### Step 2: What to Upload

**Files/Folders to upload:**
- ✅ `dist/` folder (compiled code)
- ✅ `package.json` (dependencies list)
- ✅ `prisma/` folder (database schema)
- ✅ `.env` file (OR set environment variables in Hostinger)

**Files NOT to upload:**
- ❌ `node_modules/` (will be installed on server)
- ❌ `src/` folder (source code - not needed)
- ❌ Development files

### Step 3: Environment Variables Needed

When deploying, you'll need to set these:

```
DATABASE_URL=mysql://u905810677_adminbrico:ALObricolage11@srv1657.hstgr.io:3306/u905810677_alobricolage
NODE_ENV=production
PORT=5001
JWT_ACCESS_SECRET=generate-a-random-secret-key
JWT_REFRESH_SECRET=generate-another-random-secret-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://alobricolage.com
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

**Generate secrets:**
- Visit: https://randomkeygen.com
- Use "CodeIgniter Encryption Keys" - copy a long random string
- Use different strings for ACCESS_SECRET and REFRESH_SECRET

### Step 4: After Deployment

1. **Get backend URL** from Hostinger
2. **Update frontend `.env`:**
   ```
   VITE_API_URL=https://your-backend-url/api
   ```
3. **Rebuild frontend:**
   ```bash
   cd frontend && npm run build
   ```
4. **Re-upload frontend** to Hostinger

