import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

/**
 * Script to assign the provided technician images to profiles
 * 
 * INSTRUCTIONS:
 * 1. Save the 6 provided images to: backend/uploads/profile-pictures/
 * 2. Name them exactly: technician_1.jpg, technician_2.jpg, etc.
 * 3. Run this script: npm run assign-provided-images
 */
async function assignProvidedImages() {
  console.log('🖼️  Assigning provided images to technicians...');

  const port = process.env.PORT || 5001;
  const baseUrl = process.env.BACKEND_URL || `http://localhost:${port}`;
  
  // Map of image names to assign
  const imageMap = [
    'technician_1.jpg', // Handyman with drill
    'technician_2.jpg', // HVAC technician
    'technician_3.jpg', // Electrician
    'technician_4.jpg', // General technician
    'technician_5.jpg', // Carpenter
    'technician_6.jpg', // Plumber
    'technician_7.jpg', // General technician
    'technician_8.jpg', // General technician
  ];

  const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'profile-pictures');
  
  // Ensure directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('📁 Created uploads/profile-pictures directory');
  }
  
  // Check which images exist (for warning only)
  const existingImages = imageMap.filter(img => {
    const filePath = path.join(uploadDir, img);
    return fs.existsSync(filePath);
  });

  if (existingImages.length === 0) {
    console.log('⚠️  No image files found in uploads/profile-pictures/');
    console.log('📝 Assigning URLs anyway - you can add the images later');
    console.log('💡 To add images: Save them as technician_1.jpg through technician_8.jpg in backend/uploads/profile-pictures/');
  } else {
    console.log(`✅ Found ${existingImages.length} image files`);
  }

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
    const profilePictureUrl = `${baseUrl}/uploads/profile-pictures/${imageName}`;
    
    // Assign URL regardless of file existence (images can be added later)
    await prisma.technicianProfile.update({
      where: { id: technician.id },
      data: {
        profilePictureUrl,
      },
    });

    const exists = fs.existsSync(imagePath);
    const status = exists ? '✅' : '⚠️ ';
    console.log(`${status} Assigned ${imageName} to ${technician.user.name}${exists ? '' : ' (file not found - add image later)'}`);
    assigned++;
  }

  console.log(`\n✅ Successfully assigned ${assigned} profile picture URLs`);
  console.log(`\n📋 Profile picture URLs assigned:`);
  imageMap.forEach((img, idx) => {
    const exists = fs.existsSync(path.join(uploadDir, img));
    const status = exists ? '✅' : '⚠️ ';
    console.log(`   ${status} ${idx + 1}. ${baseUrl}/uploads/profile-pictures/${img}${exists ? '' : ' (file missing)'}`);
  });
  
  if (existingImages.length < imageMap.length) {
    console.log(`\n💡 To add missing images:`);
    console.log(`   1. Save your images to: ${uploadDir}`);
    console.log(`   2. Name them exactly: technician_1.jpg, technician_2.jpg, etc.`);
    console.log(`   3. Images will automatically appear once files are in place!`);
  }
}

assignProvidedImages()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

