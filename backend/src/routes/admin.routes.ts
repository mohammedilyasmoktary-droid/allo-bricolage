import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// All admin routes require ADMIN role
router.use(authenticate);
router.use(authorize('ADMIN'));

// Get all technicians with verification status
router.get('/technicians', async (req, res) => {
  try {
    const technicians = await prisma.technicianProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            createdAt: true,
          },
        },
        documents: true,
        bookings: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(technicians);
  } catch (error: any) {
    console.error('Get technicians error:', error);
    res.status(500).json({ error: 'Failed to get technicians' });
  }
});

// Update technician verification status
router.patch(
  '/technicians/:id/verify',
  [
    body('verificationStatus').isIn(['PENDING', 'APPROVED', 'REJECTED']).withMessage('Invalid status'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { verificationStatus } = req.body;

      const technician = await prisma.technicianProfile.findUnique({
        where: { id: req.params.id },
        include: { user: true },
      });

      if (!technician) {
        return res.status(404).json({ error: 'Technician not found' });
      }

      const updated = await prisma.technicianProfile.update({
        where: { id: req.params.id },
        data: { verificationStatus },
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

      // Notify technician
      await prisma.notification.create({
        data: {
          userId: technician.userId,
          type: verificationStatus === 'APPROVED' ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED',
          message: `Your verification status has been ${verificationStatus.toLowerCase()}`,
        },
      });

      res.json(updated);
    } catch (error: any) {
      console.error('Update verification status error:', error);
      res.status(500).json({ error: 'Failed to update verification status' });
    }
  }
);

// Delete technician (ADMIN only)
router.delete('/technicians/:id', async (req, res) => {
  try {
    const technician = await prisma.technicianProfile.findUnique({
      where: { id: req.params.id },
      include: { user: true },
    });

    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    // Delete related data first (cascade delete should handle this, but being explicit)
    await prisma.serviceRequest.deleteMany({
      where: { technicianId: technician.id },
    });

    await prisma.review.deleteMany({
      where: { revieweeId: technician.id },
    });

    await prisma.document.deleteMany({
      where: { technicianProfileId: technician.id },
    });

    await prisma.subscription.deleteMany({
      where: { technicianProfileId: technician.id },
    });

    // Delete technician profile
    await prisma.technicianProfile.delete({
      where: { id: req.params.id },
    });

    // Delete user account
    await prisma.user.delete({
      where: { id: technician.userId },
    });

    res.json({ message: 'Technician deleted successfully' });
  } catch (error: any) {
    console.error('Delete technician error:', error);
    res.status(500).json({ error: 'Failed to delete technician' });
  }
});

// Get all bookings
router.get('/bookings', async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const bookings = await prisma.serviceRequest.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
          },
        },
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
          },
        },
        technicianProfile: {
          select: {
            id: true,
            skills: true,
            averageRating: true,
          },
        },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookings);
  } catch (error: any) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

// Update payment status (ADMIN only) - Restricted to prevent unauthorized payment confirmation
router.patch(
  '/bookings/:id/payment',
  [
    body('paymentStatus').isIn(['UNPAID', 'PENDING', 'PAID']).withMessage('Invalid payment status'),
    body('reason').optional().isString().withMessage('Reason is required when marking as PAID'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { paymentStatus, reason } = req.body;

      const booking = await prisma.serviceRequest.findUnique({
        where: { id: req.params.id },
        include: { client: true, technician: true },
      });

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Require reason when marking as PAID to ensure proper verification
      if (paymentStatus === 'PAID' && !reason) {
        return res.status(400).json({ 
          error: 'Reason is required when marking payment as PAID. This ensures proper payment verification.' 
        });
      }

      // Log admin action for audit trail
      console.log(`[ADMIN] Payment status updated by admin ${req.user!.userId} for booking ${req.params.id}: ${paymentStatus}. Reason: ${reason || 'N/A'}`);

      const updated = await prisma.serviceRequest.update({
        where: { id: req.params.id },
        data: { 
          paymentStatus,
          status: paymentStatus === 'PAID' ? 'COMPLETED' : booking.status,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          technician: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          category: true,
        },
      });

      // Notify both parties
      if (paymentStatus === 'PAID') {
        await prisma.notification.createMany({
          data: [
            {
              userId: booking.clientId,
              type: 'PAYMENT_CONFIRMED',
              message: 'Your payment has been confirmed by admin',
            },
            {
              userId: booking.technicianId!,
              type: 'PAYMENT_CONFIRMED',
              message: 'Payment for your booking has been confirmed by admin',
            },
          ],
        });
      }

      res.json(updated);
    } catch (error: any) {
      console.error('Update payment status error:', error);
      res.status(500).json({ error: 'Failed to update payment status' });
    }
  }
);

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalTechnicians,
      pendingTechnicians,
      totalBookings,
      completedBookings,
      totalRevenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.technicianProfile.count(),
      prisma.technicianProfile.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.serviceRequest.count(),
      prisma.serviceRequest.count({ where: { status: 'COMPLETED' } }),
      prisma.serviceRequest.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { finalPrice: true },
      }),
    ]);

    res.json({
      totalUsers,
      totalTechnicians,
      pendingTechnicians,
      totalBookings,
      completedBookings,
      totalRevenue: totalRevenue._sum.finalPrice || 0,
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Temporary endpoint to seed database (remove after use)
// WARNING: This endpoint should be removed or protected after seeding
router.post('/seed', async (req, res) => {
  try {
    console.log('🌱 Starting database seed via API...');
    
    // Import seed function directly
    const { seedDatabase } = await import('../scripts/seed');
    
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
      message: 'Database seed started. This may take a few minutes. Check logs for progress.'
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    res.status(500).json({ 
      error: 'Failed to start seed',
      message: error.message
    });
  }
});

export { router as adminRouter };

