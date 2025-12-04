# Google Maps API Setup Guide

## Overview
The search page already has Google Maps integration. You just need to add your API key to enable the map functionality.

## Step 1: Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API** (required)
   - **Geocoding API** (optional, for better address handling)
   - **Places API** (optional, for location search)

4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key
6. (Recommended) Restrict your API key:
   - Click on the API key to edit it
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domains:
     - `localhost:*` (for local development)
     - `*.vercel.app/*` (for Vercel deployment)
     - `yourdomain.com/*` (if you have a custom domain)
   - Under "API restrictions", select "Restrict key" and choose:
     - Maps JavaScript API
     - Geocoding API (if enabled)
     - Places API (if enabled)

## Step 2: Add API Key to Local Environment

1. Open `frontend/.env` file (create it if it doesn't exist)
2. Add the following line:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
3. Replace `your_api_key_here` with your actual API key
4. Save the file
5. Restart your development server if it's running

## Step 3: Add API Key to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add New**
4. Add:
   - **Name**: `VITE_GOOGLE_MAPS_API_KEY`
   - **Value**: Your Google Maps API key
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**
6. Redeploy your application for the changes to take effect

## Step 4: Verify It Works

1. Start your development server: `npm run dev`
2. Navigate to the search page (`/search`)
3. Click on the "Carte" (Map) tab
4. You should see a map with markers for each technician's city

## Current Implementation

The map component (`TechnicianMap.tsx`) already:
- ✅ Shows markers for each technician's city
- ✅ Displays technician info when clicking a marker
- ✅ Centers the map based on visible technicians
- ✅ Shows custom markers with technician initials
- ✅ Handles multiple technicians in the same city

## Troubleshooting

### Map not showing
- Check that `VITE_GOOGLE_MAPS_API_KEY` is set in your `.env` file
- Verify the API key is correct
- Check browser console for errors
- Ensure Maps JavaScript API is enabled in Google Cloud Console

### "API key not configured" message
- Make sure the environment variable name is exactly `VITE_GOOGLE_MAPS_API_KEY`
- Restart your dev server after adding the key
- For Vercel, redeploy after adding the environment variable

### Billing issues
- Google Maps API has a free tier (usually $200/month credit)
- Monitor usage in Google Cloud Console
- Set up billing alerts if needed

## Cost Considerations

Google Maps JavaScript API pricing:
- First 28,000 map loads per month: FREE
- After that: $7 per 1,000 loads

For most applications, the free tier is sufficient.

## Security Best Practices

1. **Always restrict your API key** in Google Cloud Console
2. **Use HTTP referrer restrictions** to limit which domains can use the key
3. **Don't commit your API key** to version control (it's already in .gitignore)
4. **Rotate keys** if you suspect they've been compromised
