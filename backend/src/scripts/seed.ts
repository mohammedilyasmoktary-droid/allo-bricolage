import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create service categories
  const categories = [
    { name: 'Plomberie', description: 'Réparations et installations de plomberie' },
    { name: 'Électricité', description: 'Installations et réparations électriques' },
    { name: 'Peinture', description: 'Peinture intérieure et extérieure' },
    { name: 'Climatisation', description: 'Installation et réparation de climatisation' },
    { name: 'Serrurerie', description: 'Réparation et installation de serrures' },
    { name: 'Maçonnerie', description: 'Travaux de maçonnerie et construction' },
    { name: 'Équipements', description: 'Réparation d\'électroménager et équipements' },
    { name: 'Menuiserie', description: 'Travaux de menuiserie et charpente' },
    { name: 'Chauffage', description: 'Installation et réparation de systèmes de chauffage' },
    { name: 'Carrelage', description: 'Pose et réparation de carrelage' },
    // New categories
    { name: 'Réparations Générales', description: 'Réparations générales et maintenance' },
    { name: 'Climatisation & Chauffage', description: 'Installation et réparation de climatisation et systèmes de chauffage' },
    { name: 'Montage meubles', description: 'Montage et installation de meubles' },
    { name: 'Chauffe-eau', description: 'Installation et réparation de chauffe-eau' },
    { name: 'Multiservices', description: 'Services multiples et travaux divers' },
  ];

  console.log('📦 Creating service categories...');
  for (const category of categories) {
    await prisma.serviceCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }
  console.log(`✅ Created ${categories.length} categories`);

  // Create admin user
  console.log('👤 Creating admin user...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@allobricolage.ma' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@allobricolage.ma',
      phone: '+212600000000',
      passwordHash: adminPassword,
      city: 'Casablanca',
      role: 'ADMIN',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Generate 55 technicians (5 per city for 11 cities)
  console.log('🔧 Generating technicians...');
  
  // Moroccan names pool
  const firstNames = [
    'Ahmed', 'Mohamed', 'Youssef', 'Hassan', 'Karim', 'Omar', 'Rachid', 'Mehdi', 'Amine', 'Khalid',
    'Fatima', 'Aicha', 'Nadia', 'Laila', 'Samira', 'Houda', 'Imane', 'Souad', 'Sanae', 'Nabila',
    'Younes', 'Bilal', 'Anass', 'Reda', 'Zakaria', 'Hamza', 'Ayoub', 'Ilyas', 'Marouane', 'Adil',
    'Salma', 'Khadija', 'Meriem', 'Zineb', 'Hafsa', 'Amina', 'Meryem', 'Siham', 'Najat', 'Latifa'
  ];

  const lastNames = [
    'Benali', 'Alami', 'Tazi', 'El Amrani', 'Bensaid', 'Idrissi', 'El Fassi', 'Alaoui', 'Bennani',
    'Chraibi', 'El Ouazzani', 'Berrada', 'Ziani', 'El Malki', 'Amrani', 'Bennani', 'El Fassi',
    'Tazi', 'Chraibi', 'Bennani', 'El Malki', 'Ziani', 'Berrada', 'El Ouazzani', 'Chraibi',
    'El Idrissi', 'El Khattabi', 'El Haddadi', 'El Moussaoui', 'El Ghazali'
  ];

  // Skill combinations (2-4 skills per technician)
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
    ['Climatisation & Chauffage', 'Multiservices'],
    ['Plomberie', 'Réparations Générales'],
    ['Électricité', 'Chauffe-eau'],
    ['Menuiserie', 'Montage meubles', 'Multiservices'],
    ['Plomberie', 'Chauffe-eau', 'Multiservices'],
  ];

  // Cities to generate technicians for
  const targetCities = [
    'Agadir', 'Casablanca', 'Rabat', 'Tanger', 'Fès', 'Marrakech', 
    'Oujda', 'Nador', 'Berkane', 'Saïdia', 'Tetouan'
  ];

  // Generate technician data
  let emailCounter = 10000; // Start from higher number to avoid conflicts
  const technicianData: any[] = [];
  const usedNames = new Set<string>();
  const usedEmails = new Set<string>(); // Track used emails to prevent duplicates

  function generateEmail(name: string, cityIndex: number, techIndex: number): string {
    const cleanName = name.toLowerCase().replace(/\s+/g, '.');
    // Include city index and tech index to ensure uniqueness
    emailCounter++;
    const email = `${cleanName}.${cityIndex}.${techIndex}.${emailCounter}@technician.ma`;
    return email;
  }

  function generatePhone(): string {
    const random = Math.floor(1000000 + Math.random() * 9000000);
    return `+2126${random}`;
  }

  function generateRating(): number {
    return Math.round((3.5 + Math.random() * 1.5) * 10) / 10;
  }

  function generateExperience(): number {
    return Math.floor(2 + Math.random() * 11);
  }

  function generatePricing(experience: number) {
    const baseHourly = 100 + (experience * 5) + Math.floor(Math.random() * 30);
    const basePrice = baseHourly * 2;
    return { hourlyRate: baseHourly, basePrice };
  }

  function generateBio(name: string, skills: string[], experience: number): string {
    const skillList = skills.join(', ');
    return `${name} est un technicien expérimenté avec ${experience} ans d'expérience en ${skillList}. Service professionnel et intervention rapide.`;
  }

  // Generate 5 technicians per city
  let cityIndex = 0;
  for (const city of targetCities) {
    for (let i = 0; i < 5; i++) {
      let name: string;
      let email: string;
      // Generate unique name and email
      do {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        name = `${firstName} ${lastName}`;
        email = generateEmail(name, cityIndex, i);
      } while (usedNames.has(name) || usedEmails.has(email));
      usedNames.add(name);
      usedEmails.add(email);

      const skills = skillCombinations[Math.floor(Math.random() * skillCombinations.length)];
      const experience = generateExperience();
      const rating = generateRating();
      const pricing = generatePricing(experience);
      const isOnline = Math.random() > 0.4; // 60% online

      technicianData.push({
        name,
        email,
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
      });
    }
    cityIndex++;
  }

  // Helper to add averageRating to existing technicians
  const addRatingToTech = (tech: any) => ({
    ...tech,
    averageRating: tech.averageRating || Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
  });

  // Merge with existing technicians (avoid duplicates by email)
  const existingTechnicianData = [
    {
      name: 'Ahmed Benali',
      email: 'ahmed@technician.ma',
      phone: '+212611111111',
      city: 'Casablanca',
      skills: ['Plomberie', 'Électricité'],
      yearsOfExperience: 8,
      hourlyRate: 150,
      basePrice: 300,
      bio: 'Plombier et électricien expérimenté avec plus de 8 ans d\'expérience. Service rapide et professionnel.',
      verificationStatus: 'APPROVED' as const,
      isOnline: true,
      averageRating: 4.5,
    },
    {
      name: 'Fatima Alami',
      email: 'fatima@technician.ma',
      phone: '+212622222222',
      city: 'Rabat',
      skills: ['Peinture', 'Carrelage'],
      yearsOfExperience: 5,
      hourlyRate: 120,
      basePrice: 250,
      bio: 'Spécialiste en peinture et carrelage. Travaux soignés et finitions impeccables.',
      verificationStatus: 'APPROVED' as const,
      isOnline: true,
      averageRating: 4.7,
    },
    {
      name: 'Mohamed Tazi',
      email: 'mohamed@technician.ma',
      phone: '+212633333333',
      city: 'Marrakech',
      skills: ['Menuiserie', 'Climatisation'],
      yearsOfExperience: 12,
      hourlyRate: 180,
      basePrice: 400,
      bio: 'Menuisier et technicien en climatisation avec une grande expérience. Qualité garantie.',
      verificationStatus: 'APPROVED' as const,
      isOnline: false,
      averageRating: 4.8,
    },
    {
      name: 'Youssef El Amrani',
      email: 'youssef.elamrani@technician.ma',
      phone: '+212644444444',
      city: 'Fès',
      skills: ['Plomberie', 'Chauffage'],
      yearsOfExperience: 7,
      hourlyRate: 140,
      basePrice: 280,
      bio: 'Spécialiste en plomberie et systèmes de chauffage. Intervention rapide 24/7.',
      verificationStatus: 'APPROVED' as const,
      isOnline: true,
    },
    {
      name: 'Aicha Bensaid',
      email: 'aicha.bensaid@technician.ma',
      phone: '+212655555555',
      city: 'Agadir',
      skills: ['Électricité', 'Équipements'],
      yearsOfExperience: 6,
      hourlyRate: 130,
      basePrice: 260,
      bio: 'Électricienne certifiée et réparatrice d\'électroménager. Service de qualité.',
      verificationStatus: 'APPROVED' as const,
      isOnline: true,
    },
    {
      name: 'Hassan Idrissi',
      email: 'hassan.idrissi@technician.ma',
      phone: '+212666666666',
      city: 'Tanger',
      skills: ['Maçonnerie', 'Petits travaux'],
      yearsOfExperience: 10,
      hourlyRate: 160,
      basePrice: 320,
      bio: 'Maçon expérimenté pour tous types de travaux de construction et rénovation.',
      verificationStatus: 'APPROVED' as const,
      isOnline: true,
    },
    {
      name: 'Karim El Fassi',
      email: 'karim.elfassi@technician.ma',
      phone: '+212677777777',
      city: 'Meknès',
      skills: ['Climatisation', 'Électricité'],
      yearsOfExperience: 9,
      hourlyRate: 170,
      basePrice: 350,
      bio: 'Technicien spécialisé en climatisation et électricité. Réparation rapide et efficace.',
      verificationStatus: 'APPROVED' as const,
      isOnline: false,
    },
    {
      name: 'Sanae Alaoui',
      email: 'sanae.alaoui@technician.ma',
      phone: '+212688888888',
      city: 'Oujda',
      skills: ['Peinture', 'Jardinage'],
      yearsOfExperience: 4,
      hourlyRate: 110,
      basePrice: 220,
      bio: 'Peintre professionnelle et spécialiste en aménagement de jardins. Travaux soignés.',
      verificationStatus: 'APPROVED' as const,
      isOnline: true,
    },
    {
      name: 'Omar Bennani',
      email: 'omar.bennani@technician.ma',
      phone: '+212699999999',
      city: 'Kenitra',
      skills: ['Serrurerie', 'Petits travaux'],
      yearsOfExperience: 11,
      hourlyRate: 145,
      basePrice: 290,
      bio: 'Serrurier professionnel avec plus de 11 ans d\'expérience. Intervention rapide.',
      verificationStatus: 'APPROVED' as const,
      isOnline: true,
    },
    {
      name: 'Nadia Chraibi',
      email: 'nadia.chraibi@technician.ma',
      phone: '+212610101010',
      city: 'Tetouan',
      skills: ['Équipements', 'Électricité'],
      yearsOfExperience: 5,
      hourlyRate: 125,
      basePrice: 240,
      bio: 'Réparatrice d\'électroménager et électricienne. Service rapide et fiable.',
      verificationStatus: 'APPROVED' as const,
      isOnline: true,
    },
    {
      name: 'Rachid El Ouazzani',
      email: 'rachid.elouazzani@technician.ma',
      phone: '+212611111112',
      city: 'Mohammedia',
      skills: ['Plomberie', 'Carrelage'],
      yearsOfExperience: 8,
      hourlyRate: 150,
      basePrice: 300,
      bio: 'Plombier et carreleur expérimenté. Travaux de qualité garantis.',
      verificationStatus: 'APPROVED' as const,
      isOnline: true,
    },
    {
      name: 'Laila Berrada',
      email: 'laila.berrada@technician.ma',
      phone: '+212612121212',
      city: 'El Jadida',
      skills: ['Peinture', 'Petits travaux'],
      yearsOfExperience: 6,
      hourlyRate: 120,
      basePrice: 250,
      bio: 'Peintre professionnelle pour tous vos besoins de rénovation intérieure et extérieure.',
      verificationStatus: 'APPROVED' as const,
      isOnline: false,
    },
    {
      name: 'Mehdi Ziani',
      email: 'mehdi.ziani@technician.ma',
      phone: '+212613131313',
      city: 'Safi',
      skills: ['Maçonnerie', 'Carrelage'],
      yearsOfExperience: 13,
      hourlyRate: 175,
      basePrice: 380,
      bio: 'Maçon et carreleur avec une grande expérience. Travaux de construction et rénovation.',
      verificationStatus: 'APPROVED' as const,
      isOnline: true,
    },
    {
      name: 'Samira El Malki',
      email: 'samira.elmalki@technician.ma',
      phone: '+212614141414',
      city: 'Salé',
      skills: ['Peinture', 'Petits travaux'],
      yearsOfExperience: 7,
      hourlyRate: 100,
      basePrice: 200,
      bio: 'Spécialiste en peinture et petits travaux. Rénovation et décoration intérieure.',
      verificationStatus: 'APPROVED' as const,
      isOnline: true,
    },
    {
      name: 'Khalid Amrani',
      email: 'khalid.amrani@technician.ma',
      phone: '+212615151515',
      city: 'Temara',
      skills: ['Climatisation', 'Chauffage'],
      yearsOfExperience: 10,
      hourlyRate: 180,
      basePrice: 400,
      bio: 'Technicien spécialisé en climatisation et chauffage. Installation et réparation.',
      verificationStatus: 'APPROVED' as const,
      isOnline: true,
    },
    {
      name: 'Houda El Fassi',
      email: 'houda.elfassi@technician.ma',
      phone: '+212616161616',
      city: 'Beni Mellal',
      skills: ['Électricité', 'Serrurerie'],
      yearsOfExperience: 9,
      hourlyRate: 155,
      basePrice: 310,
      bio: 'Électricienne et serrurière professionnelle. Service complet et rapide.',
      verificationStatus: 'APPROVED' as const,
      isOnline: false,
    },
    {
      name: 'Amine Tazi',
      email: 'amine.tazi@technician.ma',
      phone: '+212617171717',
      city: 'Khouribga',
      skills: ['Plomberie', 'Maçonnerie'],
      yearsOfExperience: 11,
      hourlyRate: 165,
      basePrice: 340,
      bio: 'Plombier et maçon expérimenté. Travaux de qualité pour tous vos besoins.',
      verificationStatus: 'APPROVED' as const,
      isOnline: true,
    },
    {
      name: 'Imane Alaoui',
      email: 'imane.alaoui@technician.ma',
      phone: '+212618181818',
      city: 'Nador',
      skills: ['Peinture', 'Équipements'],
      yearsOfExperience: 5,
      hourlyRate: 115,
      basePrice: 230,
      bio: 'Peintre et réparatrice d\'électroménager. Service professionnel et soigné.',
      verificationStatus: 'APPROVED' as const,
      isOnline: true,
    },
    {
      name: 'Younes Bennani',
      email: 'younes.bennani@technician.ma',
      phone: '+212619191919',
      city: 'Settat',
      skills: ['Menuiserie', 'Petits travaux'],
      yearsOfExperience: 8,
      hourlyRate: 160,
      basePrice: 330,
      bio: 'Menuisier professionnel pour tous vos travaux de menuiserie et rénovation.',
      verificationStatus: 'APPROVED' as const,
      isOnline: true,
    },
    {
      name: 'Souad Chraibi',
      email: 'souad.chraibi@technician.ma',
      phone: '+212620202020',
      city: 'Ouarzazate',
      skills: ['Peinture', 'Carrelage'],
      yearsOfExperience: 6,
      hourlyRate: 110,
      basePrice: 220,
      bio: 'Spécialiste en peinture et carrelage. Aménagement et décoration intérieure/extérieure.',
      verificationStatus: 'APPROVED' as const,
      isOnline: false,
    },
    // Add 3 more technicians for "Disponible Maintenant"
    {
      name: 'Omar El Fassi',
      email: 'omar.elfassi@technician.ma',
      phone: '+212621212121',
      city: 'Casablanca',
      skills: ['Plomberie', 'Électricité'],
      yearsOfExperience: 9,
      hourlyRate: 160,
      basePrice: 320,
      bio: 'Plombier et électricien expérimenté. Intervention rapide et service professionnel.',
      verificationStatus: 'APPROVED' as const,
      isOnline: true,
    },
    {
      name: 'Nadia Tazi',
      email: 'nadia.tazi@technician.ma',
      phone: '+212622222222',
      city: 'Rabat',
      skills: ['Climatisation', 'Chauffage'],
      yearsOfExperience: 7,
      hourlyRate: 150,
      basePrice: 300,
      bio: 'Technicienne spécialisée en climatisation et chauffage. Installation et maintenance.',
      verificationStatus: 'APPROVED' as const,
      isOnline: true,
    },
    {
      name: 'Rachid Benali',
      email: 'rachid.benali@technician.ma',
      phone: '+212623232323',
      city: 'Marrakech',
      skills: ['Menuiserie', 'Serrurerie'],
      yearsOfExperience: 11,
      hourlyRate: 170,
      basePrice: 350,
      bio: 'Menuisier et serrurier professionnel. Travaux de qualité et finitions soignées.',
      verificationStatus: 'APPROVED' as const,
      isOnline: true,
    },
  ];

  // Merge all technicians (new + existing) and ensure all have ratings
  const allTechnicianData = [
    ...technicianData,
    ...existingTechnicianData.map(addRatingToTech),
  ];
  console.log(`📊 Total technicians to create: ${allTechnicianData.length} (${technicianData.length} new + ${existingTechnicianData.length} existing)`);

  // Profile picture URLs - using placeholder images that match technician skills
  // These will be replaced with actual uploaded images
  const profilePictureUrls = [
    'http://localhost:5001/uploads/profile-pictures/technician_1.jpg', // Handyman with drill
    'http://localhost:5001/uploads/profile-pictures/technician_2.jpg', // HVAC technician
    'http://localhost:5001/uploads/profile-pictures/technician_3.jpg', // Electrician
    'http://localhost:5001/uploads/profile-pictures/technician_4.jpg', // General technician
    'http://localhost:5001/uploads/profile-pictures/technician_5.jpg', // Carpenter
    'http://localhost:5001/uploads/profile-pictures/technician_6.jpg', // Plumber
    'http://localhost:5001/uploads/profile-pictures/technician_7.jpg', // General technician
    'http://localhost:5001/uploads/profile-pictures/technician_8.jpg', // General technician
  ];

  for (let i = 0; i < allTechnicianData.length; i++) {
    const techData = allTechnicianData[i];
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: techData.email },
    });

    let user;
    if (existingUser) {
      // User exists, use it
      user = existingUser;
    } else {
      // Create new user
      const passwordHash = await bcrypt.hash('technician123', 10);
      user = await prisma.user.create({
        data: {
          name: techData.name,
          email: techData.email,
          phone: techData.phone,
          passwordHash,
          city: techData.city,
          role: 'TECHNICIAN',
        },
      });
    }

    // Assign profile picture based on index (cycling through available images)
    const profilePictureUrl = profilePictureUrls[i % profilePictureUrls.length];

    // Check if profile already exists
    let profile = await prisma.technicianProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      // Create new profile
      profile = await prisma.technicianProfile.create({
        data: {
          userId: user.id,
          skills: techData.skills,
          yearsOfExperience: techData.yearsOfExperience,
          hourlyRate: techData.hourlyRate,
          basePrice: techData.basePrice,
          bio: techData.bio,
          profilePictureUrl,
          verificationStatus: techData.verificationStatus,
          isOnline: techData.isOnline,
          averageRating: techData.averageRating || 0,
        },
      });
    } else {
      // Update existing profile (only if it's missing data)
      profile = await prisma.technicianProfile.update({
        where: { userId: user.id },
        data: {
          profilePictureUrl: profile.profilePictureUrl || profilePictureUrl,
          ...(techData.averageRating && !profile.averageRating && { averageRating: techData.averageRating }),
        },
      });
    }

    // Assign FREE_TRIAL subscription to new technicians
    const existingSubscription = await prisma.subscription.findFirst({
      where: { technicianProfileId: profile.id },
    });

    if (!existingSubscription) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7); // 7-day free trial

      await prisma.subscription.create({
        data: {
          technicianProfileId: profile.id,
          plan: 'FREE_TRIAL',
          status: 'ACTIVE',
          startDate: new Date(),
          endDate,
          autoRenew: false,
        },
      });
    }
  }
  console.log(`✅ Created ${allTechnicianData.length} technicians with subscriptions`);

  // Create sample client
  console.log('👥 Creating sample client...');
  const clientPassword = await bcrypt.hash('client123', 10);
  const client = await prisma.user.upsert({
    where: { email: 'client@example.ma' },
    update: {
      name: 'Fatima Zahra Alaoui', // Update existing client name too
    },
    create: {
      name: 'Fatima Zahra Alaoui',
      email: 'client@example.ma',
      phone: '+212644444444',
      passwordHash: clientPassword,
      city: 'Casablanca',
      role: 'CLIENT',
    },
  });
  console.log('✅ Created sample client:', client.email);

  console.log('✨ Seed completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log('Admin: admin@allobricolage.ma / admin123');
  console.log('Technician: ahmed@technician.ma / technician123');
  console.log('Client: client@example.ma / client123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

