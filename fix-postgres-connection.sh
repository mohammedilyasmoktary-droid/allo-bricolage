#!/bin/bash

echo "🔧 Fixing Postgres.app Connection"
echo "=================================="
echo ""

# Stop backend
echo "1. Stopping backend server..."
pkill -f "tsx watch" 2>/dev/null
sleep 2

# Update DATABASE_URL to use postgres user
echo "2. Updating database connection..."
cd "$(dirname "$0")/backend"
sed -i '' 's|DATABASE_URL=.*|DATABASE_URL="postgresql://postgres@localhost:5432/allo_bricolage?schema=public"|' .env
echo "✅ Updated to use 'postgres' user"

# Test connection
echo ""
echo "3. Testing connection..."
node -e "
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => {
    console.log('✅ Connection successful!');
    return prisma.user.findMany({ take: 1 });
  })
  .then(() => {
    console.log('✅ Database query works!');
    process.exit(0);
  })
  .catch(e => {
    console.log('❌ Connection failed:', e.message.split('\\n')[0]);
    console.log('');
    console.log('📝 You need to configure Postgres.app:');
    echo '   1. Open Postgres.app';
    echo '   2. Click on your server';
    echo '   3. Go to Settings → App Permissions';
    echo '   4. Add Node.js: /usr/local/bin/node or /opt/homebrew/bin/node';
    echo '   5. Restart this script';
    process.exit(1);
  });
" 2>&1

if [ $? -eq 0 ]; then
  echo ""
  echo "4. Starting backend server..."
  npm run dev > /tmp/backend.log 2>&1 &
  sleep 3
  
  if curl -s http://localhost:5001/health > /dev/null; then
    echo "✅ Backend is running!"
    echo ""
    echo "🎉 Setup complete! You can now:"
    echo "   - Login at: http://localhost:5173"
    echo "   - Test accounts:"
    echo "     Admin: admin@allobricolage.ma / admin123"
    echo "     Technician: ahmed@technician.ma / technician123"
    echo "     Client: client@example.ma / client123"
  else
    echo "⚠️  Backend started but health check failed"
  fi
fi






