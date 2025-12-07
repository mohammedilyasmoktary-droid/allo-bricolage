/**
 * Script to apply database migration for receiptUrl and transactionId columns
 * Run this script on Render to add missing columns to ServiceRequest table
 * 
 * Usage: npx tsx src/scripts/apply-migration.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('🔧 Starting migration: Adding receiptUrl and transactionId columns...');
    
    // Check if columns already exist by trying to query them
    try {
      const test = await prisma.$queryRaw`
        SELECT receiptUrl, transactionId 
        FROM ServiceRequest 
        LIMIT 1
      `;
      console.log('✅ Columns already exist! Migration not needed.');
      return;
    } catch (error: any) {
      // If columns don't exist, we'll get an error, which is expected
      if (error.message?.includes('receiptUrl') || error.message?.includes('transactionId')) {
        console.log('📝 Columns do not exist. Applying migration...');
      } else {
        throw error;
      }
    }

    // Apply migration using raw SQL
    await prisma.$executeRaw`
      ALTER TABLE ServiceRequest 
      ADD COLUMN receiptUrl VARCHAR(191) NULL,
      ADD COLUMN transactionId VARCHAR(191) NULL
    `;

    console.log('✅ Migration applied successfully!');
    console.log('✅ receiptUrl and transactionId columns added to ServiceRequest table.');
    
  } catch (error: any) {
    if (error.message?.includes('Duplicate column name')) {
      console.log('✅ Columns already exist. Migration not needed.');
    } else {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration()
  .then(() => {
    console.log('🎉 Migration script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });

