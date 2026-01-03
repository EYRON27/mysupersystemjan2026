import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default transaction categories to seed for each new user
export const defaultTransactionCategories = [
  'Business',
  'Personal',
  'Personal Business',
  'Food',
  'Transport',
  'Entertainment',
  'Shopping',
  'Bills',
  'Health',
  'Education',
];

// Default password categories to seed for each new user
export const defaultPasswordCategories = [
  'Social',
  'Banking',
  'Work',
  'Shopping',
  'Entertainment',
];

async function main() {
  console.log('🌱 Starting database seeding...');

  // Note: In production, default categories are created per-user during signup
  // This seed file is mainly for development and testing

  console.log('✅ Database seeding complete!');
  console.log('');
  console.log('Default categories will be created automatically when users sign up.');
  console.log('');
  console.log('Transaction Categories:', defaultTransactionCategories.join(', '));
  console.log('Password Categories:', defaultPasswordCategories.join(', '));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

export { prisma };
