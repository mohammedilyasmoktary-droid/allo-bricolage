# Add receiptUrl and transactionId Columns to ServiceRequest

## Problem
The database is missing the `receiptUrl` and `transactionId` columns that were added to the Prisma schema for payment functionality.

## Solution
Run the following SQL migration on your database:

```sql
ALTER TABLE `ServiceRequest` 
ADD COLUMN `receiptUrl` VARCHAR(191) NULL,
ADD COLUMN `transactionId` VARCHAR(191) NULL;
```

## How to Apply

### Option 1: Using MySQL Command Line
```bash
mysql -u your_username -p your_database_name < backend/prisma/migrations/add_receipt_url_transaction_id_manual/migration.sql
```

### Option 2: Using phpMyAdmin or MySQL Workbench
1. Open phpMyAdmin or MySQL Workbench
2. Select your database (`u905810677_alobricolage`)
3. Go to SQL tab
4. Copy and paste the SQL from `backend/prisma/migrations/add_receipt_url_transaction_id_manual/migration.sql`
5. Execute the query

### Option 3: Using Prisma (if you have direct database access)
```bash
cd backend
npx prisma db push
```

## Verification
After running the migration, verify the columns exist:
```sql
DESCRIBE ServiceRequest;
```

You should see `receiptUrl` and `transactionId` in the column list.

