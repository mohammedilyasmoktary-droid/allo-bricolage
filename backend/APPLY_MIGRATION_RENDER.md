# Apply Database Migration on Render

## Problem
The database is missing the `receiptUrl` and `transactionId` columns in the `ServiceRequest` table.

## Solution

### Option 1: Using Render Database Console (Easiest)

1. **Go to your Render Dashboard**
   - Navigate to https://dashboard.render.com
   - Find your database service (PostgreSQL or MySQL)

2. **Open the Database Console**
   - Click on your database service
   - Click on "Connect" or "Shell" tab
   - Or use "Query" if available

3. **Run the Migration SQL**
   ```sql
   ALTER TABLE "ServiceRequest" 
   ADD COLUMN "receiptUrl" VARCHAR(191) NULL,
   ADD COLUMN "transactionId" VARCHAR(191) NULL;
   ```
   
   **Note:** If using PostgreSQL, use double quotes. If using MySQL, use backticks:
   ```sql
   ALTER TABLE `ServiceRequest` 
   ADD COLUMN `receiptUrl` VARCHAR(191) NULL,
   ADD COLUMN `transactionId` VARCHAR(191) NULL;
   ```

4. **Verify the columns were added**
   ```sql
   -- For PostgreSQL:
   \d "ServiceRequest"
   
   -- For MySQL:
   DESCRIBE ServiceRequest;
   ```

### Option 2: Using Prisma Migrate (Recommended)

1. **Set up your environment**
   - Make sure you have your `DATABASE_URL` environment variable set
   - You can find it in your Render database service settings

2. **Run Prisma migrate locally (if you have database access)**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

3. **Or use Prisma db push (for development)**
   ```bash
   cd backend
   npx prisma db push
   ```

### Option 3: Using Render Shell/SSH

1. **Connect to your Render service via Shell**
   - Go to your backend service on Render
   - Click on "Shell" tab
   - Or use SSH if configured

2. **Run the migration**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

### Option 4: Add Migration Script to Render Build

You can also add a migration step to your Render build command:

1. **Update your Render build command** to:
   ```bash
   cd backend && npm install && npx prisma generate && npx prisma migrate deploy && npm run build
   ```

2. **Or create a post-deploy script** that runs migrations automatically

## Quick Fix: Update Build Command on Render

1. Go to your backend service on Render
2. Go to "Settings"
3. Update "Build Command" to:
   ```
   cd backend && npm install && npx prisma generate && npx prisma migrate deploy && npm run build
   ```
4. Update "Start Command" to:
   ```
   cd backend && npm start
   ```

## Verify Migration Success

After applying the migration, check your Render logs to ensure:
- No errors about missing columns
- Booking creation works
- The columns exist in the database

## Troubleshooting

If you get permission errors:
- Make sure your database user has ALTER TABLE permissions
- Check your DATABASE_URL connection string
- Verify you're connecting to the correct database

