#!/bin/bash

echo "🔧 Fixing PostgreSQL Connection Permissions"
echo "============================================"
echo ""

HBA_FILE="/Users/ilyasmoktary/Library/Application Support/Postgres/var-18/pg_hba.conf"

if [ ! -f "$HBA_FILE" ]; then
    echo "❌ HBA file not found at: $HBA_FILE"
    echo "Please check the path in Postgres.app Server Settings"
    exit 1
fi

echo "1. Backing up current configuration..."
cp "$HBA_FILE" "$HBA_FILE.backup"
echo "✅ Backup created: $HBA_FILE.backup"

echo ""
echo "2. Checking current configuration..."
if grep -q "host.*all.*all.*127.0.0.1/32.*trust" "$HBA_FILE"; then
    echo "✅ Configuration already allows localhost connections"
else
    echo "3. Adding localhost connection permission..."
    
    # Check if there's a line for IPv4 local connections
    if grep -q "^host.*all.*all.*127.0.0.1/32" "$HBA_FILE"; then
        # Replace existing line with trust
        sed -i '' 's/^host.*all.*all.*127.0.0.1\/32.*$/host    all             all             127.0.0.1\/32            trust/' "$HBA_FILE"
        echo "✅ Updated existing localhost line to use 'trust'"
    else
        # Add new line for localhost
        echo "" >> "$HBA_FILE"
        echo "# Allow localhost connections (added by fix script)" >> "$HBA_FILE"
        echo "host    all             all             127.0.0.1/32            trust" >> "$HBA_FILE"
        echo "✅ Added localhost connection permission"
    fi
fi

echo ""
echo "4. Current localhost configuration:"
grep "127.0.0.1/32" "$HBA_FILE" | head -3

echo ""
echo "✅ Configuration updated!"
echo ""
echo "📝 NEXT STEPS:"
echo "1. Go to Postgres.app"
echo "2. Click 'Stop' to stop the server"
echo "3. Click 'Start' to restart the server"
echo "4. The connection should now work!"
echo ""
echo "After restarting, test with:"
echo "  cd backend && npm run dev"






