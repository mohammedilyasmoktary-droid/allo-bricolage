#!/bin/bash

# Allo Bricolage - Quick Start Script
# This script helps you get the application running for preview

echo "🚀 Allo Bricolage - Quick Start"
echo "================================"
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found!"
    echo "Creating backend/.env from template..."
    cat > backend/.env << EOF
DATABASE_URL="postgresql://postgres:password@localhost:5432/allo_bricolage?schema=public"
JWT_ACCESS_SECRET=dev-secret-key-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
FRONTEND_URL=http://localhost:5173
EOF
    echo "✅ Created backend/.env - Please update DATABASE_URL with your PostgreSQL credentials"
fi

if [ ! -f "frontend/.env" ]; then
    echo "Creating frontend/.env..."
    echo "VITE_API_URL=http://localhost:5000/api" > frontend/.env
    echo "✅ Created frontend/.env"
fi

# Check if node_modules exist
if [ ! -d "backend/node_modules" ]; then
    echo ""
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo ""
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Make sure PostgreSQL is running"
echo "2. Update backend/.env with your DATABASE_URL"
echo "3. Run database setup:"
echo "   cd backend"
echo "   npm run prisma:generate"
echo "   npm run prisma:migrate"
echo "   npm run seed"
echo ""
echo "4. Start the servers:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo "5. Open http://localhost:5173 in your browser"
echo ""
echo "Test accounts (after seeding):"
echo "  Admin: admin@allobricolage.ma / admin123"
echo "  Technician: ahmed@technician.ma / technician123"
echo "  Client: client@example.ma / client123"

