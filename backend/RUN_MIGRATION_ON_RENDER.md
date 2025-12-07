# Run Migration Automatically on Render

## Option 1: Automatic Migration (Recommended)

The migration will now run automatically after each build! The `postbuild` script will execute the migration.

**Just redeploy your service on Render:**
1. Go to your Render dashboard
2. Click on your "allo-bricolage" web service
3. Click "Manual Deploy" → "Deploy latest commit"
4. The migration will run automatically during deployment

## Option 2: Run Migration Manually via Render Shell

If you want to run it manually:

1. Go to your Render dashboard
2. Click on your "allo-bricolage" web service
3. Click on the **"Shell"** tab
4. Run this command:
   ```bash
   cd backend && npm run apply-migration
   ```

## Option 3: Update Build Command (If needed)

If automatic migration doesn't work, update your Render build command to:

```
cd backend && npm install && npx prisma generate && npm run apply-migration && npm run build
```

## What the Migration Does

The script will:
- ✅ Check if columns already exist (won't fail if they do)
- ✅ Add `receiptUrl` column to `ServiceRequest` table
- ✅ Add `transactionId` column to `ServiceRequest` table
- ✅ Support both MySQL and PostgreSQL automatically
- ✅ Provide clear success/error messages

## Verify Migration Success

After deployment, check your Render logs. You should see:
```
✅ Migration applied successfully!
✅ receiptUrl and transactionId columns added to ServiceRequest table.
```

Or if columns already exist:
```
✅ Columns already exist! Migration not needed.
```

