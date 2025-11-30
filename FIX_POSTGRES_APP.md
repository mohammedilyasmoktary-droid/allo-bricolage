# Fix Postgres.app Connection Issue

## Problem
Postgres.app is blocking Node.js connections with the error:
> "Postgres.app rejected 'trust' authentication - You did not allow node to connect without a password."

## Solution: Configure Postgres.app Permissions

### Option 1: Allow Node.js in Postgres.app Settings (Recommended)

1. **Open Postgres.app** (if not open, find it in Applications)

2. **Click on the server** (usually "PostgreSQL 14" or similar)

3. **Go to Settings** (gear icon) or right-click → Settings

4. **Find "App Permissions"** or "Client Applications" section

5. **Add Node.js** to the allowed applications:
   - Click "Add Application" or "+"
   - Navigate to: `/usr/local/bin/node` or `/opt/homebrew/bin/node`
   - Or find Node.js in: `/usr/local/bin/` or `/opt/homebrew/bin/`
   
6. **Save/Apply** the settings

7. **Restart the backend server**:
   ```bash
   # Stop the current backend (Ctrl+C)
   cd backend
   npm run dev
   ```

### Option 2: Use a Password (Alternative)

If you prefer to use a password instead:

1. **Set a password for your PostgreSQL user**:
   - Open Postgres.app
   - Click on your database server
   - Open "psql" or terminal
   - Run: `ALTER USER ilyasmoktary WITH PASSWORD 'yourpassword';`

2. **Update `backend/.env`**:
   ```env
   DATABASE_URL="postgresql://ilyasmoktary:yourpassword@localhost:5432/allo_bricolage?schema=public"
   ```

3. **Restart the backend server**

### Option 3: Use the Default Postgres User

Try using the default `postgres` user with your macOS username as password:

1. **Update `backend/.env`**:
   ```env
   DATABASE_URL="postgresql://postgres:ilyasmoktary@localhost:5432/allo_bricolage?schema=public"
   ```

2. **Restart the backend server**

## After Fixing

Test the login:
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@allobricolage.ma","password":"admin123"}'
```

You should get a response with `accessToken` and `user` data.

## Quick Test

To verify the database connection works:
```bash
cd backend
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => { console.log('✅ Connected!'); process.exit(0); }).catch(e => { console.log('❌ Error:', e.message); process.exit(1); });"
```






