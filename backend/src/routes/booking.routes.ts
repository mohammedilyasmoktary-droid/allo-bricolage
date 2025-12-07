import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { checkSubscription } from '../middleware/subscription.middleware';
import { upload, getFileUrl } from '../utils/fileUpload';

const router = express.Router();

// Get all bookings (for public completed jobs display)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    const bookings = await prisma.serviceRequest.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        technician: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(bookings);
  } catch (error: any) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

// Create booking (CLIENT only)
router.post(
  '/',
  authenticate,
  authorize('CLIENT'),
  upload.array('photos', 5),
  [
    body('technicianId').notEmpty().withMessage('Technician ID is required'),
    body('categoryId').notEmpty().withMessage('Category ID is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('scheduledDateTime').optional().isISO8601(),
    body('estimatedPrice').optional().isFloat({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        technicianId,
        categoryId,
        description,
        city,
        address,
        scheduledDateTime,
        estimatedPrice,
        isUrgent,
      } = req.body;

      const clientId = req.user!.userId;

      // Verify technician exists and is approved
      const technician = await prisma.technicianProfile.findUnique({
        where: { id: technicianId },
        include: { user: true },
      });

      if (!technician || technician.verificationStatus !== 'APPROVED') {
        return res.status(400).json({ error: 'Technician not available' });
      }

      // Handle photo uploads
      const photoFiles = req.files as Express.Multer.File[];
      const photos = photoFiles.map(file => getFileUrl(file.filename, 'photos'));

      // Calculate estimated price with urgent fee if applicable
      const baseEstimatedPrice = estimatedPrice ? parseFloat(estimatedPrice) : null;
      const urgentFee = isUrgent === 'true' || isUrgent === true ? 100 : 0;
      const finalEstimatedPrice = baseEstimatedPrice ? baseEstimatedPrice + urgentFee : (urgentFee > 0 ? urgentFee : null);

      // Create booking
      const booking = await prisma.serviceRequest.create({
        data: {
          clientId,
          technicianId: technician.userId,
          technicianProfileId: technicianId,
          categoryId,
          description,
          photos,
          city,
          address,
          scheduledDateTime: scheduledDateTime ? new Date(scheduledDateTime) : null,
          estimatedPrice: finalEstimatedPrice,
          paymentStatus: 'UNPAID',
        },
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
              yearsOfExperience: true,
              averageRating: true,
            },
          },
          category: true,
        },
      });

      // Create notification for technician
      await prisma.notification.create({
        data: {
          userId: technician.userId,
          type: 'BOOKING_CREATED',
          message: `New booking request from ${booking.client.name}`,
        },
      });

      res.status(201).json(booking);
    } catch (error: any) {
      console.error('Create booking error:', error);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  }
);

// Get my bookings (CLIENT or TECHNICIAN)
router.get('/my-bookings', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    const where: any = role === 'CLIENT' ? { clientId: userId } : { technicianId: userId };

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
            yearsOfExperience: true,
            averageRating: true,
            profilePictureUrl: true,
          },
        },
        category: true,
        reviews: {
          select: {
            id: true,
            reviewerId: true,
            rating: true,
            comment: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookings);
  } catch (error: any) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

// Get booking by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const booking = await prisma.serviceRequest.findUnique({
      where: { id: req.params.id },
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
            yearsOfExperience: true,
            averageRating: true,
            profilePictureUrl: true,
          },
        },
        category: true,
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user has access to this booking
    const userId = req.user!.userId;
    if (booking.clientId !== userId && booking.technicianId !== userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(booking);
  } catch (error: any) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to get booking' });
  }
});

