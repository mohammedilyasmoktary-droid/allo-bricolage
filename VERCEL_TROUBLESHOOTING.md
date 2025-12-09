# Vercel Google Maps API Key - Troubleshooting Guide

## The Problem
Even after adding `VITE_GOOGLE_MAPS_API_KEY` to Vercel, the map still shows "API key not configured".

## Critical Points About Vite Environment Variables

⚠️ **IMPORTANT:** Vite environment variables are **baked into the build** at build time, not runtime. This means:

1. The variable MUST exist **before** the build runs
2. You MUST redeploy after adding the variable
3. The variable name MUST start with `VITE_`

## Step-by-Step Fix

### Step 1: Verify Variable in Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select project: **allo-bricolage**
3. Go to: **Settings** → **Environment Variables**
4. Check if `VITE_GOOGLE_MAPS_API_KEY` exists

**If it doesn't exist:**
- Click **"Add New"**
- **Name:** `VITE_GOOGLE_MAPS_API_KEY` (exactly, no spaces, case-sensitive)
- **Value:** `AIzaSyAjGf3qCd1j2PiQYZIP993o3sz7TtXyYrw`
- **Environments:** Check **ALL** (Production, Preview, Development)
- Click **"Save"**

**If it exists:**
- Click on it to edit
- Verify the value is correct
- Make sure **Production** is checked
- Click **"Save"**

### Step 2: Force a Fresh Redeploy

**This is critical!** Environment variables are only loaded during the build.

1. Go to: **Deployments** tab
2. Find the latest deployment
3. Click the **three dots (...)** menu
4. Click **"Redeploy"**
5. **IMPORTANT:** Make sure **"Use existing Build Cache"** is **UNCHECKED** ❌
   - This forces Vercel to rebuild with the new environment variables
6. Click **"Redeploy"**

### Step 3: Wait and Verify

1. Wait 2-3 minutes for deployment to complete
2. Check deployment logs:
   - Click on the deployment
   - Go to **"Build Logs"** tab
   - Look for any errors or warnings
   - The build should complete successfully

### Step 4: Test

1. Go to your live site
2. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Navigate to search page
4. Click **"Carte"** tab
5. Check browser console (F12) for any errors

## Common Issues

### Issue 1: Variable Not Available for Production
- **Symptom:** Works in Preview but not Production
- **Fix:** Make sure Production checkbox is checked in Environment Variables

### Issue 2: Build Cache
- **Symptom:** Variable added but still not working
- **Fix:** Redeploy with "Use existing Build Cache" **UNCHECKED**

### Issue 3: Wrong Variable Name
- **Symptom:** Variable exists but not loading
- **Fix:** Must be exactly `VITE_GOOGLE_MAPS_API_KEY` (not `GOOGLE_MAPS_API_KEY`)

### Issue 4: Typo in Value
- **Symptom:** Variable exists but API rejects it
- **Fix:** Double-check the value: `AIzaSyAjGf3qCd1j2PiQYZIP993o3sz7TtXyYrw`

## Verify in Build Logs

After redeploying, check the build logs:

1. Go to deployment → **Build Logs**
2. Look for lines containing `VITE_GOOGLE_MAPS_API_KEY`
3. The variable should be available during the build process

## Alternative: Check via Browser Console

1. Open your live site
2. Press F12 to open Developer Tools
3. Go to **Console** tab
4. Type: `console.log(import.meta.env)`
5. Look for `VITE_GOOGLE_MAPS_API_KEY` in the output

**Note:** In production builds, Vite only exposes variables that start with `VITE_` and are available at build time.

## Still Not Working?

If after following all steps it still doesn't work:

1. **Double-check the variable name** - Copy-paste it to avoid typos
2. **Check Google Cloud Console** - Make sure the API key is enabled for "Maps JavaScript API"
3. **Check API key restrictions** - Make sure your Vercel domain is allowed
4. **Try a test deployment** - Create a new deployment to see if it picks up the variable

## Quick Test

To verify the variable is being read, temporarily add this to your code (remove after testing):

```typescript
console.log('API Key:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'EXISTS' : 'MISSING');
```

This will show in the browser console whether the variable is available.

