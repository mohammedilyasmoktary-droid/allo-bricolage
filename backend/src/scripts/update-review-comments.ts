import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

/**
 * Script to update all reviews with unique comment texts
 */
async function updateReviewComments() {
  console.log('📝 Updating reviews with unique comments...');

  try {
    // Get all reviews
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'asc' },
    });

    console.log(`Found ${reviews.length} reviews`);

    if (reviews.length === 0) {
      console.log('No reviews found.');
      return;
    }

    // Large pool of unique review comments in French
    const uniqueComments = [
      'Excellent travail, très professionnel!',
      'Très satisfait du service, je recommande vivement.',
      'Travail de qualité, ponctuel et efficace.',
      'Technicien compétent et courtois. Merci!',
      'Service impeccable, je ferai appel à nouveau.',
      'Intervention rapide et soignée. Parfait!',
      'Très bon technicien, problème résolu rapidement.',
      'Service de qualité, je suis très content.',
      'Ponctuel, professionnel et efficace. Recommandé!',
      'Excellent service, technicien très compétent.',
      'Très satisfait, travail bien fait et propre.',
      'Intervention rapide et efficace. Merci beaucoup!',
      'Technicien sérieux et professionnel. Top!',
      'Service parfait, je recommande sans hésitation.',
      'Très bon travail, technicien à l\'écoute.',
      'Intervention de qualité, problème résolu.',
      'Excellent technicien, très professionnel.',
      'Service rapide et efficace. Très content!',
      'Travail soigné et professionnel. Merci!',
      'Technicien compétent, intervention réussie.',
      'Service de qualité, je suis ravi.',
      'Très bon service, technicien ponctuel.',
      'Intervention rapide, travail bien fait.',
      'Excellent travail, je recommande vivement.',
      'Service impeccable, technicien professionnel.',
      'Très satisfait, problème résolu rapidement.',
      'Technicien à l\'écoute et efficace.',
      'Travail de qualité, intervention réussie.',
      'Service parfait, je ferai appel à nouveau.',
      'Très bon technicien, intervention soignée.',
      'Excellent service, technicien compétent.',
      'Intervention rapide et professionnelle.',
      'Travail bien fait, je suis content.',
      'Service de qualité, technicien sérieux.',
      'Très satisfait, intervention réussie.',
      'Technicien professionnel et efficace.',
      'Service impeccable, travail soigné.',
      'Très bon travail, je recommande.',
      'Intervention rapide, problème résolu.',
      'Excellent technicien, service parfait.',
      'Service de qualité, technicien compétent.',
      'Très satisfait, travail bien fait.',
      'Technicien ponctuel et professionnel.',
      'Intervention réussie, je suis ravi.',
      'Travail soigné, service impeccable.',
      'Service parfait, technicien à l\'écoute.',
      'Très bon service, intervention rapide.',
      'Excellent travail, technicien sérieux.',
      'Service de qualité, je recommande.',
      'Très satisfait, problème résolu.',
      'Technicien compétent et professionnel.',
      'Intervention rapide, travail soigné.',
      'Service impeccable, technicien efficace.',
      'Très bon travail, je suis content.',
      'Technicien professionnel, intervention réussie.',
      'Service parfait, travail de qualité.',
      'Très satisfait, technicien compétent.',
      'Intervention rapide et soignée.',
      'Excellent service, je recommande.',
      'Travail bien fait, technicien sérieux.',
      'Service de qualité, intervention réussie.',
    ];

    // Track used comments to ensure uniqueness
    const usedComments = new Set<string>();
    let commentIndex = 0;

    for (const review of reviews) {
      let comment: string;
      
      if (commentIndex < uniqueComments.length) {
        // Use predefined comments first, but ensure uniqueness
        let attempts = 0;
        do {
          comment = uniqueComments[commentIndex % uniqueComments.length];
          commentIndex++;
          attempts++;
          // If we've tried all comments, generate a variation
          if (attempts > uniqueComments.length && usedComments.has(comment)) {
            // Add slight variation to make it unique
            const baseComment = uniqueComments[Math.floor(Math.random() * uniqueComments.length)];
            comment = baseComment.replace(/\.$/, '') + ' Excellent service!';
            break;
          }
        } while (usedComments.has(comment) && attempts < uniqueComments.length * 2);
      } else {
        // Generate unique comment by combining base comments
        const base1 = uniqueComments[Math.floor(Math.random() * uniqueComments.length)];
        const base2 = uniqueComments[Math.floor(Math.random() * uniqueComments.length)];
        comment = `${base1} ${base2.split(' ').slice(1).join(' ')}`;
      }

      // Ensure final uniqueness
      let finalComment = comment;
      let counter = 1;
      while (usedComments.has(finalComment)) {
        finalComment = `${comment} (${counter})`;
        counter++;
      }

      usedComments.add(finalComment);

      // Update review with unique comment
      await prisma.review.update({
        where: { id: review.id },
        data: { comment: finalComment },
      });

      commentIndex++;
    }

    console.log(`\n✅ Successfully updated ${reviews.length} reviews with unique comments!`);
    console.log(`📊 All reviews now have unique text.`);
  } catch (error) {
    console.error('Error updating review comments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateReviewComments();

