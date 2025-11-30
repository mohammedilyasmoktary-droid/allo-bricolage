import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Moroccan names pool
const firstNames = [
  'Ahmed', 'Mohamed', 'Youssef', 'Hassan', 'Karim', 'Omar', 'Rachid', 'Mehdi', 'Amine', 'Khalid',
  'Fatima', 'Aicha', 'Nadia', 'Laila', 'Samira', 'Houda', 'Imane', 'Souad', 'Sanae', 'Nabila',
  'Younes', 'Bilal', 'Anass', 'Reda', 'Zakaria', 'Hamza', 'Ayoub', 'Ilyas', 'Marouane', 'Adil'
];

const lastNames = [
  'Benali', 'Alami', 'Tazi', 'El Amrani', 'Bensaid', 'Idrissi', 'El Fassi', 'Alaoui', 'Bennani',
  'Chraibi', 'El Ouazzani', 'Berrada', 'Ziani', 'El Malki', 'Amrani', 'Bennani', 'El Fassi',
  'Tazi', 'Chraibi', 'Bennani', 'El Malki', 'Ziani', 'Berrada', 'El Ouazzani', 'Chraibi'
];

// Skills combinations (2-4 skills per technician)
const skillCombinations = [
  ['Plomberie', 'Chauffe-eau'],
  ['Électricité', 'Réparations Générales'],
  ['Climatisation & Chauffage', 'Électricité'],
  ['Menuiserie', 'Montage meubles'],
  ['Plomberie', 'Électricité', 'Réparations Générales'],
  ['Climatisation & Chauffage', 'Chauffe-eau'],
  ['Menuiserie', 'Réparations Générales', 'Montage meubles'],
  ['Électricité', 'Multiservices'],
  ['Plomberie', 'Chauffe-eau', 'Réparations Générales'],
  ['Climatisation & Chauffage', 'Électricité', 'Multiservices'],
  ['Menuiserie', 'Montage meubles', 'Réparations Générales'],
  ['Électricité', 'Plomberie', 'Multiservices'],
  ['Climatisation & Chauffage', 'Chauffe-eau', 'Réparations Générales'],
  ['Menuiserie', 'Réparations Générales'],
  ['Plomberie', 'Électricité', 'Chauffe-eau', 'Multiservices'],
];

// Cities to generate technicians for
const targetCities = [
  'Agadir', 'Casablanca', 'Rabat', 'Tanger', 'Fès', 'Marrakech', 
  'Oujda', 'Nador', 'Berkane', 'Saïdia', 'Tetouan'
];

// Generate unique email
let emailCounter = 1000;

function generateEmail(name: string): string {
  const cleanName = name.toLowerCase().replace(/\s+/g, '.');
  emailCounter++;
  return `${cleanName}.${emailCounter}@technician.ma`;
}

// Generate phone number
function generatePhone(): string {
  const random = Math.floor(1000000 + Math.random() * 9000000);
  return `+2126${random}`;
}

// Generate random rating (3.5 to 5.0)
function generateRating(): number {
  return Math.round((3.5 + Math.random() * 1.5) * 10) / 10;
}

// Generate years of experience (2 to 12)
function generateExperience(): number {
  return Math.floor(2 + Math.random() * 11);
}

// Generate pricing
function generatePricing(experience: number) {
  const baseHourly = 100 + (experience * 5) + Math.floor(Math.random() * 30);
  const basePrice = baseHourly * 2;
  return {
    hourlyRate: baseHourly,
    basePrice: basePrice,
  };
}

// Generate bio based on skills
function generateBio(name: string, skills: string[], experience: number): string {
  const skillList = skills.join(', ');
  return `${name} est un technicien expérimenté avec ${experience} ans d'expérience en ${skillList}. Service professionnel et intervention rapide.`;
}

// Generate technician data for a city
function generateTechniciansForCity(city: string, count: number = 5) {
  const technicians = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    let name: string;
    do {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      name = `${firstName} ${lastName}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    const skills = skillCombinations[Math.floor(Math.random() * skillCombinations.length)];
    const experience = generateExperience();
    const rating = generateRating();
    const pricing = generatePricing(experience);
    const isOnline = Math.random() > 0.4; // 60% online

    technicians.push({
      name,
      email: generateEmail(name),
      phone: generatePhone(),
      city,
      skills,
      yearsOfExperience: experience,
      hourlyRate: pricing.hourlyRate,
      basePrice: pricing.basePrice,
      bio: generateBio(name, skills, experience),
      verificationStatus: 'APPROVED' as const,
      isOnline,
      averageRating: rating,
      profilePictureUrl: `http://localhost:5001/uploads/profile-pictures/technician_${(i % 8) + 1}.jpg`,
    });
  }

  return technicians;
}

export async function generateAllTechnicians() {
  const allTechnicians = [];

  for (const city of targetCities) {
    const cityTechnicians = generateTechniciansForCity(city, 5);
    allTechnicians.push(...cityTechnicians);
  }

  return allTechnicians;
}

// If run directly
if (require.main === module) {
  generateAllTechnicians()
    .then(techs => {
      console.log(`Generated ${techs.length} technicians`);
      console.log('Sample:', techs[0]);
    })
    .catch(console.error);
}




