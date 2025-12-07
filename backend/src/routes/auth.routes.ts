import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { authenticate } from '../middleware/auth.middleware';
import { upload, getFileUrl } from '../utils/fileUpload';

const router = express.Router();

// Register
// Support both old format (single nationalIdCard) and new format (multiple documents array)
// Use upload.any() to handle dynamic field names like documents[0][file], documents[1][file], etc.
router.post(
  '/register',
  upload.any(),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('role').optional().isIn(['CLIENT', 'TECHNICIAN']).withMessage('Invalid role'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, phone, password, city, role = 'CLIENT', serviceCategory } = req.body;
      const allFiles = (req.files as Express.Multer.File[]) || [];
      
      // Parse documents from FormData format: documents[0][file], documents[1][file], etc.
      const documents: Array<{ file: Express.Multer.File; type: string }> = [];
      const nationalIdCardFile = allFiles.find(f => f.fieldname === 'nationalIdCard');
      
      // Extract documents from array format
      for (let i = 0; i < 20; i++) { // Support up to 20 documents
        const fileField = `documents[${i}][file]`;
        const typeField = `documents[${i}][type]`;
        const file = allFiles.find(f => f.fieldname === fileField);
        const type = req.body[typeField];
        
        if (file && type) {
          documents.push({ file, type });
        }
      }

      // Validate national ID card for technicians
      const hasCIN = !!nationalIdCardFile || documents.some(doc => doc.type === 'CIN');
      
      if (role === 'TECHNICIAN' && !hasCIN) {
        return res.status(400).json({ error: 'La carte nationale est requise pour les techniciens' });
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          phone,
          passwordHash,
          city,
          role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          role: true,
          createdAt: true,
        },
      });

      // If technician, create technician profile and documents
      if (role === 'TECHNICIAN') {
        // Auto-approve verification when ANY document is uploaded (CIN, Diploma, Certificate, or Other)
        // This allows all document types to trigger auto-approval, not just CIN
        const hasAnyDocument = hasCIN || documents.length > 0;

        const technicianProfile = await prisma.technicianProfile.create({
          data: {
            userId: user.id,
            skills: [],
            yearsOfExperience: 0,
            // Auto-approve if any document is uploaded
            verificationStatus: hasAnyDocument ? 'APPROVED' : 'PENDING',
          },
        });

        // Helper function to map document type from frontend to Prisma enum
        const mapDocumentType = (type: string): 'ID_CARD' | 'DIPLOMA' | 'CERTIFICATE' | 'OTHER' => {
          switch (type) {
            case 'CIN':
              return 'ID_CARD';
            case 'DIPLOMA':
              return 'DIPLOMA';
            case 'CERTIFICATE':
              return 'CERTIFICATE';
            case 'OTHER':
              return 'OTHER';
            default:
              return 'OTHER';
          }
        };

        // Create documents from new format (documents array)
        // Auto-approve verification when any document is uploaded (not just CIN)
        // This allows all document types (CIN, DIPLOMA, CERTIFICATE, OTHER) to trigger auto-approval
        if (documents.length > 0) {
          for (const doc of documents) {
            const fileUrl = getFileUrl(doc.file.filename, 'documents');
            
            await prisma.technicianDocument.create({
              data: {
                technicianProfileId: technicianProfile.id,
                type: mapDocumentType(doc.type),
                fileUrl,
              },
            });
          }
        }

        // Create national ID card document if file was uploaded (old format for backward compatibility)
        // Only create if not already in documents array
        if (nationalIdCardFile && !documents.some(doc => doc.type === 'CIN')) {
          const fileUrl = getFileUrl(nationalIdCardFile.filename, 'documents');
          await prisma.technicianDocument.create({
            data: {
              technicianProfileId: technicianProfile.id,
              type: 'ID_CARD',
              fileUrl,
            },
          });
        }

        // Create notification for auto-approval when any document is uploaded
        if (hasAnyDocument) {
          const documentTypes = documents.map(doc => {
            switch (doc.type) {
              case 'CIN': return 'CIN';
              case 'DIPLOMA': return 'diplôme';
              case 'CERTIFICATE': return 'certificat';
              case 'OTHER': return 'document';
              default: return 'document';
            }
          }).join(', ');
          
          await prisma.notification.create({
            data: {
              userId: user.id,
              type: 'VERIFICATION_APPROVED',
              message: `Votre compte technicien a été approuvé automatiquement après l'upload de votre${documents.length > 1 ? 's' : ''} ${documentTypes}.`,
            },
          });
        }
      }

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        user,
        accessToken,
      });
    } catch (error: any) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Get full user data including profile picture
      const userData = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          role: true,
          profilePictureUrl: true,
          createdAt: true,
        },
      });

      res.json({
        user: userData,
        accessToken,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error stack:', error.stack);
      console.error('Error details:', JSON.stringify(error, null, 2));
      res.status(500).json({ 
        error: 'Failed to login',
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    }
  }
);

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    const { verifyRefreshToken } = require('../utils/jwt');
    const payload = verifyRefreshToken(refreshToken);

    // Verify user still exists
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new access token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);

    res.json({ accessToken });
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout', authenticate, (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        role: true,
        profilePictureUrl: true,
        createdAt: true,
        technicianProfile: {
          select: {
            id: true,
            skills: true,
            yearsOfExperience: true,
            hourlyRate: true,
            basePrice: true,
            bio: true,
            profilePictureUrl: true,
            verificationStatus: true,
            averageRating: true,
            isOnline: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Forgot password - Request password reset
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;

      // Find user
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        // Don't reveal if user exists for security
        return res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

      // Delete any existing reset tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      // Create new reset token
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt,
        },
      });

      // In production, send email with reset link
      // For now, we'll return the token in development mode
      // In production, you would send an email like:
      // await sendPasswordResetEmail(user.email, resetToken);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Password reset token for ${email}: ${resetToken}`);
        console.log(`Reset link: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`);
      }

      res.json({ 
        message: 'If an account exists with this email, a password reset link has been sent.',
        // Only include token in development
        ...(process.env.NODE_ENV === 'development' && { 
          resetToken,
          resetLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`
        })
      });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Failed to process password reset request' });
    }
  }
);

// Reset password - Set new password with token
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token, password } = req.body;

      // Find reset token
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!resetToken) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      // Check if token is used
      if (resetToken.used) {
        return res.status(400).json({ error: 'This reset token has already been used' });
      }

      // Check if token is expired
      if (new Date() > resetToken.expiresAt) {
        return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(password, 10);

      // Update user password
      await prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      });

      // Mark token as used
      await prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      });

      res.json({ message: 'Password has been reset successfully' });
    } catch (error: any) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }
);

export { router as authRouter };

