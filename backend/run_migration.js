const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function runMigration() {
  try {
    console.log('Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('\n✅ Prisma Client generated successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. In your terminal where Prisma is asking, type: y');
    console.log('2. After migration completes, run: npm run seed');
    console.log('3. Restart backend server');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

runMigration();
