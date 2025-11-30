/**
 * Script to create placeholder technician images
 * Run with: node scripts/create-placeholder-images.js
 */

const fs = require('fs');
const path = require('path');

const colors = [
  { bg: '#032B5A', text: '#F4C542', name: 'Dark Blue' },
  { bg: '#F4C542', text: '#032B5A', name: 'Yellow' },
  { bg: '#021d3f', text: '#F4C542', name: 'Dark Blue 2' },
  { bg: '#032B5A', text: '#FFFFFF', name: 'Blue White' },
  { bg: '#F4C542', text: '#032B5A', name: 'Yellow Blue' },
  { bg: '#021d3f', text: '#F4C542', name: 'Dark Yellow' },
  { bg: '#032B5A', text: '#F4C542', name: 'Blue Yellow' },
  { bg: '#F4C542', text: '#021d3f', name: 'Yellow Dark' },
];

const names = ['Ahmed', 'Fatima', 'Mohamed', 'Youssef', 'Karim', 'Hassan', 'Omar', 'Ali'];

const outputDir = path.join(__dirname, '../public/images/technicians');

// Ensure directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create SVG placeholder images
for (let i = 1; i <= 8; i++) {
  const color = colors[i - 1];
  const name = names[i - 1];
  
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="800" fill="${color.bg}"/>
  <circle cx="600" cy="300" r="120" fill="${color.text}" opacity="0.3"/>
  <text x="600" y="450" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="${color.text}" text-anchor="middle">${name.charAt(0)}</text>
  <text x="600" y="550" font-family="Arial, sans-serif" font-size="48" fill="${color.text}" text-anchor="middle" opacity="0.8">${name}</text>
  <text x="600" y="650" font-family="Arial, sans-serif" font-size="32" fill="${color.text}" text-anchor="middle" opacity="0.6">Technicien Professionnel</text>
  <text x="600" y="750" font-family="Arial, sans-serif" font-size="24" fill="${color.text}" text-anchor="middle" opacity="0.5">Allo Bricolage</text>
</svg>`;

  // Save as SVG
  const svgPath = path.join(outputDir, `technician_${i}.svg`);
  fs.writeFileSync(svgPath, svg);
  
  console.log(`✅ Created: technician_${i}.svg`);
}

console.log('\n✅ All placeholder images created!');
console.log('📁 Location: frontend/public/images/technicians/');
console.log('\n💡 Note: These are SVG placeholders. Replace with actual JPG/PNG images when ready.');






