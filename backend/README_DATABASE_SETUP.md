y# Database Setup - Quick Start

## Option 1: Interactive Script (Recommended)

Run this command and follow the prompts:

```bash
cd backend
node configure-database.js
```

## Option 2: Direct Update Script

If you know your password and host, run:

```bash
cd backend
./update-env.sh YOUR_PASSWORD HOST
```

**Examples:**
```bash
# If host is localhost
./update-env.sh mypassword123 localhost

# If host is auth-db1657.hstgr.io
./update-env.sh mypassword123 auth-db1657.hstgr.io
```

## Option 3: Manual Update

1. Open `/backend/.env`
2. Find the line: `DATABASE_URL="postgresql://..."`
3. Replace it with:

```env
DATABASE_URL="mysql://u905810677_adminbrico:YOUR_PASSWORD@HOST:3306/u905810677_alobricolage"
```

Replace:
- `YOUR_PASSWORD` with your database password
- `HOST` with `localhost` or `auth-db1657.hstgr.io`

## After Updating .env

Run these commands to set up the database:

```bash
cd backend
npx prisma generate
npx prisma db push
```

This will:
1. Generate the Prisma client for MySQL
2. Create all tables in your Hostinger database

## Verify Setup

Check your database:

```bash
npx prisma studio
```

This opens a web interface to view your database tables.

## Restart Server

After setup, restart your backend:

```bash
npm run dev
```

