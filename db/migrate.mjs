import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  // Migrating user types
  console.log('[*] Searching for migrations..');

  // Migrating user verification types
  const permission_types = await prisma.permission_types.findUnique({
    where: {
      id: 1,
    },
  });

  let is_migrated = false;

  // Creating verification types
  if (!permission_types) {
    is_migrated = true;
    console.log('[+] Creating verification types...');
    await prisma.permission_types.create({
      data: {
        id: 1,
        type: 'Owner',
      },
    });

    await prisma.permission_types.create({
      data: {
        id: 2,
        type: 'Writer',
      },
    });
  }

  const user_status = await prisma.user_status.findUnique({
    where: {
      id: 1,
    },
  });

  //  Creating user status types
  if (!user_status) {
    is_migrated = true;
    console.log('[+] Creating user status...');
    await prisma.user_status.create({
      data: {
        id: 1,
        status: 'Active',
      },
    });

    await prisma.user_status.create({
      data: {
        id: 2,
        status: 'Inactive',
      },
    });

    await prisma.user_status.create({
      data: {
        id: 3,
        status: 'Banned',
      },
    });
  }

  if (is_migrated) {
    console.log('[+] Migrations completed');
    return;
  }
  console.log('[-] Migrations not required');
})();
