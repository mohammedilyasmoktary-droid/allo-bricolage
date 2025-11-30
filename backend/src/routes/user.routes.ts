import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { upload, getFileUrl } from '../utils/fileUpload';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const prisma = require('../config/database').default;
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
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', upload.single('profilePicture'), async (req, res) => {
  try {
    const prisma = require('../config/database').default;
    const { name, phone, city } = req.body;

    const updateData: any = {};

    // Only update fields that are provided and not empty
    if (name !== undefined && name.trim() !== '') {
      updateData.name = name.trim();
    }
    if (phone !== undefined && phone.trim() !== '') {
      updateData.phone = phone.trim();
    }
    if (city !== undefined && city.trim() !== '') {
      updateData.city = city.trim();
    }

    // Handle profile picture upload
    if (req.file && req.file.fieldname === 'profilePicture') {
      updateData.profilePictureUrl = getFileUrl(req.file.filename, 'profile-pictures');
    }

    // If no fields to update, return current user
    if (Object.keys(updateData).length === 0) {
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
        },
      });
      return res.json(user);
    }

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        role: true,
        profilePictureUrl: true,
      },
    });

    res.json(user);
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
});

export { router as userRouter };

