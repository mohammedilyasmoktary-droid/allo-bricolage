# 🔧 Fix Error & Start Website

## The Problem
You're getting: `Error: P1001: Can't reach database server at localhost:5432`

This means **PostgreSQL is not running**.

## ✅ Solution - 3 Steps

### Step 1: Start PostgreSQL

**Option A - Postgres.app (Easiest):**
1. Download from: https://postgresapp.com/downloads.html
2. Install and open Postgres.app
3. Click the **"Start"** button
4. Wait for green light ✅

**Option B - Homebrew:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Option C - Check if already installed:**
```bash
# Check if Postgres.app exists
ls /Applications/ | grep -i postgres

# If found, open it:
open /Applications/Postgres.app
```

### Step 2: Update Database (Run from project root)

```bash
cd backend
npx prisma db push
npx prisma generate
```

### Step 3: Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 🎯 Quick Start Script

I've created a script that does everything automatically:

```bash
./start-website.sh
```

This script will:
- ✅ Check if PostgreSQL is running
- ✅ Update database schema
- ✅ Start both servers
- ✅ Open browser automatically

## 🌐 Access Website

Once both servers are running:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5001

## ⚠️ If PostgreSQL Still Won't Start

1. **Check if database exists:**
   ```bash
   psql -h localhost -U postgres -l
   ```

2. **Create database if needed:**
   ```bash
   psql -h localhost -U postgres -c "CREATE DATABASE allo_bricolage;"
   ```

3. **Check .env file:**
   Make sure `backend/.env` has:
   ```
   DATABASE_URL="postgresql://postgres@localhost:5432/allo_bricolage?schema=public"
   ```

## 📞 Need Help?

If PostgreSQL is still not working:
1. Install Postgres.app (recommended for macOS)
2. Or use Docker: `docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:14`




