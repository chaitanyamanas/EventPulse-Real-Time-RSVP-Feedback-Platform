import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create test users
  const testUsers = [
    {
      email: 'test@example.com',
      password: await bcrypt.hash('test1234', 10),
      name: 'Test User',
      role: 'USER',
    },
    {
      email: 'host@example.com',
      password: await bcrypt.hash('test1234', 10),
      name: 'Host User',
      role: 'HOST',
    },
    {
      email: 'admin@example.com',
      password: await bcrypt.hash('test1234', 10),
      name: 'Admin User',
      role: 'ADMIN',
    },
  ];

  console.log('Creating test users...');
  for (const user of testUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        password: user.password,
        name: user.name,
        role: user.role as any,
      },
    });
  }

  // Create some test events
  const hostUser = await prisma.user.findUnique({
    where: { email: 'host@example.com' },
  });

  if (hostUser) {
    const testEvents = [
      {
        title: 'Tech Conference 2024',
        description: 'Annual technology conference',
        dateTime: new Date('2024-04-01T09:00:00Z'),
        timezone: 'UTC',
        location: 'Virtual',
        rsvpDeadline: new Date('2024-03-25'),
        maxAttendees: 200,
        status: 'SCHEDULED',
        hostId: hostUser.id,
      },
      {
        title: 'Workshop: React Best Practices',
        description: 'Learn React best practices',
        dateTime: new Date('2024-03-20T14:00:00Z'),
        timezone: 'UTC',
        location: 'Conference Room A',
        rsvpDeadline: new Date('2024-03-18'),
        maxAttendees: 50,
        status: 'LIVE',
        hostId: hostUser.id,
      },
    ];

    console.log('Creating test events...');
    for (const event of testEvents) {
      await prisma.event.create({
        data: event as any,
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 