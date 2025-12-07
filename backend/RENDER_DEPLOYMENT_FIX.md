# Fix Render Deployment - Add Missing Database Columns

## Problem
The deployment is failing because the database is missing `receiptUrl` and `transactionId` columns.

## Solution: Apply Migration Manually on Render

### Step 1: Access Your Database on Render

1. Go to https://dashboard.render.com
2. Find your **PostgreSQL** or **MySQL** database service (not the web service)
3. Click on it to open the database dashboard

### Step 2: Open Database Console

1. Click on the **"Connect"** or **"Query"** tab
2. Or use the **"Shell"** tab if available

### Step 3: Run the Migration SQL

**For PostgreSQL (most common on Render):**
```sql
ALTER TABLE "ServiceRequest" 
ADD COLUMN "receiptUrl" VARCHAR(191) NULL,
ADD COLUMN "transactionId" VARCHAR(191) NULL;
```

**For MySQL:**
```sql
ALTER TABLE `ServiceRequest` 
ADD COLUMN `receiptUrl` VARCHAR(191) NULL,
ADD COLUMN `transactionId` VARCHAR(191) NULL;
```

### Step 4: Verify the Migration

Run this query to verify:
```sql
-- PostgreSQL
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'ServiceRequest' 
AND column_name IN ('receiptUrl', 'transactionId');

-- MySQL
DESCRIBE ServiceRequest;
```

### Step 5: Redeploy Your Service

After applying the migration:
1. Go back to your web service on Render
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. The deployment should now succeed

## Alternative: Update Build Command (If Migration Fails)

If you want to make the build more resilient, update your Render build command to:

```
cd backend && npm install && npx prisma generate && npm run build
```

**Note:** This skips migrations during build. You'll need to apply them manually (as shown above) or run them separately.

## Troubleshooting

### If you can't find your database:
- Check your Render dashboard for a separate database service
- It might be named something like "PostgreSQL" or "MySQL"
- Look in the "Databases" section

### If the SQL fails:
- Make sure you're connected to the correct database
- Check that the table name matches exactly (case-sensitive for PostgreSQL)
- Verify you have ALTER TABLE permissions

### If deployment still fails:
1. Check the Render logs for the exact error
2. Make sure the DATABASE_URL environment variable is set correctly
3. Verify Prisma Client is generated correctly

