import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function giveAhmedPremiumAccess() {
  try {
    console.log('🔍 Looking for Ahmed...');

    // Find Ahmed (case-insensitive search)
    const ahmed = await prisma.user.findFirst({
      where: {
        role: 'TECHNICIAN',
        OR: [
          { name: { contains: 'Ahmed', mode: 'insensitive' } },
          { email: { contains: 'ahmed', mode: 'insensitive' } },
        ],
      },
      include: {
        technicianProfile: true,
      },
    });

    if (!ahmed) {
      console.error('❌ Ahmed not found. Please check the database.');
      return;
    }

    console.log(`✅ Found Ahmed: ${ahmed.name} (${ahmed.email})`);

    if (!ahmed.technicianProfile) {
      console.error('❌ Ahmed does not have a technician profile.');
      return;
    }

    const technicianProfileId = ahmed.technicianProfile.id;

    // Check if there's an existing active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        technicianProfileId,
        status: {
          in: ['ACTIVE', 'PENDING_PAYMENT'],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Set end date to 1 year from now
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    if (existingSubscription) {
      // Update existing subscription to PREMIUM
      console.log('📝 Updating existing subscription to PREMIUM...');
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          plan: 'PREMIUM',
          status: 'ACTIVE',
          endDate,
          autoRenew: true,
        },
      });
      console.log('✅ Subscription updated successfully!');
    } else {
      // Create new PREMIUM subscription
      console.log('✨ Creating new PREMIUM subscription...');
      await prisma.subscription.create({
        data: {
          technicianProfileId,
          plan: 'PREMIUM',
          status: 'ACTIVE',
          startDate: new Date(),
          endDate,
          autoRenew: true,
        },
      });
      console.log('✅ Premium subscription created successfully!');
    }

    // Create a payment record to show it's paid
    const subscription = await prisma.subscription.findFirst({
      where: {
        technicianProfileId,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (subscription) {
      // Check if payment already exists
      const existingPayment = await prisma.subscriptionPayment.findFirst({
        where: {
          subscriptionId: subscription.id,
          paymentStatus: 'PAID',
        },
      });

      if (!existingPayment) {
        console.log('💳 Creating payment record...');
        await prisma.subscriptionPayment.create({
          data: {
            subscriptionId: subscription.id,
            amount: 199, // PREMIUM plan price
            paymentMethod: 'CARD',
            paymentStatus: 'PAID',
            paidAt: new Date(),
            transactionId: `ADMIN_GRANT_${Date.now()}`,
          },
        });
        console.log('✅ Payment record created!');
      }
    }

    console.log('\n🎉 Ahmed now has full PREMIUM subscription access!');
    console.log(`   Plan: PREMIUM`);
    console.log(`   Status: ACTIVE`);
    console.log(`   Valid until: ${endDate.toLocaleDateString()}`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

giveAhmedPremiumAccess();

