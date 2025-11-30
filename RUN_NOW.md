# Can I Run It Now? ⚡

## Current Status

✅ **Ready:**
- Backend dependencies installed
- Frontend dependencies installed
- Environment files configured
- All code is ready

❌ **Missing:**
- PostgreSQL database (required)

## You Need PostgreSQL First

The application requires PostgreSQL to store data. Here are your options:

### Option 1: Install PostgreSQL via Homebrew (Recommended)

**Step 1: Install Homebrew** (if not installed):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Step 2: Install PostgreSQL**:
```bash
brew install postgresql@14
```

**Step 3: Start PostgreSQL**:
```bash
brew services start postgresql@14
```

**Step 4: Set up the database**:
```bash
./setup-database.sh
```

### Option 2: Use Docker (If you have Docker Desktop)

```bash
# Start PostgreSQL
docker-compose up -d

# Wait a few seconds, then set up database
./setup-database.sh
```

### Option 3: Use Postgres.app (Easiest GUI option)

1. Download from: https://postgresapp.com/
2. Install and open the app
3. Click "Initialize" to start a server
4. Update `backend/.env` DATABASE_URL to: `postgresql://localhost/allo_bricolage?schema=public`
5. Run: `./setup-database.sh`

### Option 4: Use a Cloud Database (Free)

- **Supabase**: https://supabase.com (Free tier)
- **Neon**: https://neon.tech (Free tier)

Just update `DATABASE_URL` in `backend/.env` with your cloud database connection string.

---

## Once PostgreSQL is Running

After PostgreSQL is set up, you can run the app:

```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend
cd frontend
npm run dev
```

Then open: **http://localhost:5173**

---

## Quick Test

To check if PostgreSQL is ready:
```bash
psql --version  # Should show a version number
```

If this command works, you're ready to run `./setup-database.sh`!






