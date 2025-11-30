# Upload Instructions - Make Your Website Live

## ✅ Files Ready to Upload

Your frontend is built and ready! Files are in:
```
/Users/ilyasmoktary/Documents/foryou/frontend/dist/
```

**Files to upload:**
- `index.html` (main file)
- `assets/` folder (JavaScript and CSS)
- `images/` folder (if exists)

## 🚀 Upload Steps

### Method 1: Hostinger File Manager (Recommended)

1. **Login to Hostinger:**
   - Go to: https://hpanel.hostinger.com
   - Enter your login credentials

2. **Navigate to File Manager:**
   - Click: **"Websites"** (left sidebar)
   - Click: **"alobricolage.com"**
   - Click: **"Files"** tab
   - Click: **"File Manager"** button

3. **Open public_html folder:**
   - In File Manager, click on **"public_html"** folder
   - This is where your website files must go

4. **Upload files:**
   - Click **"Upload"** button (top toolbar, usually has an upload icon)
   - A file upload dialog will open
   - Navigate to: `/Users/ilyasmoktary/Documents/foryou/frontend/dist/`
   - Select ALL files and folders:
     - ✅ `index.html`
     - ✅ `assets/` folder
     - ✅ `images/` folder (if it exists)
   - Click **"Open"** or **"Upload"**
   - Wait for upload to complete (you'll see progress)

5. **Verify upload:**
   - In File Manager, you should see:
     - `index.html` directly in `public_html/`
     - `assets/` folder in `public_html/`
   - If files are in a subfolder, move them to `public_html/` root

### Method 2: Using FTP (Alternative)

If File Manager doesn't work:

1. **Get FTP credentials:**
   - Hostinger → **Files** → **FTP Accounts**
   - Note: Host, Username, Password

2. **Use FTP client:**
   - Download **FileZilla** (free): https://filezilla-project.org
   - Or use **Cyberduck** (Mac): https://cyberduck.io

3. **Connect:**
   - Enter FTP credentials
   - Connect to server

4. **Upload:**
   - Navigate to `public_html/` on server
   - Upload all files from `frontend/dist/` to `public_html/`

## ✅ After Upload

1. **Visit your website:**
   - Go to: `https://alobricolage.com`
   - Your website should load!

2. **What you might see:**
   - ✅ Website loads → Frontend is working!
   - ⚠️ API errors in console → Normal, backend not deployed yet

## 🔧 Next Steps

After frontend is live, you need to deploy backend:

1. **Check Hostinger for Node.js hosting**
2. **Or use a backend service** (Railway, Render, etc.)
3. **Or deploy to VPS** (if you have one)

## 📋 Quick Checklist

- [ ] Updated `.env` with production API URL
- [ ] Rebuilt frontend (`npm run build`)
- [ ] Uploaded files to `public_html/`
- [ ] Verified `index.html` is in root
- [ ] Tested website at `https://alobricolage.com`
- [ ] Next: Deploy backend

## 🆘 Troubleshooting

**Website shows blank page:**
- Check if `index.html` is in `public_html/` root (not in subfolder)
- Clear browser cache (Cmd+Shift+R)
- Check browser console for errors (F12)

**Can't upload files:**
- Check file permissions
- Try uploading one file at a time
- Use FTP instead

**API errors:**
- This is normal - backend needs to be deployed
- Frontend is working, just needs backend connection

## 💡 Pro Tip

After uploading, wait 1-2 minutes for changes to propagate, then test your website!

