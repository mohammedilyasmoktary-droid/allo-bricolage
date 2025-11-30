# 🔧 Fix: Login Fails

## Problem
Login is failing with "Failed to login" error.

## Root Cause
The database tables don't exist yet. The Prisma migration hasn't been completed.

## ✅ Solution

### Step 1: Complete the Migration

In your terminal where you see the Prisma prompt asking:
```
? We need to reset the "public" schema at "localhost:5432"
Do you want to continue? All data will be lost. > (y/N)
```

**Type `y` and press Enter**

This will:
- Create all database tables (User, TechnicianProfile, Subscription, etc.)
- Apply the new schema with subscription system

### Step 2: Seed the Database

After migration completes, run:

```bash
cd backend
npm run seed
```

This creates:
- Admin user: `admin@allobricolage.ma` / `admin123`
- Client user: `client@example.ma` / `client123`
- Sample technicians: `ahmed@technician.ma` / `technician123`
- Service categories

### Step 3: Restart Backend (if needed)

If the backend server stopped, restart it:

```bash
cd backend
npm run dev
```

### Step 4: Try Login Again

Use these credentials:
- **Client**: `client@example.ma` / `client123`
- **Admin**: `admin@allobricolage.ma` / `admin123`
- **Technician**: `ahmed@technician.ma` / `technician123`

## 🔍 Verification

After migration and seeding, you can verify:

```bash
cd backend
npx tsx src/scripts/check-db.ts
```

This will show all users in the database.

## ⚠️ Important

- The migration will reset the database (lose existing data)
- This is normal for development
- After migration, run `npm run seed` to recreate test data

## ✅ Expected Result

After completing these steps:
- ✅ Login should work
- ✅ All users will be created
- ✅ Subscription system will be active
- ✅ New technicians get 7-day free trial automatically






