#!/bin/bash
# Auto-apply migration script

echo "🔄 Applying database migration..."

cd "$(dirname "$0")"

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ .env file not found!"
  exit 1
fi

# Source .env to get DATABASE_URL
export $(grep -v '^#' .env | xargs)

echo "📦 Generating Prisma Client..."
npx prisma generate

echo ""
echo "✅ Prisma Client generated!"
echo ""
echo "📝 IMPORTANT: You need to complete the migration in your terminal."
echo ""
echo "In the terminal where you see the Prisma prompt:"
echo "  1. Type: y"
echo "  2. Press: Enter"
echo ""
echo "After migration completes, run:"
echo "  npm run seed"
echo ""
echo "Then restart your backend server."






