import { PrismaClient } from '@prisma/client';

// Create a fresh PrismaClient instance
// This ensures it uses the current DATABASE_URL from environment
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Test connection on startup
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    if (error.message.includes('Postgres.app')) {
      console.error('');
      console.error('⚠️  Postgres.app is blocking Node.js connections!');
      console.error('   You MUST configure Postgres.app:');
      console.error('   1. Open Postgres.app');
      console.error('   2. Right-click your PostgreSQL server');
      console.error('   3. Click "Settings" → "App Permissions"');
      console.error('   4. Click "+" and add: /usr/local/bin/node');
      console.error('   5. Save and restart the backend');
      console.error('');
    }
  });

export default prisma;

