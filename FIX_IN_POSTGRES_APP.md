# Fix Connection in Postgres.app (You're Already There!)

## You're Seeing This Error:
> "Connection attempt from node denied by Postgres.app settings."

## Here's How to Fix It:

### Step 1: Click "Server Settings..."
- In the Postgres.app window you have open
- Click the **"Server Settings..."** button (top right area)

### Step 2: Go to App Permissions
- In the settings window that opens
- Look for **"App Permissions"** tab (or "Client Applications")
- Click on it

### Step 3: Add Node.js
- Click the **"+"** button (Add Application)
- Navigate to: **`/usr/local/bin/node`**
  - If that path doesn't exist, try: **`/opt/homebrew/bin/node`**
  - Or find it: Open Terminal, type `which node`, use that path
- Click **"OK"** or **"Add"**

### Step 4: Save and Restart
- Click **"OK"** or **"Save"** to close settings
- The warning message should disappear
- Restart your backend:
  ```bash
  # Stop backend (Ctrl+C)
  cd backend
  npm run dev
  ```

## That's It! 🎉

After this, the connection will work and login will function properly.






