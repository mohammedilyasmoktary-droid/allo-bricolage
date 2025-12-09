# Vercel Environment Variable Setup - Step by Step

## Issue: Google Maps API Key Not Loading

If you see "Google Maps API key not configured" even after adding the variable, follow these steps:

### Step 1: Verify the Variable in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project: **allo-bricolage**
3. Go to **Settings** → **Environment Variables**
4. Look for `VITE_GOOGLE_MAPS_API_KEY`
5. **Verify:**
   - ✅ Name is exactly: `VITE_GOOGLE_MAPS_API_KEY` (case-sensitive, no spaces)
   - ✅ Value is: `AIzaSyAjGf3qCd1j2PiQYZIP993o3sz7TtXyYrw`
   - ✅ Environment checkboxes: At minimum, **Production** must be checked

### Step 2: If Variable Doesn't Exist - Add It

1. Click **"Add New"** button
2. **Name:** `VITE_GOOGLE_MAPS_API_KEY` (copy exactly, no spaces)
3. **Value:** `AIzaSyAjGf3qCd1j2PiQYZIP993o3sz7TtXyYrw`
4. **Environment:** Check **ALL THREE**:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
5. Click **"Save"**

### Step 3: Redeploy (CRITICAL)

**Important:** After adding/updating environment variables, you MUST redeploy:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **three dots (...)** menu on the right
4. Click **"Redeploy"**
5. Make sure **"Use existing Build Cache"** is **UNCHECKED** (to ensure new env vars are loaded)
6. Click **"Redeploy"**

### Step 4: Wait for Deployment

- Wait 1-2 minutes for the deployment to complete
- Check that the deployment status shows "Ready" (green checkmark)

### Step 5: Test

1. Go to your live site: `https://allo-bricolage.vercel.app`
2. Navigate to the search page
3. Click the **"Carte"** tab
4. The map should now load with technician markers

## Troubleshooting

### If still not working:

1. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Check browser console** (F12) for any errors
3. **Verify variable name** - Must be exactly `VITE_GOOGLE_MAPS_API_KEY` (VITE_ prefix is required for Vite)
4. **Check deployment logs** in Vercel to see if variable is being read

### Common Mistakes:

- ❌ Variable name with spaces: `VITE_GOOGLE_MAPS_API_KEY ` (has trailing space)
- ❌ Wrong prefix: `GOOGLE_MAPS_API_KEY` (missing VITE_)
- ❌ Only added to Development, not Production
- ❌ Forgot to redeploy after adding variable
