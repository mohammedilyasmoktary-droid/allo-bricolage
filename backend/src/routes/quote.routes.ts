import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://allo-bricolage.vercel.app').replace(/\/+$/, '');

// Create or update a quote for a booking (TECHNICIAN only)
router.post(
  '/',
  authenticate,
  authorize('TECHNICIAN'),
  [
    body('bookingId').notEmpty().withMessage('Booking ID is required'),
    body('conditions').trim().notEmpty().withMessage('Conditions are required'),
    body('equipment').trim().notEmpty().withMessage('Equipment list is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { bookingId, conditions, equipment, price } = req.body;
      const userId = req.user!.userId;

      // Verify booking exists and belongs to this technician
      const booking = await prisma.serviceRequest.findUnique({
        where: { id: bookingId },
        include: { technician: true },
      });

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (booking.technicianId !== userId) {
        return res.status(403).json({ error: 'Not your booking' });
      }

      // Check if booking is in a valid state for quote creation
      // Quote can only be created after technician arrives (ON_THE_WAY or later)
      if (!['ON_THE_WAY', 'IN_PROGRESS'].includes(booking.status)) {
        return res.status(400).json({ 
          error: 'Quote can only be created after technician arrives (status must be ON_THE_WAY or IN_PROGRESS)' 
        });
      }

      // Create or update quote
      const quote = await prisma.quote.upsert({
        where: { bookingId },
        update: {
          conditions,
          equipment,
          price: parseFloat(price),
        },
        create: {
          bookingId,
          conditions,
          equipment,
          price: parseFloat(price),
        },
        include: {
          booking: {
            include: {
              client: { select: { id: true, name: true, email: true, phone: true } },
              technician: { select: { id: true, name: true, email: true, phone: true } },
              category: true,
            },
          },
        },
      });

      // Update booking estimated price if not set
      if (!booking.estimatedPrice) {
        await prisma.serviceRequest.update({
          where: { id: bookingId },
          data: { estimatedPrice: parseFloat(price) },
        });
      }

      // Notify client about the quote with download link
      const recapUrl = `${FRONTEND_URL}/client/bookings/recap?bookingId=${bookingId}`;
      await prisma.notification.create({
        data: {
          userId: booking.clientId,
          type: 'QUOTE_AVAILABLE',
          message: `Un devis est disponible pour votre réservation. Prix: ${price} MAD. Téléchargez le PDF ici: ${recapUrl}`,
        },
      });

      res.status(201).json(quote);
    } catch (error: any) {
      console.error('Create/Update quote error:', error);
      res.status(500).json({ error: 'Failed to create/update quote' });
    }
  }
);

// Get quote for a booking
router.get('/booking/:bookingId', authenticate, async (req: express.Request, res: express.Response) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user!.userId;

    // Verify user has access to this booking
    const booking = await prisma.serviceRequest.findUnique({
      where: { id: bookingId },
      select: {
        clientId: true,
        technicianId: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.clientId !== userId && booking.technicianId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const quote = await prisma.quote.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            client: { select: { id: true, name: true, email: true, phone: true } },
            technician: { select: { id: true, name: true, email: true, phone: true } },
            category: true,
          },
        },
      },
    });

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json(quote);
  } catch (error: any) {
    console.error('Get quote error:', error);
    res.status(500).json({ error: 'Failed to get quote' });
  }
});

export default router;

