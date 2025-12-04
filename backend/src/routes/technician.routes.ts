import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { upload, getFileUrl } from '../utils/fileUpload';

const router = express.Router();

// Get all approved technicians (public)
router.get('/available', async (req, res) => {
  try {
    const { city, category, skills, onlineOnly } = req.query;

    const where: any = {
      verificationStatus: 'APPROVED',
    };

    // Only filter by online status if explicitly requested
    if (onlineOnly === 'true') {
      where.isOnline = true;
    }

    if (city) {
      where.user = { city: city as string };
    }

    // Find category record if category filter is provided
    let categoryRecord = null;
    if (category) {
      categoryRecord = await prisma.serviceCategory.findFirst({
        where: {
          OR: [
            { id: category as string },
            { name: { contains: category as string } },
          ],
        },
      });

      if (categoryRecord) {
        // For MySQL JSON arrays, try Prisma's 'has' filter
        where.skills = { has: categoryRecord.name } as any;
      }
    }

    if (skills) {
      const skillArray = (skills as string).split(',');
      where.skills = { hasSome: skillArray };
    }

    let technicians = await prisma.technicianProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
          },
        },
        documents: {
          select: {
            id: true,
            type: true,
            fileUrl: true,
          },
        },
        subscriptions: {
          where: {
            status: 'ACTIVE',
            endDate: { gte: new Date() },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        averageRating: 'desc',
      },
    });

    // If category filter was applied, ensure it worked by filtering in memory as fallback
    if (categoryRecord) {
      // Filter in memory to ensure category match (fallback if Prisma filter didn't work)
      technicians = technicians.filter((tech: any) => {
        const skills = Array.isArray(tech.skills) ? tech.skills : JSON.parse(tech.skills || '[]');
        return skills.includes(categoryRecord!.name);
      });
    }

    // Ensure profilePictureUrl is included in response
    technicians.forEach((tech: any) => {
      if (!tech.profilePictureUrl) {
        tech.profilePictureUrl = null;
      }
    });

    // Sort: Premium users first, then by rating
    technicians.sort((a, b) => {
      const aIsPremium = a.subscriptions?.[0]?.plan === 'PREMIUM';
      const bIsPremium = b.subscriptions?.[0]?.plan === 'PREMIUM';
      
      if (aIsPremium && !bIsPremium) return -1;
      if (!aIsPremium && bIsPremium) return 1;
      
      return b.averageRating - a.averageRating;
    });

    res.json(technicians);
  } catch (error: any) {
    console.error('Get available technicians error:', error);
    res.status(500).json({ error: 'Failed to get technicians' });
  }
});

// Get technician by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const technician = await prisma.technicianProfile.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
          },
        },
        documents: {
          select: {
            id: true,
            type: true,
            fileUrl: true,
          },
        },
        bookings: {
          where: {
            status: 'COMPLETED',
          },
          select: {
            id: true,
          },
        },
        subscriptions: {
          where: {
            status: 'ACTIVE',
            endDate: { gte: new Date() },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    // Ensure profilePictureUrl is included
    const response = {
      ...technician,
      profilePictureUrl: technician.profilePictureUrl || null,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Get technician error:', error);
    res.status(500).json({ error: 'Failed to get technician' });
  }
});

// Create/Update technician profile (requires TECHNICIAN role)
router.post(
  '/profile',
  authenticate,
  authorize('TECHNICIAN'),
  upload.fields([
    { name: 'documents', maxCount: 10 },
    { name: 'profilePicture', maxCount: 1 },
  ]),
  [
    body('skills').isArray().withMessage('Skills must be an array'),
    body('yearsOfExperience').isInt({ min: 0 }).withMessage('Years of experience must be a positive integer'),
    body('hourlyRate').optional().isFloat({ min: 0 }),
    body('basePrice').optional().isFloat({ min: 0 }),
    body('bio').optional().isString(),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { skills, yearsOfExperience, hourlyRate, basePrice, bio } = req.body;
      const userId = req.user!.userId;

      // Check if profile exists
      const existingProfile = await prisma.technicianProfile.findUnique({
        where: { userId },
      });

      // Handle profile picture upload
      const profilePictureFile = (req.files as { [fieldname: string]: Express.Multer.File[] })?.['profilePicture']?.[0];
      const profilePictureUrl = profilePictureFile 
        ? getFileUrl(profilePictureFile.filename, 'profile-pictures')
        : existingProfile?.profilePictureUrl || null;

      // Handle document uploads
      const documentFiles = req.files as { [fieldname: string]: Express.Multer.File[] };
      const documents = documentFiles?.documents || [];

      const documentData = documents.map((file, index) => ({
        type: req.body[`documentType_${index}`] || 'OTHER',
        fileUrl: getFileUrl(file.filename, 'documents'),
      }));

      if (existingProfile) {
        // Update existing profile
        const profile = await prisma.technicianProfile.update({
          where: { userId },
          data: {
            skills: JSON.parse(skills),
            yearsOfExperience: parseInt(yearsOfExperience),
            hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
            basePrice: basePrice ? parseFloat(basePrice) : null,
            bio,
            profilePictureUrl,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                city: true,
              },
            },
            documents: true,
          },
        });

        // Add new documents
        if (documentData.length > 0) {
          await prisma.technicianDocument.createMany({
            data: documentData.map(doc => ({
              technicianProfileId: profile.id,
              type: doc.type,
              fileUrl: doc.fileUrl,
            })),
          });
        }

        res.json({
          ...profile,
          profilePictureUrl: profile.profilePictureUrl,
        });
      } else {
        // Create new profile
        const profile = await prisma.technicianProfile.create({
          data: {
            userId,
            skills: JSON.parse(skills),
            yearsOfExperience: parseInt(yearsOfExperience),
            hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
            basePrice: basePrice ? parseFloat(basePrice) : null,
            bio,
            profilePictureUrl,
            documents: {
              create: documentData.map(doc => ({
                type: doc.type,
                fileUrl: doc.fileUrl,
              })),
            },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                city: true,
              },
            },
            documents: true,
          },
        });

        res.status(201).json({
          ...profile,
          profilePictureUrl: profile.profilePictureUrl,
        });
      }
    } catch (error: any) {
      console.error('Create/Update technician profile error:', error);
      res.status(500).json({ error: 'Failed to create/update profile' });
    }
  }
);

// Get my technician profile
router.get('/profile/me', authenticate, authorize('TECHNICIAN'), async (req, res) => {
  try {
    const profile = await prisma.technicianProfile.findUnique({
      where: { userId: req.user!.userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
          },
        },
        documents: true,
        bookings: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Technician profile not found' });
    }

    res.json({
      ...profile,
      profilePictureUrl: profile.profilePictureUrl,
    });
  } catch (error: any) {
    console.error('Get my profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Toggle online status
router.patch('/profile/online', authenticate, authorize('TECHNICIAN'), async (req, res) => {
  try {
    const { isOnline } = req.body;

    const profile = await prisma.technicianProfile.update({
      where: { userId: req.user!.userId },
      data: { isOnline: Boolean(isOnline) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
          },
        },
      },
    });

    res.json(profile);
  } catch (error: any) {
    console.error('Toggle online status error:', error);
    res.status(500).json({ error: 'Failed to update online status' });
  }
});

export { router as technicianRouter };

