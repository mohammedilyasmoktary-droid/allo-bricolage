import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';

// Import routes from compiled backend
import { fileRouter } from '../backend/dist/routes/file.routes';
import { authRouter } from '../backend/dist/routes/auth.routes';
import { userRouter } from '../backend/dist/routes/user.routes';
import { technicianRouter } from '../backend/dist/routes/technician.routes';
import { categoryRouter } from '../backend/dist/routes/category.routes';
import { bookingRouter } from '../backend/dist/routes/booking.routes';
import { reviewRouter } from '../backend/dist/routes/review.routes';
import { adminRouter } from '../backend/dist/routes/admin.routes';
import { notificationRouter } from '../backend/dist/routes/notification.routes';
import { subscriptionRouter } from '../backend/dist/routes/subscription.routes';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically (if they exist)
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.join(__dirname, '..', uploadDir)));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Allo Bricolage API is running' });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/technicians', technicianRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/subscriptions', subscriptionRouter);
app.use('/api/files', fileRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Export as Vercel serverless function
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};

