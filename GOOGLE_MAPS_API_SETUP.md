# Google Maps API Setup - Complete Guide

## Error: "This page didn't load Google Maps correctly"

This error usually means one of the following:

### 1. API Key Not Enabled for Maps JavaScript API

**Fix:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Go to **APIs & Services** → **Library**
4. Search for "Maps JavaScript API"
5. Click on it and click **"Enable"**
6. Wait a few minutes for it to activate

### 2. API Key Has Domain Restrictions

**Fix:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **APIs & Services** → **Credentials**
3. Click on your API key
4. Under **"Application restrictions"**, make sure:
   - Either "None" is selected (for testing)
   - OR "HTTP referrers" is selected with your domains:
     - `*.vercel.app/*`
     - `allo-bricolage.vercel.app/*`
     - `localhost:5173/*` (for local development)
5. Click **"Save"**

### 3. Billing Not Enabled

**Important:** Google Maps requires billing to be enabled, even for free tier usage.

**Fix:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **Billing**
3. Link a billing account (you get $200 free credit per month)
4. The free tier covers most usage

### 4. API Key Invalid or Revoked

**Fix:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **APIs & Services** → **Credentials**
3. Check if your API key exists and is active
4. If not, create a new one:
   - Click **"Create Credentials"** → **"API Key"**
   - Copy the key
   - Update it in Vercel environment variables

## Quick Checklist

- [ ] Maps JavaScript API is **Enabled**
- [ ] API Key has correct domain restrictions (or none for testing)
- [ ] Billing account is linked
- [ ] API Key is added to Vercel as `VITE_GOOGLE_MAPS_API_KEY`
- [ ] Vercel deployment was done **after** adding the environment variable

## Test Your API Key

You can test if your API key works by visiting:
```
https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap
```

Replace `YOUR_API_KEY` with your actual key. If it loads without errors, the key is valid.

## Current API Key

Your API key: `AIzaSyAjGf3qCd1j2PiQYZIP993o3sz7TtXyYrw`

Make sure this key:
1. Has "Maps JavaScript API" enabled
2. Has proper domain restrictions (or none)
3. Has billing enabled on the project

