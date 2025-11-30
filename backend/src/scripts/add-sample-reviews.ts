import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

/**
 * Script to add sample reviews for technicians so ratings display correctly
 */
async function addSampleReviews() {
  console.log('⭐ Adding sample reviews to technicians...');

  try {
    // Get all approved technicians
    const technicians = await prisma.technicianProfile.findMany({
      where: { verificationStatus: 'APPROVED' },
      include: {
        user: true,
        bookings: {
          where: {
            status: 'COMPLETED',
            paymentStatus: 'PAID',
          },
          take: 5, // Get up to 5 completed bookings per technician
        },
      },
    });

    console.log(`Found ${technicians.length} technicians`);

    // Create multiple Moroccan client users for realistic reviews
    const moroccanClients = [
      { name: 'Fatima Zahra Alaoui', email: 'fatima.alaoui@example.ma', phone: '+212612345678', city: 'Casablanca' },
      { name: 'Mohamed Amrani', email: 'mohamed.amrani@example.ma', phone: '+212623456789', city: 'Rabat' },
      { name: 'Aicha Benali', email: 'aicha.benali@example.ma', phone: '+212634567890', city: 'Marrakech' },
      { name: 'Youssef El Fassi', email: 'youssef.elfassi@example.ma', phone: '+212645678901', city: 'Fès' },
      { name: 'Sanae Idrissi', email: 'sanae.idrissi@example.ma', phone: '+212656789012', city: 'Agadir' },
      { name: 'Karim Tazi', email: 'karim.tazi@example.ma', phone: '+212667890123', city: 'Tanger' },
      { name: 'Nadia Chraibi', email: 'nadia.chraibi@example.ma', phone: '+212678901234', city: 'Meknès' },
      { name: 'Hassan Bennani', email: 'hassan.bennani@example.ma', phone: '+212689012345', city: 'Oujda' },
    ];

    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.default.hash('client123', 10);
    const clientUsers = [];

    // Create or get client users
    for (const clientData of moroccanClients) {
      let client = await prisma.user.findUnique({
        where: { email: clientData.email },
      });

      if (!client) {
        client = await prisma.user.create({
          data: {
            name: clientData.name,
            email: clientData.email,
            phone: clientData.phone,
            passwordHash,
            city: clientData.city,
            role: 'CLIENT',
          },
        });
        console.log(`✅ Created client: ${clientData.name}`);
      }
      clientUsers.push(client);
    }

    if (clientUsers.length === 0) {
      console.error('❌ Could not create client users');
      return;
    }

    let reviewsAdded = 0;

    for (const technician of technicians) {
      // If technician already has reviews, skip
      const existingReviews = await prisma.review.findMany({
        where: { revieweeId: technician.userId },
      });

      if (existingReviews.length > 0) {
        console.log(`⏭️  ${technician.user.name} already has ${existingReviews.length} reviews, skipping...`);
        continue;
      }

      // Create 2-4 sample reviews per technician
      const numReviews = Math.floor(Math.random() * 3) + 2; // 2-4 reviews
      const ratings = [4.5, 4.7, 4.8, 4.9, 5.0];
      const comments = [
        'Excellent travail, très professionnel!',
        'Très satisfait du service, je recommande vivement.',
        'Travail de qualité, ponctuel et efficace.',
        'Technicien compétent et courtois. Merci!',
        'Service impeccable, je ferai appel à nouveau.',
      ];

      for (let i = 0; i < numReviews; i++) {
        // Select a random client for this review
        const reviewer = clientUsers[Math.floor(Math.random() * clientUsers.length)];
        
        // Create a fake completed booking for this review
        const category = await prisma.serviceCategory.findFirst();
        if (!category) continue;

        const booking = await prisma.serviceRequest.create({
          data: {
            clientId: reviewer.id,
            technicianProfileId: technician.id,
            categoryId: category.id,
            description: 'Service de test pour avis',
            city: technician.user.city,
            address: 'Adresse de test',
            scheduledDateTime: new Date(),
            status: 'COMPLETED',
            paymentStatus: 'PAID',
            finalPrice: technician.basePrice || (technician.hourlyRate ? (technician.hourlyRate || 0) * 2 : 200),
          },
        });

        // Create review
        await prisma.review.create({
          data: {
            bookingId: booking.id,
            reviewerId: reviewer.id,
            revieweeId: technician.userId,
            rating: ratings[Math.floor(Math.random() * ratings.length)],
            comment: comments[Math.floor(Math.random() * comments.length)],
          },
        });

        reviewsAdded++;
      }

      // Update technician average rating
      const allReviews = await prisma.review.findMany({
        where: { revieweeId: technician.userId },
      });

      if (allReviews.length > 0) {
        const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await prisma.technicianProfile.update({
          where: { id: technician.id },
          data: { averageRating },
        });

        console.log(`✅ Added ${numReviews} reviews to ${technician.user.name} (Rating: ${averageRating.toFixed(1)})`);
      }
    }

    console.log(`\n✅ Successfully added ${reviewsAdded} sample reviews!`);
    console.log('📊 Technician ratings have been updated.');
  } catch (error) {
    console.error('Error adding sample reviews:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleReviews();

