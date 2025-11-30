# Quick Database Setup Guide

## Automated Setup

Run this command and follow the prompts:

```bash
cd backend
node configure-database.js
```

The script will:
1. Ask for your database password
2. Ask for the host (localhost or custom)
3. Automatically update your `.env` file
4. Show you the next steps

## Manual Setup

If you prefer to do it manually:

1. Open `/backend/.env`
2. Replace the `DATABASE_URL` line with:

```env
DATABASE_URL="mysql://u905810677_adminbrico:YOUR_PASSWORD@HOST:3306/u905810677_alobricolage"
```

Replace:
- `YOUR_PASSWORD` with your database password
- `HOST` with `localhost` or `auth-db1657.hstgr.io`

3. Then run:
```bash
npx prisma generate
npx prisma db push
```

## After Setup

Once configured, restart your backend server:

```bash
npm run dev
```

