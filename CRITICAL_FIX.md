# 🚨 CRITICAL: Postgres.app Configuration Required

## The Problem

Postgres.app is **blocking Node.js server connections** for security. This is why login doesn't work.

## The Solution (REQUIRED - Takes 30 seconds)

You **MUST** configure Postgres.app to allow Node.js. There's no workaround.

### Step-by-Step:

1. **Open Postgres.app**
   - Find it in Applications or your menu bar (🐘 icon)

2. **Right-click on your PostgreSQL server**
   - Usually shows "PostgreSQL 14" or similar
   - Or click the gear icon ⚙️

3. **Click "Settings"**

4. **Go to "App Permissions"** tab
   - (May also be called "Client Applications")

5. **Click the "+" button** (Add Application)

6. **Navigate to and select Node.js:**
   - Path: `/usr/local/bin/node`
   - OR if that doesn't exist: `/opt/homebrew/bin/node`
   - OR find it: Open Terminal and run `which node`

7. **Click "OK" or "Save"**

8. **Restart the backend:**
   ```bash
   # Stop backend (Ctrl+C)
   cd backend
   npm run dev
   ```

## Verify It Works

After configuring, test:

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@allobricolage.ma","password":"admin123"}'
```

You should get a response with `accessToken` - that means it's working!

## Why This Is Required

Postgres.app has a security feature that blocks applications from connecting unless you explicitly allow them. This prevents unauthorized apps from accessing your database.

**This is a one-time setup** - once configured, you won't need to do it again.

## Still Not Working?

1. Make sure you added the **exact path** to Node.js
2. Make sure you **saved** the settings in Postgres.app
3. Make sure you **restarted** the backend after saving
4. Check that Postgres.app is **running** (should show in menu bar)

## Alternative: Use a Different Database

If you can't configure Postgres.app, you can use:
- Docker: `docker-compose up -d` (if you have Docker)
- Cloud database (Supabase, Neon, etc.)

But configuring Postgres.app is the easiest solution!






