import express from 'express';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// All notification routes require authentication
router.use(authenticate);

// Get my notifications
router.get('/', async (req, res) => {
  try {
    const { unreadOnly } = req.query;

    const where: any = { userId: req.user!.userId };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to 50 most recent
    });

    res.json(notifications);
  } catch (error: any) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/read-all', async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user!.userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Get unread count
router.get('/unread/count', async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: req.user!.userId,
        isRead: false,
      },
    });

    res.json({ count });
  } catch (error: any) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

export { router as notificationRouter };

