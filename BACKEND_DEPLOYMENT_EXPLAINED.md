# Backend Deployment Explained - Step by Step

## What is "Deploy the Backend"?

Your website has **two parts**:
1. **Frontend** (what users see) - Already uploaded ✅
2. **Backend** (the API/server that handles data) - Needs to be deployed ⏳

The backend is what:
- Connects to your database
- Handles user login/registration
- Processes API requests
- Stores and retrieves data

## Why You Need to Deploy Backend

Right now:
- ✅ Frontend is on Hostinger (users can see the website)
- ❌ Backend is only on your computer (localhost:5001)
- ❌ When users try to login/register, it fails because backend isn't accessible

After deployment:
- ✅ Frontend on Hostinger
- ✅ Backend on Hostinger (or another server)
- ✅ Everything works together!

## Option A: Node.js Hosting on Hostinger

### Step 1: Check if You Have Node.js Hosting

1. **Login to Hostinger:**
   - Go to: https://hpanel.hostinger.com
   - Login

2. **Navigate to your website:**
   - Click: **"Websites"** (left sidebar)
   - Click: **"alobricolage.com"**

3. **Look for Node.js section:**
   - Scroll through the options
   - Look for:
     - **"Node.js"** tab or section
     - **"Applications"** tab or section
     - **"App Manager"** or similar
     - **"Node.js Apps"** menu item

### Step 2: If Node.js Hosting is Available

**What you'll see:**
- A section to create/manage Node.js applications
- Options to upload Node.js apps
- Environment variables section

**What to do:**

1. **Create a New Node.js App:**
   - Click **"Create App"** or **"Add Application"** button
   - App Name: `allo-bricolage-api` (or any name you like)
   - Node Version: Choose `18` or `20` (latest LTS)

2. **Upload Your Backend:**
   - Look for **"Upload"** or **"Deploy"** option
   - You need to upload your `backend/` folder
   - **Before uploading, make sure:**
     - Backend is built: `cd backend && npm run build`
     - This creates a `dist/` folder with compiled code

3. **Set Entry Point:**
   - Entry Point: `dist/server.js`
   - This tells Hostinger which file to run

4. **Set Environment Variables:**
   This is **VERY IMPORTANT** - these are your configuration settings:

   Click **"Environment Variables"** or **"Config"** and add:

   ```
   DATABASE_URL=mysql://u905810677_adminbrico:ALObricolage11@srv1657.hstgr.io:3306/u905810677_alobricolage
   NODE_ENV=production
   PORT=5001
   JWT_ACCESS_SECRET=your-production-secret-key-change-this
   JWT_REFRESH_SECRET=your-production-refresh-secret-change-this
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   FRONTEND_URL=https://alobricolage.com
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=5242880
   ```

   **Important:** 
   - Replace `your-production-secret-key-change-this` with a strong random string
   - You can generate one at: https://randomkeygen.com

5. **Start the Application:**
   - Click **"Start"** or **"Deploy"** button
   - Wait for it to start (usually takes 1-2 minutes)
   - You should see a status like "Running" or "Active"

6. **Get the Backend URL:**
   - Hostinger will give you a URL for your backend
   - It might be: `https://api.alobricolage.com` or `https://alobricolage.com:5001`
   - **Note this URL!**

7. **Update Frontend API URL:**
   - Go back to your local computer
   - Edit: `frontend/.env`
   - Update: `VITE_API_URL=https://your-backend-url/api`
   - Rebuild: `cd frontend && npm run build`
   - Re-upload frontend to Hostinger

### Step 3: If Node.js Hosting is NOT Available

If you don't see Node.js hosting option, you have other options:

**Option B: Use a Free Backend Service**

1. **Railway.app** (Recommended - Free tier):
   - Sign up at: https://railway.app
   - Create new project
   - Connect your GitHub (or upload files)
   - Deploy your backend
   - Get the URL they provide
   - Update frontend API URL

2. **Render.com** (Free tier):
   - Sign up at: https://render.com
   - Create new Web Service
   - Connect your repository
   - Deploy
   - Get URL and update frontend

**Option C: Use VPS** (If you have one):
   - SSH into your VPS
   - Upload backend files
   - Install Node.js
   - Run: `npm install --production && npm run build && npm start`

## What Files to Upload for Backend

When uploading backend, you need:

**Required:**
- `dist/` folder (compiled JavaScript)
- `package.json`
- `prisma/` folder (database schema)
- `.env` file (or set environment variables in Hostinger)

**Not needed:**
- `node_modules/` (will be installed on server)
- `src/` folder (source code - already compiled to `dist/`)
- Development files

## Quick Summary

**Deploying backend means:**
1. Put your backend code on a server (Hostinger or other)
2. Configure it with environment variables
3. Start it so it runs 24/7
4. Update frontend to point to backend URL

**Without backend:**
- Website loads ✅
- But login/registration/data doesn't work ❌

**With backend:**
- Website loads ✅
- Everything works! ✅

## Need Help?

Tell me:
1. Do you see "Node.js" or "Applications" in Hostinger?
2. What hosting plan do you have? (Check: Hostinger → Websites → alobricolage.com → Hosting Plan)
3. Do you want help with alternative options?

I can guide you through whichever option works for you!

