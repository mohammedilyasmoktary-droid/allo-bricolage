import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { checkSubscription } from '../middleware/subscription.middleware';
import { upload, getFileUrl } from '../utils/fileUpload';

const router = express.Router();

// Get all bookings (for public completed jobs display and availability checking)
router.get('/', async (req, res) => {
  try {
    const { status, technicianId, technicianProfileId } = req.query;
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    // Filter by technician if provided (for availability checking)
    if (technicianId) {
      where.technicianId = technicianId;
    }
    if (technicianProfileId) {
      where.technicianProfileId = technicianProfileId;
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
      take: technicianId || technicianProfileId ? 500 : 50, // Allow more bookings when filtering by technician
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
    body('scheduledDateTime').optional().custom((value) => {
      if (!value) return true; // Optional field
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
      return true;
    }),
    body('estimatedPrice').optional().isFloat({ min: 0 }),
  ],
  async (req, res) => {
    try {
      // Log incoming request for debugging
      console.log('Booking creation request:', {
        body: req.body,
        files: req.files ? (req.files as Express.Multer.File[]).map(f => f.filename) : [],
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('Validation errors:', errors.array());
        return res.status(400).json({ 
          error: 'Validation failed',
          errors: errors.array() 
        });
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
      console.log('Photo files received:', photoFiles ? photoFiles.length : 0);
      if (!photoFiles || photoFiles.length === 0) {
        console.error('No photos provided in request');
        return res.status(400).json({ error: 'At least one photo is required' });
      }
      const photos = photoFiles.map(file => {
        const url = getFileUrl(file.filename, 'photos');
        console.log('Photo file processed:', file.filename, '->', url);
        return url;
      });

      // Calculate estimated price with urgent fee if applicable
      const baseEstimatedPrice = estimatedPrice ? parseFloat(estimatedPrice) : null;
      const urgentFee = isUrgent === 'true' || isUrgent === true ? 100 : 0;
      const finalEstimatedPrice = baseEstimatedPrice ? baseEstimatedPrice + urgentFee : (urgentFee > 0 ? urgentFee : null);

      // Validate and parse scheduledDateTime if provided
      let parsedScheduledDateTime: Date | null = null;
      if (scheduledDateTime) {
        try {
          // Parse the ISO string - it should already be in UTC format
          parsedScheduledDateTime = new Date(scheduledDateTime);
          if (isNaN(parsedScheduledDateTime.getTime())) {
            return res.status(400).json({ error: 'Invalid scheduledDateTime format. Please use ISO 8601 format.' });
          }
          // Check if date is in the past (compare in UTC to avoid timezone issues)
          const now = new Date();
          if (parsedScheduledDateTime < now) {
            return res.status(400).json({ error: 'Scheduled date and time cannot be in the past' });
          }
          // Log for debugging
          console.log('Parsed scheduledDateTime:', {
            input: scheduledDateTime,
            parsed: parsedScheduledDateTime.toISOString(),
            local: parsedScheduledDateTime.toLocaleString(),
          });
        } catch (error) {
          console.error('Error parsing scheduledDateTime:', error);
          return res.status(400).json({ error: 'Invalid scheduledDateTime format' });
        }
      }

      // Create booking
      // Note: receiptUrl and transactionId are optional and will be null initially
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
          scheduledDateTime: parsedScheduledDateTime,
          estimatedPrice: finalEstimatedPrice,
          paymentStatus: 'UNPAID',
          receiptUrl: null, // Will be set when payment is processed
          transactionId: null, // Will be set when payment is processed
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

      console.log('Booking created successfully:', booking.id);
      res.status(201).json(booking);
    } catch (error: any) {
      console.error('Create booking error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      
      // Provide more specific error messages
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'A booking with these details already exists' });
      }
      if (error.code === 'P2003') {
        return res.status(400).json({ error: 'Invalid reference to related record' });
      }
      if (error.message && error.message.includes('Invalid')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message && error.message.includes('Record to update not found')) {
        return res.status(404).json({ error: 'Technician or category not found' });
      }
      
      res.status(500).json({ 
        error: error.message || 'Failed to create booking. Please check all fields and try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

// Get my bookings (CLIENT or TECHNICIAN)
router.get('/my-bookings', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    console.log('Getting bookings for user:', userId, 'role:', role);

    // For technicians, include both accepted bookings (technicianId) and pending bookings assigned to their profile
    let where: any;
    if (role === 'CLIENT') {
      where = { clientId: userId };
    } else if (role === 'TECHNICIAN') {
      // Get technician profile ID
      const technicianProfile = await prisma.technicianProfile.findUnique({
        where: { userId },
        select: { id: true },
      });
      
      if (technicianProfile) {
        // Include bookings where technicianId matches OR technicianProfileId matches
        where = {
          OR: [
            { technicianId: userId },
            { technicianProfileId: technicianProfile.id },
          ],
        };
      } else {
        // Fallback to just technicianId if no profile exists
        where = { technicianId: userId };
      }
    } else {
      where = {};
    }

    console.log('Query where clause:', where);

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
        quote: true,
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

    console.log('Found bookings:', bookings.length);
    console.log('Bookings IDs:', bookings.map(b => b.id));

    res.json(bookings);
  } catch (error: any) {
    console.error('Get my bookings error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
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
        quote: true,
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
    const acceptMessage = `Votre réservation a été acceptée par ${updated.technician?.name}. Le technicien vous contactera bientôt.`;
    
    await prisma.notification.create({
      data: {
        userId: booking.clientId,
        type: 'BOOKING_ACCEPTED',
        message: acceptMessage,
      },
    });

    // Create automatic chat message
    if (booking.technicianId && booking.clientId) {
      try {
        await prisma.chatMessage.create({
          data: {
            bookingId: booking.id,
            senderId: booking.technicianId,
            receiverId: booking.clientId,
            message: acceptMessage,
            messageType: 'TEXT',
          },
        });
      } catch (messageError) {
        console.error('Failed to create accept message:', messageError);
      }
    }

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
      const declineMessage = `Votre réservation a été refusée par ${updated.technician?.name || 'le technicien'}.`;
      
      await prisma.notification.create({
        data: {
          userId: booking.clientId,
          type: 'BOOKING_DECLINED',
          message: declineMessage,
        },
      });

      // Create automatic chat message
      if (booking.technicianId && booking.clientId) {
        try {
          await prisma.chatMessage.create({
            data: {
              bookingId: booking.id,
              senderId: booking.technicianId,
              receiverId: booking.clientId,
              message: declineMessage,
              messageType: 'TEXT',
            },
          });
        } catch (messageError) {
          console.error('Failed to create decline message:', messageError);
        }
      }

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
    body('status').isIn(['ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'AWAITING_PAYMENT']).withMessage('Invalid status'),
    body('finalPrice').optional().custom((value) => {
      if (value === undefined || value === null || value === '') {
        return true; // Optional field, allow empty
      }
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue) || numValue < 0) {
        throw new Error('finalPrice must be a positive number');
      }
      return true;
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { status, finalPrice } = req.body;
      
      // Parse finalPrice if it's a string
      let parsedFinalPrice: number | undefined = undefined;
      if (finalPrice !== undefined && finalPrice !== null && finalPrice !== '') {
        parsedFinalPrice = typeof finalPrice === 'string' ? parseFloat(finalPrice) : finalPrice;
        if (isNaN(parsedFinalPrice) || parsedFinalPrice < 0) {
          return res.status(400).json({ error: 'finalPrice must be a positive number' });
        }
      }

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

      // Allow status updates for active statuses (not CANCELLED, DECLINED, COMPLETED)
      const allowedFromStatuses = ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'AWAITING_PAYMENT'];
      if (!allowedFromStatuses.includes(booking.status)) {
        return res.status(400).json({ error: 'Cannot update status from current status' });
      }

      // Require quote before allowing IN_PROGRESS status
      if (status === 'IN_PROGRESS') {
        const quote = await prisma.quote.findUnique({
          where: { bookingId: booking.id },
        });
        if (!quote) {
          return res.status(400).json({ 
            error: 'Un devis doit être créé avant de commencer le travail. Veuillez créer un devis d\'abord.' 
          });
        }
      }

      const updateData: any = { status };
      let actualNewStatus = status; // Track the actual new status for message creation
      
      if (parsedFinalPrice !== undefined && status === 'COMPLETED') {
        updateData.finalPrice = parsedFinalPrice;
        // When technician marks as completed, set status to AWAITING_PAYMENT
        updateData.status = 'AWAITING_PAYMENT';
        actualNewStatus = 'AWAITING_PAYMENT';
      }
      
      // If going back to IN_PROGRESS from AWAITING_PAYMENT, clear payment status if not paid
      if (status === 'IN_PROGRESS' && booking.status === 'AWAITING_PAYMENT' && booking.paymentStatus !== 'PAID') {
        updateData.paymentStatus = 'UNPAID';
        updateData.receiptUrl = null;
        updateData.transactionId = null;
      }

      // Check if status is actually changing
      const statusChanged = actualNewStatus !== booking.status;
      const oldStatus = booking.status; // Store old status for logging

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

      if (actualNewStatus === 'AWAITING_PAYMENT') {
        notificationType = 'BOOKING_COMPLETED';
        const finalPriceAmount = parsedFinalPrice || updateData.finalPrice || updated.finalPrice;
        notificationMessage = finalPriceAmount
          ? `Le service a été complété par ${updated.technician?.name || 'le technicien'}. Montant à payer: ${finalPriceAmount} MAD. Veuillez procéder au paiement.`
          : `Le service a été complété par ${updated.technician?.name || 'le technicien'}. Veuillez procéder au paiement.`;
      } else if (status === 'ON_THE_WAY') {
        notificationType = 'BOOKING_ON_THE_WAY';
        notificationMessage = `${updated.technician?.name || 'Le technicien'} est en route vers votre adresse.`;
      } else if (status === 'IN_PROGRESS') {
        notificationType = 'BOOKING_IN_PROGRESS';
        notificationMessage = `${updated.technician?.name || 'Le technicien'} a commencé l'intervention.`;
      } else if (status === 'ACCEPTED') {
        notificationType = 'BOOKING_ACCEPTED';
        notificationMessage = `${updated.technician?.name || 'Le technicien'} a accepté votre réservation.`;
      } else {
        notificationType = 'BOOKING_COMPLETED';
        notificationMessage = `Le statut de votre réservation a été mis à jour à "${actualNewStatus}".`;
      }

      await prisma.notification.create({
        data: {
          userId: booking.clientId,
          type: notificationType as any,
          message: notificationMessage,
        },
      });

      // Create automatic chat message when status changes
      // Always send a message when technician updates status (if status actually changed and clientId exists)
      // Remove the statusChanged check temporarily to ensure messages are always sent
      if (booking.clientId && req.user!.userId && notificationMessage) {
        try {
          // Only create message if status actually changed
          if (statusChanged) {
            const chatMessage = await prisma.chatMessage.create({
              data: {
                bookingId: booking.id,
                senderId: req.user!.userId, // Use the current user (technician) as sender
                receiverId: booking.clientId,
                message: notificationMessage,
                messageType: 'TEXT',
              },
            });
            console.log(`✅ Status change message sent: ${oldStatus} → ${actualNewStatus} for booking ${booking.id}`);
            console.log(`✅ Chat message created with ID: ${chatMessage.id}`);
            console.log(`✅ Message content: ${notificationMessage.substring(0, 100)}...`);
          } else {
            console.log(`⏭️ Status unchanged, skipping message: ${oldStatus} === ${actualNewStatus}`);
          }
        } catch (messageError: any) {
          // Don't fail the status update if message creation fails, but log the error
          console.error('❌ Failed to create status change message:', messageError);
          console.error('Message error details:', {
            bookingId: booking.id,
            senderId: req.user!.userId,
            receiverId: booking.clientId,
            message: notificationMessage,
            oldStatus,
            newStatus: actualNewStatus,
            statusChanged,
            error: messageError?.message || messageError,
            code: messageError?.code,
            meta: messageError?.meta,
            stack: messageError?.stack,
          });
          // Re-throw the error in development to see what's wrong
          if (process.env.NODE_ENV === 'development') {
            throw messageError;
          }
        }
      } else {
        console.log(`⏭️ Skipping message creation - missing required data:`, {
          hasClientId: !!booking.clientId,
          hasUserId: !!req.user!.userId,
          hasMessage: !!notificationMessage,
          oldStatus,
          newStatus: actualNewStatus,
          statusChanged,
          bookingId: booking.id,
        });
      }

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
    const cancelMessage = userId === booking.clientId
      ? `La réservation a été annulée par le client.`
      : `La réservation a été annulée par le technicien.`;
    
    await prisma.notification.create({
      data: {
        userId: notifyUserId,
        type: 'BOOKING_CANCELLED',
        message: cancelMessage,
      },
    });

    // Create automatic chat message
    if (booking.technicianId && booking.clientId) {
      try {
        await prisma.chatMessage.create({
          data: {
            bookingId: booking.id,
            senderId: userId,
            receiverId: notifyUserId,
            message: cancelMessage,
            messageType: 'TEXT',
          },
        });
      } catch (messageError) {
        console.error('Failed to create cancel message:', messageError);
      }
    }

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
          receiptUrl: receiptUrl || null,
          transactionId: transactionId || null,
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

      // Create automatic chat message for payment
      if (booking.technicianId && booking.clientId) {
        try {
          const paymentMessage = paymentMethod === 'CASH'
            ? 'J\'ai sélectionné le paiement en espèces. Le technicien confirmera la réception.'
            : paymentMethod === 'CARD'
            ? 'J\'ai initié le paiement par carte. Vérification en cours.'
            : 'J\'ai uploadé le reçu de paiement. Veuillez vérifier et confirmer.';
          
          await prisma.chatMessage.create({
            data: {
              bookingId: booking.id,
              senderId: booking.clientId,
              receiverId: booking.technicianId,
              message: paymentMessage,
              messageType: 'TEXT',
            },
          });
        } catch (messageError) {
          console.error('Failed to create payment message:', messageError);
        }
      }

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
        const paymentConfirmedMessage = 'Le paiement a été confirmé par le technicien. Merci !';
        
        await prisma.notification.create({
          data: {
            userId: booking.clientId,
            type: 'PAYMENT_CONFIRMED',
            message: paymentConfirmedMessage,
          },
        });

        // Create automatic chat message for payment confirmation
        if (booking.technicianId && booking.clientId) {
          try {
            await prisma.chatMessage.create({
              data: {
                bookingId: booking.id,
                senderId: booking.technicianId,
                receiverId: booking.clientId,
                message: paymentConfirmedMessage,
                messageType: 'TEXT',
              },
            });
          } catch (messageError) {
            console.error('Failed to create payment confirmation message:', messageError);
          }
        }

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
            const paymentVerifiedMessage = 'Le paiement a été confirmé par le technicien. Merci !';
            
            await prisma.notification.create({
              data: {
                userId: booking.clientId,
                type: 'PAYMENT_CONFIRMED',
                message: paymentVerifiedMessage,
              },
            });

            // Create automatic chat message for payment verification
            if (booking.technicianId && booking.clientId) {
              try {
                await prisma.chatMessage.create({
                  data: {
                    bookingId: booking.id,
                    senderId: booking.technicianId,
                    receiverId: booking.clientId,
                    message: paymentVerifiedMessage,
                    messageType: 'TEXT',
                  },
                });
              } catch (messageError) {
                console.error('Failed to create payment verification message:', messageError);
              }
            }

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

