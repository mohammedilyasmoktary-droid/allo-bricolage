# Vercel Environment Variable Verification Checklist

## Step 1: Verify Variable in Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select project: **allo-bricolage**
3. Go to: **Settings** → **Environment Variables**
4. Look for `VITE_GOOGLE_MAPS_API_KEY`

**Checklist:**
- [ ] Variable exists with exact name: `VITE_GOOGLE_MAPS_API_KEY`
- [ ] Value is: `AIzaSyAjGf3qCd1j2PiQYZIP993o3sz7TtXyYrw`
- [ ] **Production** checkbox is CHECKED ✓
- [ ] **Preview** checkbox is CHECKED ✓ (optional but recommended)
- [ ] **Development** checkbox is CHECKED ✓ (optional)

## Step 2: Check Browser Console

1. Go to your live site: `https://allo-bricolage.vercel.app`
2. Open browser console (F12 → Console tab)
3. Navigate to search page and click "Carte" tab
4. Look for: `🔍 Google Maps API Key Debug:`

**What to look for:**
- `VITE_GOOGLE_MAPS_API_KEY: "EXISTS"` or `"MISSING"`
- `exists: true` or `false`
- `length: 39` (if exists) or `0` (if missing)

## Step 3: Verify Build Logs

1. Go to **Deployments** tab in Vercel
2. Click on the latest deployment
3. Go to **Build Logs** tab
4. Look for the build command output
5. Check if there are any errors or warnings

## Step 4: Manual Verification

If the variable shows as "MISSING" in console:

1. **Double-check variable name:**
   - Must be exactly: `VITE_GOOGLE_MAPS_API_KEY`
   - No spaces before or after
   - Case-sensitive (all uppercase)

2. **Verify it's enabled for Production:**
   - In Environment Variables, click on the variable
   - Make sure Production is checked
   - Save if you made changes

3. **Redeploy WITHOUT cache:**
   - Go to Deployments
   - Click three dots (...) on latest deployment
   - Click "Redeploy"
   - **UNCHECK** "Use existing Build Cache"
   - Click "Redeploy"
   - Wait for completion

## Step 5: Alternative - Add Variable via Vercel CLI

If the dashboard method isn't working, try via CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Add environment variable
vercel env add VITE_GOOGLE_MAPS_API_KEY production

# When prompted, enter: AIzaSyAjGf3qCd1j2PiQYZIP993o3sz7TtXyYrw
```

Then redeploy.

## Common Issues

### Issue 1: Variable Added After Build
- **Problem:** Variable added after deployment
- **Solution:** Must redeploy after adding variable

### Issue 2: Wrong Environment Selected
- **Problem:** Variable only added to Development, not Production
- **Solution:** Check Production checkbox in Environment Variables

### Issue 3: Typo in Variable Name
- **Problem:** `GOOGLE_MAPS_API_KEY` instead of `VITE_GOOGLE_MAPS_API_KEY`
- **Solution:** Must start with `VITE_` for Vite to expose it

### Issue 4: Build Cache
- **Problem:** Old build cached without environment variable
- **Solution:** Redeploy with "Use existing Build Cache" UNCHECKED

## Still Not Working?

If after all steps it still doesn't work:

1. **Check console output** - Share what you see in the debug log
2. **Check build logs** - Look for any errors
3. **Try temporary hardcode** - As a test, we can temporarily hardcode the key to verify the map works (then remove it)

