import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

/**
 * Script to update all reviews with unique ratings
 */
async function updateReviewRatings() {
  console.log('⭐ Updating reviews with unique ratings...');

  try {
    // Get all reviews
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'asc' },
    });

    console.log(`Found ${reviews.length} reviews`);

    if (reviews.length === 0) {
      console.log('No reviews found. Please run the seed script first.');
      return;
    }

    // Generate unique ratings from 3.0 to 5.0
    // Distribute ratings to ensure variety
    const ratingOptions = [3.0, 3.2, 3.5, 3.7, 3.8, 4.0, 4.2, 4.3, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0];
    
    // If we have more reviews than rating options, we'll cycle through them with slight variations
    const usedRatings = new Set<number>();
    let ratingIndex = 0;

    for (const review of reviews) {
      let rating: number;
      
      if (ratingIndex < ratingOptions.length) {
        // Use predefined ratings first
        rating = ratingOptions[ratingIndex];
      } else {
        // Generate unique rating between 3.0 and 5.0
        let attempts = 0;
        do {
          // Generate rating with 0.1 precision
          rating = Math.round((3.0 + Math.random() * 2.0) * 10) / 10;
          attempts++;
        } while (usedRatings.has(rating) && attempts < 100);
      }

      usedRatings.add(rating);

      // Update review with unique rating
      await prisma.review.update({
        where: { id: review.id },
        data: { rating },
      });

      ratingIndex++;
    }

    // Update technician average ratings
    console.log('\n📊 Updating technician average ratings...');
    const technicians = await prisma.technicianProfile.findMany({
      include: {
        user: true,
      },
    });

    for (const technician of technicians) {
      const allReviews = await prisma.review.findMany({
        where: { revieweeId: technician.userId },
      });

      if (allReviews.length > 0) {
        const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await prisma.technicianProfile.update({
          where: { id: technician.id },
          data: { averageRating },
        });

        console.log(`✅ Updated ${technician.user.name}: ${averageRating.toFixed(1)} (${allReviews.length} reviews)`);
      }
    }

    console.log(`\n✅ Successfully updated ${reviews.length} reviews with unique ratings!`);
  } catch (error) {
    console.error('Error updating review ratings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateReviewRatings();

