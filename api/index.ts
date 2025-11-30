// @ts-ignore - Vercel serverless function
import express from 'express';
// @ts-ignore
import cors from 'cors';
// @ts-ignore
import dotenv from 'dotenv';
// @ts-ignore
import path from 'path';
// @ts-ignore
import cookieParser from 'cookie-parser';

// Import routes from compiled backend
// @ts-ignore
import { fileRouter } from '../backend/dist/routes/file.routes';
// @ts-ignore
import { authRouter } from '../backend/dist/routes/auth.routes';
// @ts-ignore
import { userRouter } from '../backend/dist/routes/user.routes';
// @ts-ignore
import { technicianRouter } from '../backend/dist/routes/technician.routes';
// @ts-ignore
import { categoryRouter } from '../backend/dist/routes/category.routes';
// @ts-ignore
import { bookingRouter } from '../backend/dist/routes/booking.routes';
// @ts-ignore
import { reviewRouter } from '../backend/dist/routes/review.routes';
// @ts-ignore
import { adminRouter } from '../backend/dist/routes/admin.routes';
// @ts-ignore
import { notificationRouter } from '../backend/dist/routes/notification.routes';
// @ts-ignore
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

// Export the Express app as a serverless function
export default app;

