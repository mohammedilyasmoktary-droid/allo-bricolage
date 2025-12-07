# Fix Render Build Command

## Problem
The build command is trying to `cd backend` but the directory doesn't exist in Render's context.

## Solution

Update your Render build command to match your repository structure.

### Option 1: If Render deploys from repository root

Go to Render → Your Service → Settings → Build Command and set it to:

```
cd backend && npm install && npx prisma generate && npm run build
```

**Note:** We removed `npm run apply-migration` from the build command because the migration now runs automatically on server startup.

### Option 2: If Render deploys from backend directory

If your Render service is configured to use the `backend` directory as the root, set Build Command to:

```
npm install && npx prisma generate && npm run build
```

### Option 3: Check your Render service root directory

1. Go to Render → Your Service → Settings
2. Check "Root Directory" setting
3. If it's empty or set to root, use Option 1
4. If it's set to `backend`, use Option 2

## Start Command

Make sure your Start Command is:
```
cd backend && npm start
```

Or if root directory is `backend`:
```
npm start
```

## Migration

The migration now runs automatically when the server starts, so you don't need to run it in the build command anymore. This is handled in `backend/src/server.ts`.

