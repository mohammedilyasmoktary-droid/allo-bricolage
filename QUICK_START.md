# Quick Start - Preview the Application

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 2: Setup Database

Make sure PostgreSQL is running, then:

```bash
# Create database (in psql or pgAdmin)
CREATE DATABASE allo_bricolage;

# Or use this command:
createdb allo_bricolage
```

## Step 3: Configure Environment

### Backend
Create `backend/.env`:
```env
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
```

### Frontend
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

## Step 4: Setup Database Schema

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

## Step 5: Start the Application

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Backend will run on: http://localhost:5000

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on: http://localhost:5173

## Step 6: Access the Application

Open your browser and go to: **http://localhost:5173**

## Test Accounts

After seeding, you can login with:

- **Admin**: admin@allobricolage.ma / admin123
- **Technician**: ahmed@technician.ma / technician123  
- **Client**: client@example.ma / client123

## What to Test

1. **Home Page**: Landing page with features
2. **Register**: Create a new client or technician account
3. **Login**: Use test accounts above
4. **Client Flow**:
   - Search technicians
   - Create a booking
   - View bookings
   - Rate technician
5. **Technician Flow**:
   - View dashboard
   - Accept/decline requests
   - Update job status
   - Manage profile
6. **Admin Flow**:
   - View dashboard stats
   - Verify technicians
   - Manage bookings

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in backend/.env
- Ensure database exists

### Port Already in Use
- Change PORT in backend/.env
- Update VITE_API_URL in frontend/.env accordingly

### CORS Errors
- Ensure FRONTEND_URL in backend/.env matches frontend URL
- Check both servers are running
