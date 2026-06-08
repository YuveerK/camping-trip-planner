import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL']! });
const prisma = new PrismaClient({ adapter });

const DEFAULT_CATEGORIES = [
  'Tent & Sleeping',
  'Cooking',
  'Food',
  'Drinks',
  'Lighting & Power',
  'Fire & Braai',
  'Tools',
  'Toiletries',
  'Safety & Medical',
  'Entertainment',
  'Other',
];

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@camping.app' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@camping.app',
      passwordHash,
    },
  });

  console.log('Demo user created:', user.email);

  const trip = await prisma.trip.upsert({
    where: { id: 'demo-trip-001' },
    update: {},
    create: {
      id: 'demo-trip-001',
      name: 'Weekend Braai Trip',
      campsiteName: 'Magalies Mountain Lodge',
      location: 'Magaliesburg, South Africa',
      checkInDate: new Date('2026-07-04'),
      checkOutDate: new Date('2026-07-06'),
      description: 'Epic weekend camping trip with the crew!',
      createdById: user.id,
      members: {
        create: {
          userId: user.id,
          role: 'OWNER',
        },
      },
    },
  });

  for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
    await prisma.packingCategory.upsert({
      where: { id: `demo-cat-${i}` },
      update: {},
      create: {
        id: `demo-cat-${i}`,
        tripId: trip.id,
        name: DEFAULT_CATEGORIES[i]!,
        sortOrder: i,
      },
    });
  }

  console.log('Demo trip and categories created:', trip.name);
  console.log('\nSeeding complete!');
  console.log('Login with: demo@camping.app / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
