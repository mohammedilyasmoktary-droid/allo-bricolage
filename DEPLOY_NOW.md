# Deploy Your Website Now - Simple Steps

## 🎯 Goal
Make your website live at `https://alobricolage.com`

## ✅ Current Status
- ✅ Frontend built and ready
- ✅ Database active on Hostinger
- ⏳ Need to upload files

## 📝 Step-by-Step Instructions

### Step 1: Update API URL (IMPORTANT!)

**Before uploading, you need to update the API URL:**

1. **Open:** `/Users/ilyasmoktary/Documents/foryou/frontend/.env`
2. **Change this line:**
   ```
   VITE_API_URL=http://localhost:5001/api
   ```
   **To:**
   ```
   VITE_API_URL=https://alobricolage.com/api
   ```
   (Or if your backend will be on a subdomain: `https://api.alobricolage.com/api`)

3. **Save the file**

4. **Rebuild frontend:**
   ```bash
   cd /Users/ilyasmoktary/Documents/foryou/frontend
   npm run build
   ```

### Step 2: Upload to Hostinger

1. **Login to Hostinger:**
   - Go to: https://hpanel.hostinger.com
   - Login

2. **Open File Manager:**
   - Click: **Websites** → **alobricolage.com** → **Files** → **File Manager**

3. **Go to public_html:**
   - Click on **"public_html"** folder
   - This is your website root

4. **Upload Files:**
   - Click **"Upload"** button (top of page)
   - Navigate to: `/Users/ilyasmoktary/Documents/foryou/frontend/dist/`
   - Select ALL files and folders:
     - `index.html`
     - `assets/` folder
     - Any other files
   - Click **"Upload"**
   - Wait for completion

5. **Verify:**
   - Check that `index.html` is in `public_html/` (not in a subfolder)
   - Check that `assets/` folder exists

### Step 3: Test Your Website

1. **Visit:** `https://alobricolage.com`
2. **What you should see:**
   - Your website loads ✅
   - You might see API errors (that's normal - backend not deployed yet)

### Step 4: Deploy Backend (Next Step)

Your backend needs to be deployed for full functionality. 

**Quick options:**

**A. Check Hostinger for Node.js hosting:**
   - Hostinger → Websites → alobricolage.com
   - Look for "Node.js" or "Applications"

**B. Use a free backend service:**
   - Railway.app (free tier)
   - Render.com (free tier)

**C. Use VPS (if you have one):**
   - SSH and deploy there

## 🎉 After Upload

Once files are uploaded:
- Your website will be live at `https://alobricolage.com`
- Frontend will work (static pages)
- Backend features (login, API) need backend deployment

## 📞 Need Help?

**If upload fails:**
- Check file permissions
- Try uploading one file at a time
- Use FTP instead (get credentials from Hostinger)

**If website doesn't load:**
- Check if `index.html` is in `public_html/` root
- Clear browser cache
- Check browser console for errors (F12)

**If you see API errors:**
- That's expected - backend needs to be deployed
- Frontend is working, just needs backend connection

## 🚀 Ready to Upload?

1. Update `.env` file (Step 1)
2. Rebuild (Step 1)
3. Upload to Hostinger (Step 2)
4. Test website (Step 3)

Let me know when you've uploaded and I'll help with backend deployment!

