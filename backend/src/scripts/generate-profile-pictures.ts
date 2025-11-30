import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

/**
 * Script to convert SVG placeholders to JPG profile pictures
 * Reads SVG files from frontend/public/images/technicians/
 * Converts and saves them to backend/uploads/profile-pictures/
 */
async function generateProfilePictures() {
  console.log('🖼️  Generating profile pictures from SVG placeholders...');

  const frontendImagesDir = path.join(__dirname, '..', '..', '..', 'frontend', 'public', 'images', 'technicians');
  const backendUploadsDir = path.join(__dirname, '..', '..', 'uploads', 'profile-pictures');

  // Ensure backend uploads directory exists
  if (!fs.existsSync(backendUploadsDir)) {
    fs.mkdirSync(backendUploadsDir, { recursive: true });
    console.log('📁 Created uploads/profile-pictures directory');
  }

  const imageFiles = [
    'technician_1.svg',
    'technician_2.svg',
    'technician_3.svg',
    'technician_4.svg',
    'technician_5.svg',
    'technician_6.svg',
    'technician_7.svg',
    'technician_8.svg',
  ];

  let converted = 0;
  let skipped = 0;

  for (const svgFile of imageFiles) {
    const svgPath = path.join(frontendImagesDir, svgFile);
    const jpgName = svgFile.replace('.svg', '.jpg');
    const jpgPath = path.join(backendUploadsDir, jpgName);

    // Check if SVG exists
    if (!fs.existsSync(svgPath)) {
      console.log(`⚠️  ${svgFile} not found, skipping...`);
      skipped++;
      continue;
    }

    // Check if JPG already exists
    if (fs.existsSync(jpgPath)) {
      console.log(`⏭️  ${jpgName} already exists, skipping...`);
      skipped++;
      continue;
    }

    try {
      // Convert SVG to JPG
      await sharp(svgPath)
        .resize(800, 800, {
          fit: 'contain',
          background: { r: 3, g: 43, b: 90 }, // #032B5A background
        })
        .jpeg({ quality: 90 })
        .toFile(jpgPath);

      console.log(`✅ Converted ${svgFile} → ${jpgName}`);
      converted++;
    } catch (error: any) {
      console.error(`❌ Error converting ${svgFile}:`, error.message);
    }
  }

  console.log(`\n✅ Conversion complete!`);
  console.log(`   Converted: ${converted} images`);
  console.log(`   Skipped: ${skipped} images`);
  console.log(`\n📁 Images saved to: ${backendUploadsDir}`);
  console.log(`\n💡 Next step: Run 'npm run assign-provided-images' to assign these to technicians`);
}

generateProfilePictures()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });





