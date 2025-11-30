#!/bin/bash

echo "🔍 Testing Login Issue"
echo "======================"
echo ""

cd "$(dirname "$0")/backend"

# Test 1: Check if database connection works
echo "1. Testing database connection..."
node -e "
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findUnique({ where: { email: 'admin@allobricolage.ma' } })
  .then(u => {
    console.log('   ✅ Database connection works');
    process.exit(0);
  })
  .catch(e => {
    if (e.message.includes('Postgres.app')) {
      console.log('   ❌ Postgres.app is blocking connections');
      console.log('');
      console.log('   TO FIX:');
      console.log('   1. Open Postgres.app');
      console.log('   2. Right-click your server -> Settings');
      console.log('   3. Go to App Permissions');
      console.log('   4. Click + and add: /usr/local/bin/node');
      console.log('   5. Save and restart backend');
      process.exit(1);
    } else {
      console.log('   ❌ Error:', e.message.split('\\n')[0]);
      process.exit(1);
    }
  });
" 2>&1

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Database connection failed. Please configure Postgres.app first."
  exit 1
fi

# Test 2: Check if login endpoint works
echo ""
echo "2. Testing login endpoint..."

# Stop any running backend
pkill -f "tsx watch" 2>/dev/null
sleep 2

# Start backend
echo "   Starting backend server..."
npm run dev > /tmp/backend-test.log 2>&1 &
BACKEND_PID=$!
sleep 4

# Test login
RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@allobricolage.ma","password":"admin123"}')

if echo "$RESPONSE" | grep -q "accessToken"; then
  echo "   ✅ Login endpoint works!"
  echo ""
  echo "🎉 Everything is working! You can now login."
  kill $BACKEND_PID 2>/dev/null
  exit 0
else
  echo "   ❌ Login endpoint failed"
  echo ""
  echo "Response: $RESPONSE" | head -3
  echo ""
  
  # Check backend logs
  if tail -20 /tmp/backend-test.log | grep -q "Postgres.app"; then
    echo "⚠️  Postgres.app is still blocking the server connection"
    echo ""
    echo "The issue is that Postgres.app needs to allow Node.js."
    echo "Even though direct tests work, the server process is blocked."
    echo ""
    echo "SOLUTION:"
    echo "1. Open Postgres.app"
    echo "2. Right-click your PostgreSQL server"
    echo "3. Click 'Settings' → 'App Permissions'"
    echo "4. Add Node.js: /usr/local/bin/node"
    echo "5. Save and run this script again"
  fi
  
  kill $BACKEND_PID 2>/dev/null
  exit 1
fi

