# How to Find Your Database Connection Details on Hostinger

## Step 1: Get Connection Details from Hostinger Panel

1. Go to **Hostinger Control Panel** → **Databases** → **Management**
2. Find your database `u905810677_alobricolage` in the list
3. Click on it or look for connection details
4. You should see:
   - **Host/Server**: The actual host address
   - **Port**: Usually 3306
   - **Database Name**: Full database name
   - **Username**: Full username (might be different format)
   - **Password**: The one you created

## Step 2: Check phpMyAdmin Connection

In phpMyAdmin, look at the top where it shows:
- **Server**: This is your host
- The URL might also give clues about the host

## Step 3: Common Issues

### Issue 1: Username Format
The username might be:
- `u905810677_adminbrico` (with prefix)
- `adminbrico` (without prefix)
- Or a different format

### Issue 2: Host Address
The host might be:
- `localhost` (if accessing from Hostinger server)
- `mysql.hostinger.com`
- `auth-db1657.hstgr.io`
- Or a specific IP address

### Issue 3: Remote Access
If connecting from your local machine, you might need to:
1. Enable remote MySQL access in Hostinger panel
2. Add your IP address to allowed hosts
3. Or use SSH tunneling

## Step 4: Update .env

Once you have the correct details, update your `.env`:

```env
DATABASE_URL="mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME"
```

Then run:
```bash
npx prisma db push
```

## Alternative: Use Hostinger's Database Manager

Some Hostinger plans include a database manager that shows the exact connection string. Look for:
- **Database Manager** or **phpMyAdmin** → **Variables** or **Connection Info**

