# Quick Setup Summary

## ✅ What's Already Done

- ✅ Backend dependencies installed
- ✅ Frontend dependencies installed  
- ✅ Environment files configured
- ✅ Database setup scripts created
- ✅ Docker Compose file created

## ⚠️ What You Need to Do

**PostgreSQL needs to be installed and running.**

### Easiest Option: Use Docker (if you have Docker Desktop)

```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Wait a few seconds, then run database setup
./setup-database.sh
```

### Alternative: Install PostgreSQL via Homebrew

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL
brew services start postgresql@14

# Run database setup
./setup-database.sh
```

### Or Use the Automated Script

The automated script will guide you through installing Homebrew and PostgreSQL:

```bash
./auto-setup.sh
```

## After PostgreSQL is Running

Once PostgreSQL is set up, you can start the application:

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

Then open: http://localhost:5173

## Test Accounts

- **Admin**: `admin@allobricolage.ma` / `admin123`
- **Technician**: `ahmed@technician.ma` / `technician123`
- **Client**: `client@example.ma` / `client123`

---

**Need more help?** See `SETUP_INSTRUCTIONS.md` for detailed instructions and troubleshooting.







