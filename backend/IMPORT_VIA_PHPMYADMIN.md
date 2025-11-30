# Import Database Schema via phpMyAdmin

Since you can't connect from your local machine, here's how to set up the database using phpMyAdmin:

## Step 1: Enable Remote MySQL Access (Recommended)

1. In Hostinger Control Panel → **Databases** → **Management**
2. Click on your database `u905810677_alobricolage`
3. Look for **"Remote MySQL"** or **"Access Hosts"** section
4. Add your public IP address (check at https://whatismyipaddress.com/)
5. Enable remote access

Then update your local `.env`:
```env
DATABASE_URL="mysql://u905810677_adminbrico:ALObricolage11@auth-db1657.hstgr.io:3306/u905810677_alobricolage"
```

And run:
```bash
cd backend
npx prisma db push
```

## Step 2: Alternative - Use phpMyAdmin SQL Tab

If remote access isn't available, you can run Prisma commands via SSH or manually create tables.

**To find your public IP for remote access:**
- Visit: https://whatismyipaddress.com/
- Copy your IPv4 address
- Add it to Hostinger's Remote MySQL access list

## Current Status

✅ Schema updated for MySQL  
✅ Prisma client generated  
✅ .env configured  
⏳ Waiting for remote MySQL access to be enabled

Once remote access is enabled, run:
```bash
cd backend
npx prisma db push
```

