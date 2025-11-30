#!/bin/bash

# Script to update DATABASE_URL in .env file
# Usage: ./update-env.sh YOUR_PASSWORD HOST

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./update-env.sh YOUR_PASSWORD HOST"
    echo "Example: ./update-env.sh mypassword123 localhost"
    echo "Example: ./update-env.sh mypassword123 auth-db1657.hstgr.io"
    exit 1
fi

PASSWORD="$1"
HOST="$2"
DATABASE_URL="mysql://u905810677_adminbrico:${PASSWORD}@${HOST}:3306/u905810677_alobricolage"

# Update .env file
if [ -f .env ]; then
    # Replace DATABASE_URL if it exists
    if grep -q "DATABASE_URL=" .env; then
        sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"${DATABASE_URL}\"|" .env
        echo "✅ DATABASE_URL updated in .env"
    else
        echo "DATABASE_URL=\"${DATABASE_URL}\"" >> .env
        echo "✅ DATABASE_URL added to .env"
    fi
    echo ""
    echo "📝 Updated connection string:"
    echo "DATABASE_URL=\"${DATABASE_URL}\""
    echo ""
    echo "Next steps:"
    echo "  1. Run: npx prisma generate"
    echo "  2. Run: npx prisma db push"
else
    echo "❌ .env file not found!"
    exit 1
fi

