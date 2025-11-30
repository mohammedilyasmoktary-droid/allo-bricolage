import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

/**
 * Middleware to check if technician has active subscription
 * Blocks job acceptance if subscription is expired
 */
export const checkSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    // Get technician profile
    const technicianProfile = await prisma.technicianProfile.findUnique({
      where: { userId },
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE',
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!technicianProfile) {
      return res.status(404).json({ error: 'Technician profile not found' });
    }

    const activeSubscription = technicianProfile.subscriptions[0];

    // Check if subscription exists and is not expired
    if (!activeSubscription) {
      return res.status(403).json({
        error: 'SUBSCRIPTION_REQUIRED',
        message: 'Your subscription has expired. Renew to continue receiving jobs.',
      });
    }

    const endDate = new Date(activeSubscription.endDate);
    const now = new Date();

    if (endDate < now) {
      // Update status to expired
      await prisma.subscription.update({
        where: { id: activeSubscription.id },
        data: { status: 'EXPIRED' },
      });

      return res.status(403).json({
        error: 'SUBSCRIPTION_EXPIRED',
        message: 'Your subscription has expired. Renew to continue receiving jobs.',
      });
    }

    // Check if it's a free trial and limit job count
    if (activeSubscription.plan === 'FREE_TRIAL') {
      const jobCount = await prisma.serviceRequest.count({
        where: {
          technicianProfileId: technicianProfile.id,
          status: {
            in: ['ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED'],
          },
        },
      });

      if (jobCount >= 3) {
        return res.status(403).json({
          error: 'TRIAL_LIMIT_REACHED',
          message: 'You have reached the free trial limit (3 jobs). Please subscribe to continue.',
        });
      }
    }

    // Attach subscription info to request
    (req as any).subscription = activeSubscription;
    next();
  } catch (error: any) {
    console.error('Check subscription error:', error);
    res.status(500).json({ error: 'Failed to check subscription status' });
  }
};






