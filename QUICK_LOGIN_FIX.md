# 🔧 Quick Fix for Login

## ✅ Backend is Working!

The backend login endpoint is working correctly. If you still can't login in the frontend, try this:

## Step 1: Restart Frontend

The frontend might be using a cached API URL. Restart it:

```bash
# Stop the frontend (Ctrl+C in its terminal)
# Then restart:
cd frontend
npm run dev
```

## Step 2: Clear Browser Cache

1. Open your browser's developer tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or clear localStorage:
   - Open Console (F12)
   - Type: `localStorage.clear()`
   - Press Enter
   - Refresh the page

## Step 3: Verify Backend is Running

```bash
curl http://localhost:5001/health
```

Should return: `{"status":"ok","message":"Allo Bricolage API is running"}`

## Step 4: Test Login Directly

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@allobricolage.ma","password":"admin123"}'
```

If this returns `accessToken`, the backend is working!

## Step 5: Check Browser Console

1. Open http://localhost:5173
2. Press F12 to open developer tools
3. Go to "Console" tab
4. Try to login
5. Look for any red error messages

Common errors:
- **Network Error** → Backend not running or wrong port
- **CORS Error** → Backend CORS should be configured, but check
- **401 Unauthorized** → Wrong email/password

## Test Accounts

- **Admin**: `admin@allobricolage.ma` / `admin123`
- **Technician**: `ahmed@technician.ma` / `technician123`
- **Client**: `client@example.ma` / `client123`

## Still Not Working?

Run the diagnostic:
```bash
./test-and-fix-login.sh
```

This will test everything and tell you exactly what's wrong.






