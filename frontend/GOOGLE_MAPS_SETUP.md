# Google Maps API Setup

## Local Development

1. Create a `.env` file in the `frontend` directory (if it doesn't exist)
2. Add the following line to your `.env` file:

```
VITE_GOOGLE_MAPS_API_KEY=AIzaSyAjGf3qCd1j2PiQYZIP993o3sz7TtXyYrw
```

3. Restart your development server (`npm run dev`)

## Vercel Deployment

To add the Google Maps API key to your Vercel deployment:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name:** `VITE_GOOGLE_MAPS_API_KEY`
   - **Value:** `AIzaSyAjGf3qCd1j2PiQYZIP993o3sz7TtXyYrw`
   - **Environment:** Select all (Production, Preview, Development)
4. Redeploy your application

## How It Works

The `TechnicianMap` component automatically reads the API key from `VITE_GOOGLE_MAPS_API_KEY` environment variable and displays technicians as markers on a Google Map, with each technician positioned at their city location.

The map shows:
- Custom markers with technician initials
- Info windows with technician details when clicked
- Automatic centering based on technician locations
- Support for multiple cities

