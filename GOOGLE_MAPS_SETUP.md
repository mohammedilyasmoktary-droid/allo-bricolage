# 🗺️ Google Maps Integration Setup

## Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Maps JavaScript API"
   - Click "Enable"

4. Create an API Key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

5. (Optional) Restrict the API key:
   - Click on your API key to edit it
   - Under "Application restrictions", select "HTTP referrers"
   - Add: `localhost:*` and your production domain
   - Under "API restrictions", select "Restrict key"
   - Choose "Maps JavaScript API"

## Step 2: Add API Key to Frontend

1. Create or update `frontend/.env`:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

2. Restart your frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

## Step 3: Verify

1. Go to the "Rechercher" (Search) page
2. Search for technicians
3. Click the "Carte" (Map) tab
4. You should see a map with technician markers

## Features

- ✅ Interactive map showing technician locations
- ✅ Markers with technician initials
- ✅ Click markers to see technician info
- ✅ Click "Voir le profil" to view full profile
- ✅ Automatic centering based on search results
- ✅ Supports all Moroccan cities

## Troubleshooting

**Map doesn't show:**
- Check browser console for errors
- Verify API key is correct in `.env`
- Make sure "Maps JavaScript API" is enabled
- Check API key restrictions allow your domain

**Markers not appearing:**
- Verify technicians have city information
- Check that city names match the coordinates file

## Cost

Google Maps JavaScript API has a free tier:
- $200 free credit per month
- First 28,000 map loads free
- After that: $7 per 1,000 loads

For development, you'll likely stay within the free tier.





