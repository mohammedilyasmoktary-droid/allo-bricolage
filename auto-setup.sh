#!/bin/bash

# Automated Setup Script for Allo Bricolage
# This script attempts to install and set up everything automatically

set -e

echo "🚀 Allo Bricolage - Automated Setup"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Homebrew is installed
check_brew() {
    if command -v brew &> /dev/null; then
        echo -e "${GREEN}✅ Homebrew is installed${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Homebrew is not installed${NC}"
        return 1
    fi
}

# Install Homebrew
install_brew() {
    echo ""
    echo "Installing Homebrew..."
    echo "This may require your password and take a few minutes..."
    echo ""
    
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for Apple Silicon Macs
    if [ -f "/opt/homebrew/bin/brew" ]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
        eval "$(/opt/homebrew/bin/brew shellenv)"
    elif [ -f "/usr/local/bin/brew" ]; then
        echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zshrc
        eval "$(/usr/local/bin/brew shellenv)"
    fi
}

# Check if PostgreSQL is installed
check_postgres() {
    if command -v psql &> /dev/null; then
        echo -e "${GREEN}✅ PostgreSQL is installed${NC}"
        psql --version
        return 0
    else
        echo -e "${YELLOW}⚠️  PostgreSQL is not installed${NC}"
        return 1
    fi
}

# Install PostgreSQL via Homebrew
install_postgres() {
    echo ""
    echo "Installing PostgreSQL via Homebrew..."
    echo "This may take several minutes..."
    echo ""
    
    brew install postgresql@14
    
    # Add to PATH
    echo 'export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"' >> ~/.zshrc
    echo 'export PATH="/usr/local/opt/postgresql@14/bin:$PATH"' >> ~/.zshrc
    export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH" 2>/dev/null || export PATH="/usr/local/opt/postgresql@14/bin:$PATH"
}

# Start PostgreSQL service
start_postgres() {
    echo ""
    echo "Starting PostgreSQL service..."
    
    if brew services start postgresql@14 2>/dev/null; then
        echo -e "${GREEN}✅ PostgreSQL service started${NC}"
        
        # Wait a bit for PostgreSQL to be ready
        echo "Waiting for PostgreSQL to be ready..."
        sleep 5
        return 0
    else
        echo -e "${YELLOW}⚠️  Could not start PostgreSQL service automatically${NC}"
        echo "You may need to start it manually: brew services start postgresql@14"
        return 1
    fi
}

# Create database user (if needed)
setup_db_user() {
    echo ""
    echo "Setting up database user..."
    
    # Try to create postgres user (may fail if it exists, which is fine)
    createuser -s postgres 2>/dev/null || echo "User 'postgres' already exists or using default user"
}

# Main setup function
main() {
    # Step 1: Check/Install Homebrew
    if ! check_brew; then
        echo ""
        echo "Homebrew is required to install PostgreSQL."
        echo "Would you like to install Homebrew now? (This requires your password)"
        echo ""
        read -p "Install Homebrew? (y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_brew
            # Reload shell environment
            if [ -f "/opt/homebrew/bin/brew" ]; then
                eval "$(/opt/homebrew/bin/brew shellenv)"
            elif [ -f "/usr/local/bin/brew" ]; then
                eval "$(/usr/local/bin/brew shellenv)"
            fi
        else
            echo ""
            echo -e "${RED}Setup cancelled. Please install Homebrew manually and run this script again.${NC}"
            echo "Or see SETUP_INSTRUCTIONS.md for alternative PostgreSQL installation methods."
            exit 1
        fi
    fi
    
    # Step 2: Check/Install PostgreSQL
    if ! check_postgres; then
        echo ""
        read -p "Install PostgreSQL? (y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_postgres
        else
            echo ""
            echo -e "${YELLOW}Skipping PostgreSQL installation.${NC}"
            echo "Please install PostgreSQL manually and run ./setup-database.sh"
            exit 1
        fi
    fi
    
    # Step 3: Start PostgreSQL
    start_postgres
    
    # Step 4: Setup database user
    setup_db_user
    
    # Step 5: Run database setup
    echo ""
    echo "Running database setup..."
    echo ""
    
    if ./setup-database.sh; then
        echo ""
        echo -e "${GREEN}✅ All setup complete!${NC}"
        echo ""
        echo "You can now start the application:"
        echo "  Terminal 1: cd backend && npm run dev"
        echo "  Terminal 2: cd frontend && npm run dev"
        echo ""
    else
        echo ""
        echo -e "${YELLOW}⚠️  Database setup had some issues.${NC}"
        echo "Please check the error messages above and see SETUP_INSTRUCTIONS.md for help."
        echo ""
    fi
}

# Run main function
main







