import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    // Try to query a simple table
    const userCount = await prisma.user.count();
    console.log(`✅ Database connected! Found ${userCount} users.`);
    
    // Check if subscription tables exist
    try {
      const subCount = await prisma.$queryRaw`SELECT COUNT(*) FROM "Subscription"`;
      console.log('✅ Subscription table exists');
    } catch (e: any) {
      if (e.code === 'P2021' || e.message?.includes('does not exist')) {
        console.log('❌ Subscription table does not exist - migration needed');
      }
    }
    
    // List all users
    const users = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
      },
    });
    
    console.log('\n📋 Users in database:');
    users.forEach(u => {
      console.log(`  - ${u.email} (${u.role})`);
    });
    
  } catch (error: any) {
    if (error.code === 'P2021') {
      console.log('❌ Database tables do not exist!');
      console.log('📝 You need to run the migration first.');
      console.log('   In your terminal, type: y (to reset and apply schema)');
    } else {
      console.error('❌ Database error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();






