import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

/**
 * Script to update existing reviews to use realistic Moroccan client names
 */
async function updateReviewNames() {
  console.log('🔄 Updating review client names to Moroccan names...');

  try {
    // Get all reviews
    const reviews = await prisma.review.findMany({
      include: {
        reviewer: true,
      },
    });

    console.log(`Found ${reviews.length} reviews to update`);

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
    ];

    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.default.hash('client123', 10);

    let updated = 0;
    const usedEmails = new Set<string>();
    const reviewerNameMap = new Map<string, string>(); // Map reviewerId to unique name

    for (const review of reviews) {
      // Check if we've already assigned a name to this reviewer
      if (reviewerNameMap.has(review.reviewerId)) {
        const assignedName = reviewerNameMap.get(review.reviewerId)!;
        // Update the reviewer if name changed
        if (review.reviewer.name !== assignedName) {
          await prisma.user.update({
            where: { id: review.reviewerId },
            data: {
              name: assignedName,
            },
          });
        }
        continue;
      }

      // Skip if reviewer already has a unique Moroccan name
      if (review.reviewer.name !== 'Client Test' && 
          review.reviewer.name !== 'Souad Chraibi' &&
          moroccanNames.includes(review.reviewer.name)) {
        reviewerNameMap.set(review.reviewerId, review.reviewer.name);
        continue;
      }

      // Assign a unique name from the pool, cycling through if needed
      const nameIndex = updated % moroccanNames.length;
      const newName = moroccanNames[nameIndex];
      
      // Generate unique email for this client
      let emailIndex = 0;
      let newEmail = '';
      do {
        const namePart = newName.toLowerCase().replace(/\s+/g, '.');
        newEmail = `${namePart}${emailIndex > 0 ? emailIndex : ''}@example.ma`;
        emailIndex++;
      } while (usedEmails.has(newEmail) && emailIndex < 100);

      usedEmails.add(newEmail);
      reviewerNameMap.set(review.reviewerId, newName);

      // Update the reviewer's name and email
      await prisma.user.update({
        where: { id: review.reviewerId },
        data: {
          name: newName,
          email: newEmail,
        },
      });

      updated++;
    }

    console.log(`\n✅ Updated ${updated} client names to Moroccan names!`);
    console.log('📊 Reviews now show realistic Moroccan client names.');
  } catch (error) {
    console.error('Error updating review names:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateReviewNames();

