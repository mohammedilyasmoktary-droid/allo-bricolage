#!/bin/bash

# Database Setup Script for Allo Bricolage
# This script attempts to set up the PostgreSQL database automatically

set -e

echo "🔧 Allo Bricolage - Database Setup"
echo "==================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for PostgreSQL
check_postgres() {
    echo "Checking for PostgreSQL..."
    
    # Try different ways to find PostgreSQL
    if command -v psql &> /dev/null; then
        PSQL_CMD="psql"
        echo -e "${GREEN}✅ Found psql command${NC}"
        return 0
    elif [ -f "/usr/local/bin/psql" ]; then
        PSQL_CMD="/usr/local/bin/psql"
        echo -e "${GREEN}✅ Found psql at /usr/local/bin/psql${NC}"
        return 0
    elif [ -f "/opt/homebrew/bin/psql" ]; then
        PSQL_CMD="/opt/homebrew/bin/psql"
        echo -e "${GREEN}✅ Found psql at /opt/homebrew/bin/psql${NC}"
        return 0
    else
        echo -e "${RED}❌ PostgreSQL (psql) not found${NC}"
        return 1
    fi
}

# Try to connect to PostgreSQL
test_connection() {
    echo ""
    echo "Testing PostgreSQL connection..."
    
    # Read DATABASE_URL from .env
    if [ ! -f "backend/.env" ]; then
        echo -e "${RED}❌ backend/.env file not found!${NC}"
        return 1
    fi
    
    # Extract connection details from DATABASE_URL
    # Format: postgresql://user:password@host:port/database
    DB_URL=$(grep "^DATABASE_URL=" backend/.env | cut -d '=' -f2 | tr -d '"')
    
    if [ -z "$DB_URL" ]; then
        echo -e "${RED}❌ DATABASE_URL not found in backend/.env${NC}"
        return 1
    fi
    
    # Try to connect (this will fail if PostgreSQL is not running, but that's okay)
    if $PSQL_CMD "$DB_URL" -c "SELECT 1;" &> /dev/null; then
        echo -e "${GREEN}✅ Successfully connected to PostgreSQL${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Could not connect to PostgreSQL${NC}"
        echo "This might mean:"
        echo "  - PostgreSQL is not running"
        echo "  - Wrong credentials in DATABASE_URL"
        echo "  - Database doesn't exist yet"
        return 1
    fi
}

# Create database if it doesn't exist
create_database() {
    echo ""
    echo "Creating database if it doesn't exist..."
    
    # Extract database name from DATABASE_URL
    DB_URL=$(grep "^DATABASE_URL=" backend/.env | cut -d '=' -f2 | tr -d '"')
    
    # Parse the URL to get components
    # Format: postgresql://user:password@host:port/database
    DB_NAME=$(echo "$DB_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
    
    # Get connection string without database name (to connect to postgres database)
    DB_URL_NO_DB=$(echo "$DB_URL" | sed "s|/$DB_NAME|/postgres|")
    
    # Check if database exists
    if $PSQL_CMD "$DB_URL_NO_DB" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        echo -e "${GREEN}✅ Database '$DB_NAME' already exists${NC}"
    else
        echo "Creating database '$DB_NAME'..."
        if $PSQL_CMD "$DB_URL_NO_DB" -c "CREATE DATABASE $DB_NAME;" &> /dev/null; then
            echo -e "${GREEN}✅ Database '$DB_NAME' created successfully${NC}"
        else
            echo -e "${RED}❌ Failed to create database${NC}"
            return 1
        fi
    fi
}

# Run Prisma migrations
run_migrations() {
    echo ""
    echo "Running Prisma migrations..."
    cd backend
    
    if npm run prisma:generate; then
        echo -e "${GREEN}✅ Prisma client generated${NC}"
    else
        echo -e "${RED}❌ Failed to generate Prisma client${NC}"
        cd ..
        return 1
    fi
    
    if npm run prisma:migrate; then
        echo -e "${GREEN}✅ Database migrations completed${NC}"
    else
        echo -e "${RED}❌ Failed to run migrations${NC}"
        cd ..
        return 1
    fi
    
    cd ..
}

# Seed the database
seed_database() {
    echo ""
    echo "Seeding database with initial data..."
    cd backend
    
    if npm run seed; then
        echo -e "${GREEN}✅ Database seeded successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Seeding failed or skipped (this is okay if data already exists)${NC}"
    fi
    
    cd ..
}

# Main execution
main() {
    # Check for PostgreSQL
    if ! check_postgres; then
        echo ""
        echo -e "${RED}PostgreSQL is not installed or not in PATH.${NC}"
        echo ""
        echo "To install PostgreSQL on macOS:"
        echo "  1. Install Homebrew (if not installed):"
        echo "     /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        echo ""
        echo "  2. Install PostgreSQL:"
        echo "     brew install postgresql@14"
        echo ""
        echo "  3. Start PostgreSQL:"
        echo "     brew services start postgresql@14"
        echo ""
        echo "  4. Create a database user (optional, defaults work):"
        echo "     createuser -s postgres"
        echo ""
        echo "Alternatively, you can:"
        echo "  - Use Docker: docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:14"
        echo "  - Use a cloud database service (Supabase, Neon, etc.)"
        echo ""
        exit 1
    fi
    
    # Test connection
    if ! test_connection; then
        echo ""
        echo -e "${YELLOW}⚠️  Could not connect to PostgreSQL${NC}"
        echo ""
        echo "Please ensure:"
        echo "  1. PostgreSQL is running"
        echo "  2. The DATABASE_URL in backend/.env is correct"
        echo ""
        echo "To start PostgreSQL:"
        echo "  - If installed via Homebrew: brew services start postgresql@14"
        echo "  - If installed via Postgres.app: Open the app"
        echo "  - If using Docker: docker start postgres"
        echo ""
        echo "Once PostgreSQL is running, run this script again."
        echo ""
        exit 1
    fi
    
    # Create database
    if ! create_database; then
        echo ""
        echo -e "${RED}Failed to create database. Please check your PostgreSQL permissions.${NC}"
        exit 1
    fi
    
    # Run migrations
    if ! run_migrations; then
        echo ""
        echo -e "${RED}Failed to run migrations. Please check the error messages above.${NC}"
        exit 1
    fi
    
    # Seed database
    seed_database
    
    echo ""
    echo -e "${GREEN}✅ Database setup complete!${NC}"
    echo ""
    echo "You can now start the application:"
    echo "  Terminal 1: cd backend && npm run dev"
    echo "  Terminal 2: cd frontend && npm run dev"
    echo ""
    echo "Test accounts:"
    echo "  Admin: admin@allobricolage.ma / admin123"
    echo "  Technician: ahmed@technician.ma / technician123"
    echo "  Client: client@example.ma / client123"
    echo ""
}

main


