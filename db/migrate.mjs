import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  // Migrating user types
  console.log('[*] Searching for migrations..');
  const user_types = await prisma.user_type.findUnique({
    where: {
      id: 1,
    },
  });
  let is_migrated = false;

  if (!user_types) {
    is_migrated = true;
    console.log('[+] Creating user type..');
    // Add User record
    await prisma.user_type.create({
      data: {
        id: 1,
        name: 'User',
      },
    });

    // Add Blogger record
    await prisma.user_type.create({
      data: {
        id: 2,
        name: 'Blogger',
      },
    });
  }

  // Migrating user verification types
  const verification_types = await prisma.verification_types.findUnique({
    where: {
      id: 1,
    },
  });

  if (!verification_types) {
    is_migrated = true;
    console.log('[+] Creating verification types...');
    await prisma.verification_types.create({
      data: {
        id: 1,
        type: 'Email Verification',
      },
    });

    await prisma.verification_types.create({
      data: {
        id: 2,
        type: 'Password Change Verification',
      },
    });
  }

  if (is_migrated) {
    console.log('Migrations completed');
    return;
  }
  console.log('Migrations not required');
})();
