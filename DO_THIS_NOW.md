# ⚠️ DO THIS NOW - Login Won't Work Until You Do This

## The Issue

**Postgres.app is blocking Node.js from connecting to the database.**

This is a security feature. You MUST configure it once.

## ✅ The Fix (2 Minutes)

### Step 1: Open Postgres.app
- Look for the 🐘 elephant icon in your menu bar (top right)
- OR find "Postgres.app" in Applications folder
- Click to open it

### Step 2: Configure Permissions
1. In Postgres.app, you'll see your PostgreSQL server (e.g., "PostgreSQL 14")
2. **Right-click** on it (or click the ⚙️ gear icon)
3. Click **"Settings"**
4. Click the **"App Permissions"** tab (or "Client Applications")
5. Click the **"+"** button (Add Application)
6. Navigate to: **`/usr/local/bin/node`**
   - If that doesn't exist, try: **`/opt/homebrew/bin/node`**
   - Or find it: Open Terminal, type `which node`, copy that path
7. Click **"OK"** or **"Save"**

### Step 3: Restart Backend
```bash
# Stop the backend (Ctrl+C in its terminal)
cd backend
npm run dev
```

## ✅ Verify It Works

After doing the above, test:

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@allobricolage.ma","password":"admin123"}'
```

If you see `"accessToken"` in the response, **it's working!** 🎉

## Why This Is Required

Postgres.app blocks applications by default for security. You need to explicitly allow Node.js to connect. This is a **one-time setup**.

## Can't Find Postgres.app?

If you don't have Postgres.app:
1. Download it: https://postgresapp.com/
2. Install and open it
3. Click "Initialize" to start a server
4. Then follow the steps above

## Still Having Issues?

1. Make sure Postgres.app is **running** (check menu bar)
2. Make sure you **saved** the settings
3. Make sure you **restarted** the backend
4. Check the backend logs for errors

---

**This is the ONLY thing blocking login from working.** Once you configure Postgres.app, login will work immediately.






