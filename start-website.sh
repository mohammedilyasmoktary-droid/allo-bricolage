#!/bin/bash

echo "🚀 Starting Allo Bricolage Website..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo "📊 Checking PostgreSQL..."
if command -v pg_isready &> /dev/null; then
    if pg_isready -h localhost -p 5432 &> /dev/null; then
        echo -e "${GREEN}✅ PostgreSQL is running${NC}"
    else
        echo -e "${RED}❌ PostgreSQL is NOT running${NC}"
        echo ""
        echo "Please start PostgreSQL first:"
        echo "1. Open Postgres.app from Applications (if installed)"
        echo "2. Or run: brew services start postgresql"
        echo "3. Or install from: https://postgresapp.com/"
        echo ""
        read -p "Press Enter after starting PostgreSQL, or Ctrl+C to exit..."
    fi
else
    echo -e "${YELLOW}⚠️  pg_isready not found - checking if PostgreSQL is accessible...${NC}"
    # Try to connect directly
    if psql -h localhost -p 5432 -U postgres -d postgres -c "SELECT 1;" &> /dev/null; then
        echo -e "${GREEN}✅ PostgreSQL is accessible${NC}"
    else
        echo -e "${RED}❌ Cannot connect to PostgreSQL${NC}"
        echo ""
        echo "Please start PostgreSQL first:"
        echo "1. Open Postgres.app from Applications (if installed)"
        echo "2. Or run: brew services start postgresql"
        echo "3. Or install from: https://postgresapp.com/"
        echo ""
        read -p "Press Enter after starting PostgreSQL, or Ctrl+C to exit..."
    fi
fi

echo ""
echo "📦 Updating database schema..."
cd backend

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file${NC}"
    else
        echo -e "${RED}❌ .env.example not found. Please create .env manually.${NC}"
        exit 1
    fi
fi

# Run Prisma commands
echo "Running Prisma db push..."
npx prisma db push

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database schema updated${NC}"
else
    echo -e "${RED}❌ Failed to update database schema${NC}"
    echo "Make sure PostgreSQL is running and DATABASE_URL in .env is correct"
    exit 1
fi

echo "Generating Prisma client..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Prisma client generated${NC}"
else
    echo -e "${RED}❌ Failed to generate Prisma client${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Database setup complete!${NC}"
echo ""
echo "🌐 Starting servers..."
echo ""
echo "Backend will run on: http://localhost:5001"
echo "Frontend will run on: http://localhost:5173"
echo ""
echo "Opening in new terminals..."
echo ""

# Start backend in background
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

# Wait a bit for backend to start
sleep 3

# Start frontend in background
cd ../frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"

echo ""
echo -e "${GREEN}✅ Both servers are starting!${NC}"
echo ""
echo "📝 Logs:"
echo "  Backend:  tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop servers:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🌐 Website: http://localhost:5173"
echo ""
echo "Waiting 5 seconds for servers to start..."
sleep 5

# Try to open browser
if command -v open &> /dev/null; then
    open http://localhost:5173
    echo -e "${GREEN}✅ Opened browser${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Website should be running!${NC}"
echo ""




