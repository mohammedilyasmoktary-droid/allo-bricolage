import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

// Get all conversations for the current user
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;

    // Get all bookings where user is either client or technician
    const bookings = await prisma.serviceRequest.findMany({
      where: {
        OR: [
          { clientId: userId },
          { technicianId: userId },
        ],
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePictureUrl: true,
          },
        },
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePictureUrl: true,
          },
        },
        chatMessages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Format conversations with last message and unread count
    const conversations = await Promise.all(
      bookings.map(async (booking) => {
        const otherUser = booking.clientId === userId ? booking.technician : booking.client;
        if (!otherUser) return null;

        const lastMessage = booking.chatMessages[0] || null;
        const unreadCount = await prisma.chatMessage.count({
          where: {
            bookingId: booking.id,
            receiverId: userId,
            isRead: false,
          },
        });

        return {
          bookingId: booking.id,
          otherUser: {
            id: otherUser.id,
            name: otherUser.name,
            email: otherUser.email,
            profilePictureUrl: otherUser.profilePictureUrl,
          },
          booking: {
            id: booking.id,
            category: booking.category?.name || 'Service',
            status: booking.status,
          },
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                message: lastMessage.message,
                senderId: lastMessage.senderId,
                createdAt: lastMessage.createdAt,
              }
            : null,
          unreadCount,
          updatedAt: booking.updatedAt,
        };
      })
    );

    // Filter out null values and sort by last message time
    const filteredConversations = conversations
      .filter((conv) => conv !== null)
      .sort((a, b) => {
        const aTime = a!.lastMessage?.createdAt || a!.updatedAt;
        const bTime = b!.lastMessage?.createdAt || b!.updatedAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

    res.json(filteredConversations);
  } catch (error: any) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get messages for a specific booking/conversation
router.get('/booking/:bookingId', authenticate, async (req, res) => {
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

    // Get messages
    const messages = await prisma.chatMessage.findMany({
      where: {
        bookingId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePictureUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            profilePictureUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Mark messages as read
    await prisma.chatMessage.updateMany({
      where: {
        bookingId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.json(messages);
  } catch (error: any) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Send a message
router.post(
  '/',
  authenticate,
  [
    body('bookingId').notEmpty().withMessage('Booking ID is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { bookingId, message } = req.body;
      const senderId = req.user!.userId;

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

      if (booking.clientId !== senderId && booking.technicianId !== senderId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Determine receiver
      const receiverId = booking.clientId === senderId ? booking.technicianId : booking.clientId;

      if (!receiverId) {
        return res.status(400).json({ error: 'No receiver found for this booking' });
      }

      // Create message
      const newMessage = await prisma.chatMessage.create({
        data: {
          bookingId,
          senderId,
          receiverId,
          message,
          messageType: 'TEXT',
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              profilePictureUrl: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              profilePictureUrl: true,
            },
          },
        },
      });

      // Create notification for receiver
      await prisma.notification.create({
        data: {
          userId: receiverId,
          type: 'BOOKING_CREATED', // Reuse existing type
          message: `Nouveau message de ${newMessage.sender.name} concernant votre réservation`,
        },
      });

      res.status(201).json(newMessage);
    } catch (error: any) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
);

// Mark messages as read
router.patch('/mark-read/:bookingId', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user!.userId;

    await prisma.chatMessage.updateMany({
      where: {
        bookingId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.json({ message: 'Messages marked as read' });
  } catch (error: any) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

export default router;

