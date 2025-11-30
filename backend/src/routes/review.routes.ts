import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Create review
router.post(
  '/',
  authenticate,
  [
    body('bookingId').notEmpty().withMessage('Booking ID is required'),
    body('revieweeId').notEmpty().withMessage('Reviewee ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { bookingId, revieweeId, rating, comment } = req.body;
      const reviewerId = req.user!.userId;

      // Verify booking exists and is completed
      const booking = await prisma.serviceRequest.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (booking.status !== 'COMPLETED') {
        return res.status(400).json({ error: 'Can only review completed bookings' });
      }

      if (booking.paymentStatus !== 'PAID') {
        return res.status(400).json({ error: 'Can only review paid bookings' });
      }

      // Verify reviewer has access to this booking
      if (booking.clientId !== reviewerId && booking.technicianId !== reviewerId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Verify reviewee is part of this booking
      if (booking.clientId !== revieweeId && booking.technicianId !== revieweeId) {
        return res.status(400).json({ error: 'Invalid reviewee' });
      }

      // Check if review already exists
      const existingReview = await prisma.review.findUnique({
        where: {
          bookingId_reviewerId: {
            bookingId,
            reviewerId,
          },
        },
      });

      if (existingReview) {
        return res.status(400).json({ error: 'Review already exists for this booking' });
      }

      // Create review
      const review = await prisma.review.create({
        data: {
          bookingId,
          reviewerId,
          revieweeId,
          rating: parseInt(rating),
          comment: comment || null,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
            },
          },
          reviewee: {
            select: {
              id: true,
              name: true,
            },
          },
          booking: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      // Update technician average rating if reviewee is a technician
      const reviewee = await prisma.user.findUnique({
        where: { id: revieweeId },
        include: { technicianProfile: true },
      });

      if (reviewee?.technicianProfile) {
        const allReviews = await prisma.review.findMany({
          where: { revieweeId },
        });

        const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await prisma.technicianProfile.update({
          where: { userId: revieweeId },
          data: { averageRating },
        });
      }

      res.status(201).json(review);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Review already exists for this booking' });
      }
      console.error('Create review error:', error);
      res.status(500).json({ error: 'Failed to create review' });
    }
  }
);

// Get reviews for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { revieweeId: req.params.userId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
        booking: {
          select: {
            id: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reviews);
  } catch (error: any) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

// Get all reviews (public endpoint for homepage)
router.get('/', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            name: true,
          },
        },
        booking: {
          select: {
            id: true,
            photos: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to latest 50 reviews
    });

    // Format response with reviewer/reviewee names and booking photos
    const formattedReviews = reviews.map((review) => ({
      ...review,
      reviewerName: review.reviewer.name,
      revieweeName: review.reviewee.name,
      bookingPhotos: review.booking.photos,
    }));

    res.json(formattedReviews);
  } catch (error: any) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

// Get reviews for a booking
router.get('/booking/:bookingId', authenticate, async (req, res) => {
  try {
    const booking = await prisma.serviceRequest.findUnique({
      where: { id: req.params.bookingId },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check access
    const userId = req.user!.userId;
    if (booking.clientId !== userId && booking.technicianId !== userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const reviews = await prisma.review.findMany({
      where: { bookingId: req.params.bookingId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(reviews);
  } catch (error: any) {
    console.error('Get booking reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

export { router as reviewRouter };

