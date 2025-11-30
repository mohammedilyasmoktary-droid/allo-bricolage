# Allo Bricolage - Setup Guide

## Quick Start

### 1. Database Setup

First, make sure PostgreSQL is running and create a database:

```sql
CREATE DATABASE allo_bricolage;
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your DATABASE_URL
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/allo_bricolage?schema=public"
JWT_ACCESS_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## Default Users (After Seeding)

- **Admin**: admin@allobricolage.ma / admin123
- **Technician**: ahmed@technician.ma / technician123
- **Client**: client@example.ma / client123

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/       # Auth middleware
│   │   ├── utils/           # JWT, file upload
│   │   ├── config/          # Database config
│   │   └── scripts/         # Seed script
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── uploads/             # File uploads (local)
│
└── frontend/
    └── src/
        ├── pages/           # Page components
        ├── components/      # Reusable components
        ├── api/             # API client
        └── contexts/        # React contexts
```

## Key Features Implemented

✅ User authentication (JWT with refresh tokens)
✅ Role-based access control (CLIENT, TECHNICIAN, ADMIN)
✅ Technician registration with document upload
✅ Service category management
✅ Booking system with status tracking
✅ Payment method selection (UI ready, gateway integration pending)
✅ Review and rating system
✅ File upload (local storage, S3-ready)
✅ Admin dashboard and management
✅ Notification system

## Payment Integration Points

The application is designed to easily integrate payment gateways:

1. **Card Payment**: See `backend/src/routes/booking.routes.ts` - Add gateway call before marking as PAID
2. **Wafacash**: Add Wafacash API call in booking creation flow
3. **Bank Transfer**: Currently manual admin confirmation, can add webhook handler

## SMS Integration Points

For SMS notifications (e.g., Twilio):

1. See `backend/src/routes/booking.routes.ts` - Add SMS send after booking creation
2. See `backend/src/routes/admin.routes.ts` - Add SMS when technician is verified
3. Create `backend/src/utils/sms.ts` with SMS service abstraction

## File Storage Migration to S3

To migrate from local storage to S3:

1. Install AWS SDK: `npm install @aws-sdk/client-s3`
2. Update `backend/src/utils/fileUpload.ts`:
   - Replace `multer.diskStorage` with S3 storage
   - Update `getFileUrl()` to return S3 URLs
   - Update `deleteFile()` to use S3 delete

## Troubleshooting

### Database Connection Issues
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure database exists

### CORS Errors
- Check FRONTEND_URL in backend .env matches frontend URL
- Verify credentials: true in CORS config

### File Upload Issues
- Ensure uploads/ directory exists
- Check file size limits
- Verify multer configuration

## Next Steps

1. Integrate real payment gateways
2. Add SMS notifications
3. Implement real-time updates (WebSocket)
4. Add mobile app (React Native)
5. Deploy to production

