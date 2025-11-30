# How to Check if Dependencies are Installed

## Quick Check Methods

### Method 1: Check if `node_modules` folders exist

```bash
# Check backend
ls -d backend/node_modules 2>/dev/null && echo "✅ Backend dependencies installed" || echo "❌ Backend dependencies missing"

# Check frontend
ls -d frontend/node_modules 2>/dev/null && echo "✅ Frontend dependencies installed" || echo "❌ Frontend dependencies missing"
```

### Method 2: List installed packages

```bash
# Backend packages
cd backend && npm list --depth=0

# Frontend packages
cd frontend && npm list --depth=0
```

### Method 3: Check specific packages

```bash
# Check if a specific package is installed (backend example)
cd backend && npm list express prisma @prisma/client

# Check if a specific package is installed (frontend example)
cd frontend && npm list react react-router-dom @mui/material
```

### Method 4: Verify package.json matches installed packages

```bash
# This will show any missing packages
cd backend && npm install --dry-run
cd frontend && npm install --dry-run
```

## Current Status ✅

Based on the check, your dependencies are **already installed**:

### Backend Dependencies ✅
- ✅ `node_modules` folder exists
- ✅ All packages from `package.json` are installed:
  - Express, Prisma, JWT, bcryptjs, multer, etc.

### Frontend Dependencies ✅
- ✅ `node_modules` folder exists
- ✅ All packages from `package.json` are installed:
  - React, Material UI, React Router, Axios, etc.

## If Dependencies are Missing

If you find that dependencies are missing, install them:

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

## Verify Installation After Installing

After running `npm install`, you can verify by:

1. **Check the folder exists:**
   ```bash
   test -d backend/node_modules && echo "Installed" || echo "Missing"
   ```

2. **Check package count:**
   ```bash
   ls backend/node_modules | wc -l  # Should show many packages
   ```

3. **Try importing in code:**
   ```bash
   cd backend && node -e "require('express')" && echo "Express works!"
   ```






