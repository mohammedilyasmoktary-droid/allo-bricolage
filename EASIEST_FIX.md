# ✅ Easiest Fix for Postgres.app Connection

## The Problem
Postgres.app is blocking Node.js connections for security reasons.

## The Easiest Solution (2 Steps)

### Step 1: Configure Postgres.app (Takes 30 seconds)

1. **Open Postgres.app** (find it in your Applications folder or menu bar)

2. **Right-click on your PostgreSQL server** (or click the gear icon ⚙️)

3. **Click "Settings"** or look for "App Permissions"

4. **Click "Add Application"** or the **"+"** button

5. **Find and add Node.js:**
   - Click "Browse" or navigate to:
   - `/usr/local/bin/node` (Intel Mac)
   - OR `/opt/homebrew/bin/node` (Apple Silicon Mac)
   - OR find it by running: `which node` in Terminal

6. **Click "OK" or "Save"**

### Step 2: Restart Backend

```bash
# Stop the backend (Ctrl+C in the terminal running it)
# Then run:
cd backend
npm run dev
```

## That's It! 🎉

Now try logging in again. It should work!

## Test Accounts

- **Admin**: `admin@allobricolage.ma` / `admin123`
- **Technician**: `ahmed@technician.ma` / `technician123`  
- **Client**: `client@example.ma` / `client123`

## Alternative: Use the Fix Script

I've created a script that will test and guide you:

```bash
./fix-postgres-connection.sh
```

This script will:
- Test the connection
- Tell you exactly what to do if it fails
- Restart the backend automatically if it works

---

**Note:** This is a one-time setup. Once you configure Postgres.app permissions, you won't need to do it again.






