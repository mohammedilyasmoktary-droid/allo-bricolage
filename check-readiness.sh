#!/bin/bash
echo "🔍 Checking if you can run the app..."
echo ""

# Check dependencies
if [ -d "backend/node_modules" ] && [ -d "frontend/node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Dependencies missing - run: cd backend && npm install && cd ../frontend && npm install"
    exit 1
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL installed"
    if pg_isready -h localhost -p 5432 &> /dev/null; then
        echo "✅ PostgreSQL is running"
    else
        echo "⚠️  PostgreSQL installed but not running"
        echo "   Start it with: brew services start postgresql@14"
        echo "   Or: docker-compose up -d"
    fi
else
    echo "❌ PostgreSQL not installed"
    echo "   See RUN_NOW.md for installation options"
    exit 1
fi

# Check database
if [ -d "backend/prisma/migrations" ]; then
    echo "✅ Database migrations exist"
else
    echo "⚠️  Database not set up yet"
    echo "   Run: ./setup-database.sh"
fi

echo ""
echo "If all checks pass, you can run:"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"
