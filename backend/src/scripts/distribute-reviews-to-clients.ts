import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

/**
 * Script to distribute reviews across multiple unique Moroccan clients
 */
async function distributeReviewsToClients() {
  console.log('🔄 Distributing reviews to unique Moroccan clients...');

  try {
    // Get all reviews
    const reviews = await prisma.review.findMany({
      include: {
        reviewer: true,
        booking: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log(`Found ${reviews.length} reviews to distribute`);

    // Moroccan names pool
    const moroccanNames = [
      'Fatima Zahra Alaoui',
      'Mohamed Amrani',
      'Aicha Benali',
      'Youssef El Fassi',
      'Sanae Idrissi',
      'Karim Tazi',
      'Nadia Chraibi',
      'Hassan Bennani',
      'Laila Berrada',
      'Omar El Amrani',
      'Souad Chraibi',
      'Mehdi Ziani',
      'Imane Alaoui',
      'Rachid El Ouazzani',
      'Samira El Malki',
      'Khalid Amrani',
      'Houda El Fassi',
      'Amine Tazi',
      'Younes Bennani',
      'Sanae Alaoui',
    ];

    const moroccanCities = [
      'Casablanca',
      'Rabat',
      'Marrakech',
      'Fès',
      'Agadir',
      'Tanger',
      'Meknès',
      'Oujda',
      'Kenitra',
      'Tetouan',
    ];

    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.default.hash('client123', 10);

    let clientsCreated = 0;
    let reviewsUpdated = 0;
    const clientMap = new Map<string, string>(); // Map reviewerId to new clientId

    for (let i = 0; i < reviews.length; i++) {
      const review = reviews[i];
      
      // Assign a unique name for this review
      const nameIndex = i % moroccanNames.length;
      const clientName = moroccanNames[nameIndex];
      const cityIndex = i % moroccanCities.length;
      const clientCity = moroccanCities[cityIndex];

      // Check if we already created a client for this review index
      let newClientId = clientMap.get(`review_${i}`);
      
      if (!newClientId) {
        // Create a unique email
        const emailBase = clientName.toLowerCase().replace(/\s+/g, '.');
        const uniqueEmail = `${emailBase}.${i}@example.ma`;
        const phoneNumber = `+2126${String(i).padStart(8, '0')}`;

        // Check if client already exists
        let client = await prisma.user.findUnique({
          where: { email: uniqueEmail },
        });

        if (!client) {
          // Create new client
          client = await prisma.user.create({
            data: {
              name: clientName,
              email: uniqueEmail,
              phone: phoneNumber,
              passwordHash,
              city: clientCity,
              role: 'CLIENT',
            },
          });
          clientsCreated++;
          console.log(`✅ Created client: ${clientName} (${uniqueEmail})`);
        }

        newClientId = client.id;
        clientMap.set(`review_${i}`, newClientId);
      }

      // Generate random date within the last 6 months
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      
      // Random date between 6 months ago and now
      const randomTime = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
      const randomDate = new Date(randomTime);

      // Update the review's reviewer and date
      if (review.reviewerId !== newClientId) {
        // Update the review with new reviewer using nested update
        await prisma.review.update({
          where: { id: review.id },
          data: {
            reviewer: {
              connect: { id: newClientId },
            },
            createdAt: randomDate,
          },
        });

        // Update the booking's client and date
        if (review.booking) {
          // Booking date should be slightly before review date
          const bookingDate = new Date(randomDate);
          bookingDate.setDate(bookingDate.getDate() - Math.floor(Math.random() * 3)); // 0-2 days before review
          
          await prisma.serviceRequest.update({
            where: { id: review.booking.id },
            data: {
              client: {
                connect: { id: newClientId },
              },
              scheduledDateTime: bookingDate,
              createdAt: bookingDate,
              updatedAt: bookingDate,
            },
          });
        }

        reviewsUpdated++;
      } else {
        // Just update the date if reviewer is already correct
        await prisma.review.update({
          where: { id: review.id },
          data: {
            createdAt: randomDate,
          },
        });
        reviewsUpdated++;
      }
    }

    console.log(`\n✅ Created ${clientsCreated} unique clients!`);
    console.log(`✅ Updated ${reviewsUpdated} reviews with unique clients!`);
    console.log('📊 Each review now has a unique Moroccan client name.');
  } catch (error) {
    console.error('Error distributing reviews:', error);
  } finally {
    await prisma.$disconnect();
  }
}

distributeReviewsToClients();

