import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

/**
 * Script to assign provided technician images to profiles
 * 
 * INSTRUCTIONS:
 * 1. Save your 6 technician images to: backend/uploads/profile-pictures/
 * 2. Name them exactly: technician_1.jpg, technician_2.jpg, technician_3.jpg, 
 *    technician_4.jpg, technician_5.jpg, technician_6.jpg
 * 3. Run this script: npm run add-technician-images
 */
async function addTechnicianImages() {
  console.log('🖼️  Assigning technician images to profiles...');

  const uploadDir = path.join(__dirname, '..', '..', UPLOAD_DIR, 'profile-pictures');
  
  // Ensure directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('📁 Created uploads/profile-pictures directory');
  }

  // Map of image names
  const imageMap = [
    'technician_1.jpg',
    'technician_2.jpg',
    'technician_3.jpg',
    'technician_4.jpg',
    'technician_5.jpg',
    'technician_6.jpg',
  ];

  // Check which images exist
  const existingImages = imageMap.filter(img => {
    const filePath = path.join(uploadDir, img);
    return fs.existsSync(filePath);
  });

  if (existingImages.length === 0) {
    console.log('❌ No images found in uploads/profile-pictures/');
    console.log('\n📝 INSTRUCTIONS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Save your 6 technician images to this folder:');
    console.log(`   ${uploadDir}`);
    console.log('\n2. Name them exactly:');
    imageMap.forEach((img, idx) => {
      console.log(`   ${idx + 1}. ${img}`);
    });
    console.log('\n3. Supported formats: .jpg, .jpeg, .png');
    console.log('\n4. After adding images, run this script again:');
    console.log('   npm run add-technician-images');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return;
  }

  console.log(`✅ Found ${existingImages.length} image files`);

  // Get all technicians
  const technicians = await prisma.technicianProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  console.log(`Found ${technicians.length} technicians`);

  let assigned = 0;
  for (let i = 0; i < technicians.length; i++) {
    const technician = technicians[i];
    const imageName = imageMap[i % imageMap.length];
    const imagePath = path.join(uploadDir, imageName);
    
    // Only assign if image exists
    if (fs.existsSync(imagePath)) {
      const profilePictureUrl = `${BACKEND_URL}/uploads/profile-pictures/${imageName}`;

      await prisma.technicianProfile.update({
        where: { id: technician.id },
        data: {
          profilePictureUrl,
        },
      });

      console.log(`✅ Assigned ${imageName} to ${technician.user.name}`);
      assigned++;
    }
  }

  console.log(`\n✅ Successfully assigned ${assigned} profile pictures!`);
  console.log(`\n📋 Images are now available at:`);
  existingImages.forEach((img, idx) => {
    console.log(`   ${idx + 1}. ${BACKEND_URL}/uploads/profile-pictures/${img}`);
  });
  console.log('\n💡 Restart your backend server if images don\'t appear immediately.');
}

addTechnicianImages()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });





