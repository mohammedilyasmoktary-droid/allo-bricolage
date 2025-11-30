# Fix 500 Error - Extract ZIP Locally

## Problem

The 500 error happens because:
- The ZIP file is too large (405 MB)
- Server can't extract it due to resource limits
- File Manager has issues with large ZIP files

## Solution: Extract on Your Computer, Then Upload Individual Files

### Step 1: Download the ZIP File

1. **In Hostinger File Manager:**
   - Right-click on `foryou 4.zip`
   - Click **"Download"**
   - Save it to your Downloads folder

### Step 2: Extract ZIP on Your Computer

1. **Find the downloaded file:**
   - Go to your Downloads folder
   - Find `foryou 4.zip`

2. **Extract it:**
   - **Double-click** `foryou 4.zip` (Mac will extract it)
   - Or right-click → **"Open With"** → **"Archive Utility"**
   - This creates a `foryou 4` folder

3. **Find the website files:**
   - Open the extracted folder
   - Navigate to: `foryou 4/frontend/dist/`
   - You should see:
     - `index.html`
     - `assets/` folder
     - `images/` folder (if exists)

### Step 3: Upload Individual Files to Hostinger

1. **Go back to Hostinger File Manager:**
   - Navigate to `public_html/` folder
   - **Delete `foryou 4.zip`** (right-click → Delete)

2. **Upload `index.html`:**
   - Click **"Upload"** button
   - Navigate to: `foryou 4/frontend/dist/index.html`
   - Select and upload it
   - Make sure it goes directly into `public_html/` (not in a subfolder)

3. **Upload `assets/` folder:**
   - Click **"Upload"** button again
   - Navigate to: `foryou 4/frontend/dist/assets/`
   - Select the entire `assets/` folder
   - Upload it
   - Make sure it goes directly into `public_html/`

4. **Upload `images/` folder (if exists):**
   - Same process for `images/` folder

### Step 4: Verify Structure

**In `public_html/`, you should have:**
```
public_html/
  ├── index.html          ✅
  ├── assets/             ✅
  │   ├── index-xxx.js
  │   └── ...
  └── images/             ✅ (if exists)
```

**NOT:**
```
public_html/
  ├── foryou 4.zip        ❌ (delete this)
  └── foryou 4/           ❌ (don't upload this)
```

### Step 5: Test Your Website

1. **Visit:** `https://alobricolage.com`
2. **Hard refresh:** Cmd+Shift+R
3. **Your website should load!**

## Alternative: Use Only Frontend Files

Since you only need the frontend files, you can:

1. **Extract ZIP on your computer**
2. **Go to:** `foryou 4/frontend/dist/`
3. **Upload only these files:**
   - `index.html`
   - `assets/` folder
   - `images/` folder (if exists)

**You don't need:**
- Backend files (upload separately later)
- `node_modules/` (too large, not needed)
- Source files (`src/` folder)

## Quick Steps Summary

1. ✅ Download `foryou 4.zip` from Hostinger
2. ✅ Extract on your computer
3. ✅ Find `foryou 4/frontend/dist/` folder
4. ✅ Upload `index.html` to `public_html/`
5. ✅ Upload `assets/` folder to `public_html/`
6. ✅ Delete `foryou 4.zip` from `public_html/`
7. ✅ Test website

## Why This Works

- Extracting on your computer is faster and more reliable
- Uploading individual files avoids server limits
- Only upload what's needed (frontend files)
- Smaller uploads = faster and more reliable

