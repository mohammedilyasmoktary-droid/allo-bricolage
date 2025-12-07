/**
 * Migration utility to add receiptUrl and transactionId columns
 * This runs automatically on server startup
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function applyReceiptColumnsMigration(): Promise<void> {
  try {
    console.log('🔧 Checking database schema...');
    
    // Check if columns already exist by trying to query them
    try {
      await prisma.$queryRaw`
        SELECT receiptUrl, transactionId 
        FROM ServiceRequest 
        LIMIT 1
      `;
      console.log('✅ receiptUrl and transactionId columns already exist.');
      return;
    } catch (error: any) {
      // If columns don't exist, we'll get an error, which is expected
      if (error.message?.includes('receiptUrl') || 
          error.message?.includes('transactionId') ||
          error.message?.includes('Unknown column')) {
        console.log('📝 Columns do not exist. Applying migration...');
      } else {
        // Some other error, log it but don't fail
        console.warn('⚠️ Could not check columns (this is OK):', error.message);
        return;
      }
    }

    // Apply migration using raw SQL
    // Try MySQL syntax first (backticks)
    try {
      await prisma.$executeRaw`
        ALTER TABLE \`ServiceRequest\` 
        ADD COLUMN \`receiptUrl\` VARCHAR(191) NULL,
        ADD COLUMN \`transactionId\` VARCHAR(191) NULL
      `;
      console.log('✅ Migration applied successfully (MySQL syntax)!');
      console.log('✅ receiptUrl and transactionId columns added to ServiceRequest table.');
    } catch (mysqlError: any) {
      // If MySQL syntax fails, try PostgreSQL syntax (double quotes)
      if (mysqlError.message?.includes('syntax') || 
          mysqlError.message?.includes('near') ||
          mysqlError.message?.includes('relation') ||
          mysqlError.code === '42601') {
        console.log('📝 Trying PostgreSQL syntax...');
        try {
          await prisma.$executeRaw`
            ALTER TABLE "ServiceRequest" 
            ADD COLUMN "receiptUrl" VARCHAR(191) NULL,
            ADD COLUMN "transactionId" VARCHAR(191) NULL
          `;
          console.log('✅ Migration applied successfully (PostgreSQL syntax)!');
          console.log('✅ receiptUrl and transactionId columns added to ServiceRequest table.');
        } catch (pgError: any) {
          if (pgError.message?.includes('already exists') || 
              pgError.message?.includes('duplicate')) {
            console.log('✅ Columns already exist (PostgreSQL).');
          } else {
            console.warn('⚠️ Migration failed (PostgreSQL):', pgError.message);
            // Don't throw - let server start anyway
          }
        }
      } else if (mysqlError.message?.includes('Duplicate column name') ||
                 mysqlError.message?.includes('already exists')) {
        console.log('✅ Columns already exist (MySQL).');
      } else {
        console.warn('⚠️ Migration failed (MySQL):', mysqlError.message);
        // Don't throw - let server start anyway
      }
    }
    
  } catch (error: any) {
    // Don't fail server startup if migration fails
    console.warn('⚠️ Migration check failed (server will continue):', error.message);
  }
}

