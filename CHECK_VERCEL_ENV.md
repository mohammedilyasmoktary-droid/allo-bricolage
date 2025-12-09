# How to Verify Environment Variable in Vercel Build

## Step 1: Check Full Build Logs

In the Vercel deployment page:
1. Scroll down in the "Build Logs" section
2. Look for the line that says: `Running "build" command:`
3. This should show the output of `npm run build`
4. The build should complete without errors

## Step 2: Verify Variable is Available

The environment variable `VITE_GOOGLE_MAPS_API_KEY` must be available **during the build process**.

To verify:
1. In Vercel dashboard → **Settings** → **Environment Variables**
2. Make sure `VITE_GOOGLE_MAPS_API_KEY` shows:
   - ✅ Name: `VITE_GOOGLE_MAPS_API_KEY`
   - ✅ Value: `AIzaSyAjGf3qCd1j2PiQYZIP993o3sz7TtXyYrw`
   - ✅ Production: **Checked** ✓

## Step 3: Check Build Output

After the build completes, check:
1. The build should show: `✓ built in X.XXs`
2. No errors about missing environment variables
3. The deployment status should be "Ready" (green checkmark)

## Step 4: Test in Browser

1. Go to your live site
2. Open browser console (F12)
3. Type: `console.log(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)`
4. If it shows `undefined` or empty string, the variable wasn't included in the build

## Common Issue: Variable Added After Build

If you added the environment variable **after** the last deployment:
- The variable won't be in the build
- You **MUST** redeploy for it to take effect
- Make sure to redeploy **without build cache**

## Quick Fix

1. Go to **Deployments** tab
2. Click **three dots (...)** on latest deployment
3. Click **"Redeploy"**
4. **UNCHECK** "Use existing Build Cache"
5. Click **"Redeploy"**
6. Wait for build to complete
7. Test the map again

