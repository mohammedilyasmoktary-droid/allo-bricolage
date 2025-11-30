# Deploy to Vercel - Quick & Easy!

## Why Vercel?

- ✅ **Free** - Perfect for demos
- ✅ **Automatic** - Deploys from GitHub
- ✅ **Fast** - Live in minutes
- ✅ **Easy** - Just connect GitHub
- ✅ **Professional URL** - `allo-bricolage.vercel.app`

## Step 1: Deploy Frontend to Vercel

### Option A: Via Vercel Website (Easiest)

1. **Go to Vercel:**
   - Visit: https://vercel.com
   - Click **"Sign Up"** (or Login)
   - **Sign in with GitHub** (recommended - uses your GitHub account)

2. **Import Your Repository:**
   - Click **"Add New..."** → **"Project"**
   - Click **"Import Git Repository"**
   - Find: `mohammedilyasmoktary-droid/allo-bricolage`
   - Click **"Import"**

3. **Configure Project:**
   - **Framework Preset:** Vite (or Auto-detect)
   - **Root Directory:** `frontend` (IMPORTANT!)
   - **Build Command:** `npm run build` (should auto-detect)
   - **Output Directory:** `dist` (should auto-detect)
   - **Install Command:** `npm install`

4. **Environment Variables:**
   - Click **"Environment Variables"**
   - Add:
     ```
     VITE_API_URL=https://your-backend-url.vercel.app/api
     ```
     (We'll set up backend next, or use a placeholder for now)

5. **Deploy:**
   - Click **"Deploy"**
   - Wait 2-3 minutes
   - ✅ Your site will be live!

6. **Get Your Link:**
   - Vercel will give you: `https://allo-bricolage.vercel.app`
   - Or custom domain if you add one
   - **This is your shareable link!**

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd /Users/ilyasmoktary/Documents/foryou/frontend
vercel

# Follow prompts:
# - Login to Vercel
# - Link to project
# - Deploy
```

## Step 2: Deploy Backend (Optional for Demo)

For a quick demo, you can:

**Option A: Deploy Backend to Railway (Free)**
1. Go to: https://railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub
4. Select your repository
5. Set root directory: `backend`
6. Add environment variables
7. Deploy

**Option B: Deploy Backend to Render (Free)**
1. Go to: https://render.com
2. Sign up
3. New → Web Service
4. Connect GitHub repository
5. Set root directory: `backend`
6. Add environment variables
7. Deploy

**Option C: Use Mock Data (For Demo Only)**
- Frontend can work without backend for visual demo
- Just show the UI/design

## Step 3: Update Frontend API URL

Once backend is deployed:

1. **Get backend URL** (from Railway/Render)
2. **In Vercel:**
   - Go to your project → Settings → Environment Variables
   - Update `VITE_API_URL` to your backend URL
   - Redeploy

## Your Shareable Links

**Frontend (Vercel):**
```
https://allo-bricolage.vercel.app
```

**Or custom domain:**
```
https://alobricolage.com
```
(If you connect your domain in Vercel)

## Benefits of Vercel

- ✅ **Instant deployment** from GitHub
- ✅ **Auto-deploys** on every push
- ✅ **Free SSL** (https://)
- ✅ **Fast CDN** (worldwide)
- ✅ **Easy to share** with professor

## Quick Summary

1. Sign up at vercel.com
2. Import GitHub repository
3. Set root directory: `frontend`
4. Deploy
5. Get your link: `https://allo-bricolage.vercel.app`
6. Share with professor! 🎉

## Need Help?

I can guide you through:
- Vercel setup
- Backend deployment (Railway/Render)
- Connecting everything together

Let me know when you're ready!

