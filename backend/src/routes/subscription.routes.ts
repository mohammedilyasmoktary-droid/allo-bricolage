import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { upload, getFileUrl } from '../utils/fileUpload';

const router = express.Router();

// All routes require authentication and TECHNICIAN role
router.use(authenticate);
router.use(authorize('TECHNICIAN'));

// Subscription plan prices (in MAD)
const PLAN_PRICES = {
  FREE_TRIAL: 0,
  BASIC: 99,
  PREMIUM: 199,
};

// Get subscription status
router.get('/status', async (req, res) => {
  try {
    const userId = req.user!.userId;

    // Get technician profile
    const technicianProfile = await prisma.technicianProfile.findUnique({
      where: { userId },
      include: {
        subscriptions: {
          where: {
            status: {
              in: ['ACTIVE', 'PENDING_PAYMENT'],
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            payments: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        },
      },
    });

    if (!technicianProfile) {
      return res.status(404).json({ error: 'Technician profile not found' });
    }

    const activeSubscription = technicianProfile.subscriptions[0] || null;

    // Check if subscription is expired
    let subscriptionStatus = activeSubscription;
    if (activeSubscription && new Date(activeSubscription.endDate) < new Date()) {
      // Update status to expired
      await prisma.subscription.update({
        where: { id: activeSubscription.id },
        data: { status: 'EXPIRED' },
      });
      subscriptionStatus = null;
    }

    // If no active subscription, check if they had a free trial
    if (!subscriptionStatus) {
      const hasHadTrial = await prisma.subscription.findFirst({
        where: {
          technicianProfileId: technicianProfile.id,
          plan: 'FREE_TRIAL',
        },
      });

      // New technicians get 7-day free trial
      if (!hasHadTrial) {
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7);

        const trialSubscription = await prisma.subscription.create({
          data: {
            technicianProfileId: technicianProfile.id,
            plan: 'FREE_TRIAL',
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: trialEndDate,
            autoRenew: false,
          },
        });

        subscriptionStatus = trialSubscription;
      }
    }

    // Calculate days remaining
    let daysRemaining = 0;
    if (subscriptionStatus) {
      const endDate = new Date(subscriptionStatus.endDate);
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    res.json({
      subscription: subscriptionStatus,
      daysRemaining: Math.max(0, daysRemaining),
      isActive: subscriptionStatus && subscriptionStatus.status === 'ACTIVE' && daysRemaining > 0,
      canAcceptJobs: subscriptionStatus && subscriptionStatus.status === 'ACTIVE' && daysRemaining > 0,
    });
  } catch (error: any) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Create or upgrade subscription
router.post(
  '/create',
  upload.single('receipt'),
  [
    body('plan').isIn(['BASIC', 'PREMIUM']).withMessage('Invalid plan'),
    body('paymentMethod').isIn(['CARD', 'WAFACASH', 'BANK_TRANSFER']).withMessage('Invalid payment method'),
    body('billingPeriod').isIn(['MONTHLY', 'YEARLY']).withMessage('Invalid billing period'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user!.userId;
      const { plan, paymentMethod, billingPeriod } = req.body;

      // Get technician profile
      const technicianProfile = await prisma.technicianProfile.findUnique({
        where: { userId },
      });

      if (!technicianProfile) {
        return res.status(404).json({ error: 'Technician profile not found' });
      }

      // Calculate end date
      const startDate = new Date();
      const endDate = new Date();
      if (billingPeriod === 'MONTHLY') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // Calculate amount
      const monthlyPrice = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];
      const amount = billingPeriod === 'MONTHLY' ? monthlyPrice : monthlyPrice * 12 * 0.9; // 10% discount for yearly

      // Cancel any existing active subscription
      await prisma.subscription.updateMany({
        where: {
          technicianProfileId: technicianProfile.id,
          status: 'ACTIVE',
        },
        data: {
          status: 'CANCELLED',
        },
      });

      // Create new subscription
      const subscription = await prisma.subscription.create({
        data: {
          technicianProfileId: technicianProfile.id,
          plan: plan as any,
          status: paymentMethod === 'BANK_TRANSFER' ? 'PENDING_PAYMENT' : 'ACTIVE',
          startDate,
          endDate,
          autoRenew: true,
        },
      });

      // Handle receipt upload for bank transfer
      let receiptUrl = null;
      if (paymentMethod === 'BANK_TRANSFER' && req.file) {
        receiptUrl = getFileUrl(req.file.filename, 'documents');
      }

      // Create payment record
      const payment = await prisma.subscriptionPayment.create({
        data: {
          subscriptionId: subscription.id,
          amount,
          paymentMethod: paymentMethod as any,
          paymentStatus: paymentMethod === 'BANK_TRANSFER' ? 'PENDING' : 'PAID',
          receiptUrl,
          paidAt: paymentMethod !== 'BANK_TRANSFER' ? new Date() : null,
        },
      });

      // If bank transfer, notify admin
      if (paymentMethod === 'BANK_TRANSFER') {
        const admin = await prisma.user.findFirst({
          where: { role: 'ADMIN' },
        });

        if (admin) {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              type: 'PAYMENT_CONFIRMED',
              message: `New subscription payment pending verification for technician ${technicianProfile.id}`,
            },
          });
        }
      }

      res.json({
        subscription,
        payment,
        message: paymentMethod === 'BANK_TRANSFER'
          ? 'Subscription created. Please wait for payment verification.'
          : 'Subscription activated successfully!',
      });
    } catch (error: any) {
      console.error('Create subscription error:', error);
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  }
);

// Get subscription history
router.get('/history', async (req, res) => {
  try {
    const userId = req.user!.userId;

    const technicianProfile = await prisma.technicianProfile.findUnique({
      where: { userId },
    });

    if (!technicianProfile) {
      return res.status(404).json({ error: 'Technician profile not found' });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: {
        technicianProfileId: technicianProfile.id,
      },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(subscriptions);
  } catch (error: any) {
    console.error('Get subscription history error:', error);
    res.status(500).json({ error: 'Failed to get subscription history' });
  }
});

// Cancel subscription
router.post('/cancel', async (req, res) => {
  try {
    const userId = req.user!.userId;

    const technicianProfile = await prisma.technicianProfile.findUnique({
      where: { userId },
    });

    if (!technicianProfile) {
      return res.status(404).json({ error: 'Technician profile not found' });
    }

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        technicianProfileId: technicianProfile.id,
        status: 'ACTIVE',
      },
    });

    if (!activeSubscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    await prisma.subscription.update({
      where: { id: activeSubscription.id },
      data: {
        status: 'CANCELLED',
        autoRenew: false,
      },
    });

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Verify bank transfer payment (Admin only)
router.post(
  '/verify-payment/:paymentId',
  authenticate,
  authorize('ADMIN'),
  [
    body('paymentStatus').isIn(['PAID', 'REJECTED']).withMessage('Invalid payment status'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { paymentId } = req.params;
      const { paymentStatus } = req.body;

      const payment = await prisma.subscriptionPayment.findUnique({
        where: { id: paymentId },
        include: {
          subscription: {
            include: {
              technicianProfile: {
                include: { user: true },
              },
            },
          },
        },
      });

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      await prisma.subscriptionPayment.update({
        where: { id: paymentId },
        data: {
          paymentStatus: paymentStatus as any,
          paidAt: paymentStatus === 'PAID' ? new Date() : null,
        },
      });

      if (paymentStatus === 'PAID') {
        await prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: { status: 'ACTIVE' },
        });

        // Notify technician
        await prisma.notification.create({
          data: {
            userId: payment.subscription.technicianProfile.userId,
            type: 'SUBSCRIPTION_RENEWED',
            message: 'Your subscription payment has been verified and activated!',
          },
        });
      }

      res.json({ message: 'Payment status updated successfully' });
    } catch (error: any) {
      console.error('Verify payment error:', error);
      res.status(500).json({ error: 'Failed to verify payment' });
    }
  }
);

export { router as subscriptionRouter };

