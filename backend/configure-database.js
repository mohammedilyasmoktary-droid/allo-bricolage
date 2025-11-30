#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function configureDatabase() {
  console.log('\n🔧 Hostinger MySQL Database Configuration\n');
  console.log('Current database info:');
  console.log('  - Database: u905810677_alobricolage');
  console.log('  - Username: u905810677_adminbrico');
  console.log('  - Port: 3306\n');

  // Get password
  const password = await question('Enter your database password: ');
  
  // Get host
  console.log('\nHost options:');
  console.log('  1. localhost (if on Hostinger server)');
  console.log('  2. auth-db1657.hstgr.io (from phpMyAdmin URL)');
  console.log('  3. Custom host');
  const hostChoice = await question('\nEnter host (1, 2, or custom address): ');
  
  let host;
  if (hostChoice === '1') {
    host = 'localhost';
  } else if (hostChoice === '2') {
    host = 'auth-db1657.hstgr.io';
  } else {
    host = hostChoice.trim();
  }

  // Build connection string
  const databaseUrl = `mysql://u905810677_adminbrico:${password}@${host}:3306/u905810677_alobricolage`;
  
  console.log('\n📝 Generated connection string:');
  console.log(`DATABASE_URL="${databaseUrl}"\n`);

  // Update .env file
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found!');
    rl.close();
    return;
  }

  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace DATABASE_URL if it exists, otherwise add it
  if (envContent.includes('DATABASE_URL=')) {
    envContent = envContent.replace(
      /DATABASE_URL=.*/,
      `DATABASE_URL="${databaseUrl}"`
    );
  } else {
    envContent += `\nDATABASE_URL="${databaseUrl}"\n`;
  }

  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ .env file updated successfully!\n');
  
  console.log('Next steps:');
  console.log('  1. Run: npx prisma generate');
  console.log('  2. Run: npx prisma db push\n');
  
  rl.close();
}

configureDatabase().catch(console.error);

