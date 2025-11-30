# How to Export Your Database from Hostinger

## Method 1: Export via phpMyAdmin (Easiest)

1. **Go to phpMyAdmin:**
   - In Hostinger Control Panel → **Databases** → **phpMyAdmin**
   - Or go directly to: https://auth-db1657.hstgr.io

2. **Select your database:**
   - Click on `u905810677_alobricolage` in the left sidebar

3. **Export the database:**
   - Click on the **"Export"** tab at the top
   - Select **"Quick"** export method
   - Format: **SQL**
   - Click **"Go"** button

4. **Save the file:**
   - A file named `u905810677_alobricolage.sql` will be downloaded
   - Save it in your project folder: `/Users/ilyasmoktary/Documents/foryou/backend/`

## Method 2: Export via Command Line (mysqldump)

If you have SSH access to Hostinger, you can use:

```bash
mysqldump -u u905810677_adminbrico -p u905810677_alobricolage > database_backup.sql
```

## Method 3: Export via Prisma

You can also use Prisma to export:

```bash
cd backend
npx prisma db pull  # This creates a schema from your database
```

But this only exports the schema, not the data.

## What You'll Get

The SQL file will contain:
- All table structures
- All data (if you select "Export" with data)
- Can be imported back to restore the database

## Import the Database Later

To import the SQL file back:

1. Go to phpMyAdmin
2. Select your database
3. Click **"Import"** tab
4. Choose your `.sql` file
5. Click **"Go"**

