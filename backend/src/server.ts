import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileRouter } from './routes/file.routes';
import { authRouter } from './routes/auth.routes';
import { userRouter } from './routes/user.routes';
import { technicianRouter } from './routes/technician.routes';
import { categoryRouter } from './routes/category.routes';
import { bookingRouter } from './routes/booking.routes';
import { reviewRouter } from './routes/review.routes';
import { adminRouter } from './routes/admin.routes';
import { notificationRouter } from './routes/notification.routes';
import { subscriptionRouter } from './routes/subscription.routes';
import { applyReceiptColumnsMigration } from './utils/migration';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS configuration - allow multiple origins for production
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://allo-bricolage.vercel.app',
  'https://www.allo-bricolage.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, true); // Allow all origins in production for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.join(__dirname, '..', uploadDir)));

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Allo Bricolage API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Allo Bricolage API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Temporary public endpoint to seed database (REMOVE AFTER USE)
app.get('/api/seed', async (req, res) => {
  try {
    console.log('🌱 Starting database seed via API...');
    
    // Import and run seed function
    const { seedDatabase } = await import('./scripts/seed');
    
    // Run seed in background to avoid timeout
    seedDatabase()
      .then(() => {
        console.log('✅ Seed completed successfully');
      })
      .catch((error) => {
        console.error('❌ Seed failed:', error);
      });
    
    // Return immediately to avoid timeout
    res.json({ 
      success: true, 
      message: 'Database seed started. This may take 2-3 minutes. Check Render logs for progress.'
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    res.status(500).json({ 
      error: 'Failed to start seed',
      message: error.message
    });
  }
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

app.listen(PORT, () => {
  console.log(`🚀 Allo Bricolage API server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${path.join(__dirname, '..', uploadDir)}`);
});

