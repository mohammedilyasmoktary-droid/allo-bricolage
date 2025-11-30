# 🚀 Quick Start Guide - Get Website Operational

## Step 1: Start PostgreSQL

You need to start PostgreSQL first. Choose one method:

### Option A: Postgres.app (Recommended if installed)
1. Open **Postgres.app** from Applications
2. Click **"Start"** button
3. Wait for the green light

### Option B: Terminal (if installed via Homebrew)
```bash
brew services start postgresql@14
# or
brew services start postgresql
```

### Option C: Check if already running
```bash
pg_isready -h localhost -p 5432
```

## Step 2: Update Database Schema

Once PostgreSQL is running:

```bash
cd backend
npx prisma db push
npx prisma generate
```

## Step 3: Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on: **http://localhost:5001**

## Step 4: Start Frontend Server

Open a **new terminal**:

```bash
cd frontend
npm run dev
```

Frontend will run on: **http://localhost:5173**

## Step 5: Access Website

Open your browser and go to: **http://localhost:5173**

## Troubleshooting

### If PostgreSQL won't start:
1. Check if Postgres.app is installed: `/Applications/Postgres.app`
2. If not installed, download from: https://postgresapp.com/
3. Or install via Homebrew: `brew install postgresql@14`

### If port 5001 is in use:
Edit `backend/.env` and change `PORT=5001` to another port (e.g., `PORT=5002`)

### If you see database connection errors:
1. Make sure PostgreSQL is running
2. Check `backend/.env` has correct `DATABASE_URL`
3. Default: `postgresql://postgres@localhost:5432/allo_bricolage?schema=public`

## Test Accounts

After seeding (if needed):
- **Admin**: admin@allobricolage.ma / admin123
- **Client**: client@example.ma / client123
- **Technician**: ahmed@technician.ma / technician123