// Accept booking (TECHNICIAN only) - requires active subscription
router.patch('/:id/accept', authenticate, authorize('TECHNICIAN'), checkSubscription, async (req, res) => {
  try {
    const booking = await prisma.serviceRequest.findUnique({
      where: { id: req.params.id },
      include: { client: true },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.technicianId !== req.user!.userId) {
      return res.status(403).json({ error: 'Not your booking' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({ error: 'Booking cannot be accepted' });
    }

    const updated = await prisma.serviceRequest.update({
      where: { id: req.params.id },
      data: { status: 'ACCEPTED' },
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

    // Notify client
    await prisma.notification.create({
      data: {
        userId: booking.clientId,
        type: 'BOOKING_ACCEPTED',
        message: `Votre réservation a été acceptée par ${updated.technician?.name}. Le technicien vous contactera bientôt.`,
      },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Accept booking error:', error);
    res.status(500).json({ error: 'Failed to accept booking' });
  }
});

// Decline booking (TECHNICIAN only)
router.patch('/:id/decline', authenticate, authorize('TECHNICIAN'), async (req, res) => {
  try {
    const booking = await prisma.serviceRequest.findUnique({
      where: { id: req.params.id },
      include: { client: true },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.technicianId !== req.user!.userId) {
      return res.status(403).json({ error: 'Not your booking' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({ error: 'Booking cannot be declined' });
    }

    const updated = await prisma.serviceRequest.update({
      where: { id: req.params.id },
      data: { status: 'DECLINED' },
      include: {
        client: {
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

    // Notify client
    await prisma.notification.create({
      data: {
        userId: booking.clientId,
        type: 'BOOKING_DECLINED',
        message: 'Your booking request has been declined',
      },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Decline booking error:', error);
    res.status(500).json({ error: 'Failed to decline booking' });
  }
});

// Update booking status (TECHNICIAN only)
router.patch(
  '/:id/status',
  authenticate,
  authorize('TECHNICIAN'),
  [
    body('status').isIn(['ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED']).withMessage('Invalid status'),
    body('finalPrice').optional().isFloat({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status, finalPrice } = req.body;

      const booking = await prisma.serviceRequest.findUnique({
        where: { id: req.params.id },
        include: { client: true },
      });

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (booking.technicianId !== req.user!.userId) {
        return res.status(403).json({ error: 'Not your booking' });
      }

      const updateData: any = { status };
      if (finalPrice && status === 'COMPLETED') {
        updateData.finalPrice = parseFloat(finalPrice);
        // When technician marks as completed, set status to AWAITING_PAYMENT
        updateData.status = 'AWAITING_PAYMENT';
      }

      const updated = await prisma.serviceRequest.update({
        where: { id: req.params.id },
        data: updateData,
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

      // Notify client with specific messages
      let notificationType: string;
      let notificationMessage: string;

      if (updateData.status === 'AWAITING_PAYMENT') {
        notificationType = 'BOOKING_COMPLETED';
        notificationMessage = `Le service a été complété par ${updated.technician?.name}. Veuillez procéder au paiement.`;
      } else if (status === 'ON_THE_WAY') {
        notificationType = 'BOOKING_ON_THE_WAY';
        notificationMessage = `${updated.technician?.name} est en route vers votre adresse.`;
      } else if (status === 'IN_PROGRESS') {
        notificationType = 'BOOKING_IN_PROGRESS';
        notificationMessage = `${updated.technician?.name} a commencé l'intervention.`;
      } else {
        notificationType = 'BOOKING_COMPLETED';
        notificationMessage = `Le statut de votre réservation a été mis à jour.`;
      }

      await prisma.notification.create({
        data: {
          userId: booking.clientId,
          type: notificationType as any,
          message: notificationMessage,
        },
      });

      res.json(updated);
    } catch (error: any) {
      console.error('Update booking status error:', error);
      res.status(500).json({ error: 'Failed to update booking status' });
    }
  }
);

// Cancel booking (CLIENT or TECHNICIAN)
router.patch('/:id/cancel', authenticate, async (req, res) => {
  try {
    const booking = await prisma.serviceRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const userId = req.user!.userId;
    if (booking.clientId !== userId && booking.technicianId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
      return res.status(400).json({ error: 'Booking cannot be cancelled' });
    }

    const updated = await prisma.serviceRequest.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
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

    // Notify the other party
    const notifyUserId = booking.clientId === userId ? booking.technicianId! : booking.clientId;
    await prisma.notification.create({
      data: {
        userId: notifyUserId,
        type: 'BOOKING_CANCELLED',
        message: 'A booking has been cancelled',
      },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Process payment (CLIENT only) - New endpoint
router.patch(
  '/:id/payment',
  authenticate,
  authorize('CLIENT'),
  upload.single('receipt'),
  [
    body('paymentMethod').isIn(['CASH', 'CARD', 'WAFACASH', 'BANK_TRANSFER']).withMessage('Invalid payment method'),
    body('transactionId').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { paymentMethod, transactionId } = req.body;
      const booking = await prisma.serviceRequest.findUnique({
        where: { id: req.params.id },
        include: { technician: true, client: true },
      });

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (booking.clientId !== req.user!.userId) {
        return res.status(403).json({ error: 'Not your booking' });
      }

      if (booking.status !== 'AWAITING_PAYMENT') {
        return res.status(400).json({ error: 'Booking is not awaiting payment' });
      }

      // Handle different payment methods
      let paymentStatus: 'UNPAID' | 'PENDING' | 'PAID' = 'PENDING';
      let status = 'AWAITING_PAYMENT';
      let receiptUrl: string | null = null;

      if (paymentMethod === 'CASH') {
        // Cash payments require technician confirmation
        // Set to PENDING until technician confirms receipt
        paymentStatus = 'PENDING';
        status = 'AWAITING_PAYMENT';
      } else if (paymentMethod === 'CARD') {
        // Card payments require actual payment gateway integration
        // For now, require transactionId to simulate payment processing
        if (!transactionId) {
          return res.status(400).json({ 
            error: 'Transaction ID is required for card payments. Payment gateway integration required.' 
          });
        }
        // In production, verify payment with Stripe here
        // For now, mark as PENDING until verified
        paymentStatus = 'PENDING';
        status = 'AWAITING_PAYMENT';
      } else if (paymentMethod === 'WAFACASH' || paymentMethod === 'BANK_TRANSFER') {
        // Require receipt upload for Wafacash and bank transfers
        const receiptFile = req.file;
        if (!receiptFile) {
          return res.status(400).json({ 
            error: 'Receipt is required for Wafacash and bank transfer payments' 
          });
        }
        receiptUrl = getFileUrl(receiptFile.filename, 'documents');
        paymentStatus = 'PENDING';
        status = 'AWAITING_PAYMENT';
      }

      // Update booking with payment method and status
      const updated = await prisma.serviceRequest.update({
        where: { id: req.params.id },
        data: {
          paymentMethod,
          paymentStatus,
          status: status as any,
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

      // Notify technician
      const notificationMessage = paymentMethod === 'CASH'
        ? 'Client has selected cash payment. Please confirm receipt when payment is received.'
        : paymentMethod === 'CARD'
        ? 'Client has initiated card payment. Payment verification required.'
        : 'Client has uploaded payment receipt. Please verify and confirm payment.';

      await prisma.notification.create({
        data: {
          userId: booking.technicianId!,
          type: 'PAYMENT_CONFIRMED',
          message: notificationMessage,
        },
      });

      res.json({
        ...updated,
        receiptUrl,
        message: paymentMethod === 'CASH'
          ? 'Payment method selected. Technician will confirm receipt.'
          : paymentMethod === 'CARD'
          ? 'Payment initiated. Awaiting verification.'
          : 'Receipt uploaded. Awaiting technician verification.',
      });
    } catch (error: any) {
      console.error('Process payment error:', error);
      res.status(500).json({ error: 'Failed to process payment' });
    }
  }
);

// Confirm payment receipt (TECHNICIAN only) - For cash payments and receipt verification
router.patch(
  '/:id/confirm-payment',
  authenticate,
  authorize('TECHNICIAN'),
  async (req, res) => {
    try {
      const booking = await prisma.serviceRequest.findUnique({
        where: { id: req.params.id },
        include: { client: true, technician: true },
      });

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (booking.technicianId !== req.user!.userId) {
        return res.status(403).json({ error: 'Not your booking' });
      }

      if (booking.paymentStatus === 'PAID') {
        return res.status(400).json({ error: 'Payment already confirmed' });
      }

      if (booking.paymentStatus !== 'PENDING') {
        return res.status(400).json({ error: 'Payment is not pending confirmation' });
      }

      // Verify payment method
      if (booking.paymentMethod === 'CASH') {
        // For cash, technician confirms they received the payment
        const updated = await prisma.serviceRequest.update({
          where: { id: req.params.id },
          data: {
            paymentStatus: 'PAID',
            status: 'COMPLETED',
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

        // Notify client
        await prisma.notification.create({
          data: {
            userId: booking.clientId,
            type: 'PAYMENT_CONFIRMED',
            message: 'Your cash payment has been confirmed by the technician',
          },
        });

        res.json(updated);
      } else if (booking.paymentMethod === 'WAFACASH' || booking.paymentMethod === 'BANK_TRANSFER') {
        // For Wafacash and bank transfer, technician verifies the receipt
        // In production, you might want to add additional verification here
        const updated = await prisma.serviceRequest.update({
          where: { id: req.params.id },
          data: {
            paymentStatus: 'PAID',
            status: 'COMPLETED',
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

        // Notify client
        await prisma.notification.create({
          data: {
            userId: booking.clientId,
            type: 'PAYMENT_CONFIRMED',
            message: 'Your payment receipt has been verified and confirmed',
          },
        });

        res.json(updated);
      } else {
        return res.status(400).json({ 
          error: 'Payment confirmation not available for this payment method' 
        });
      }
    } catch (error: any) {
      console.error('Confirm payment error:', error);
      res.status(500).json({ error: 'Failed to confirm payment' });
    }
  }
);

export { router as bookingRouter };

