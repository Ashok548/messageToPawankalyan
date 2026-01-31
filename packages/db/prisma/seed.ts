import { PrismaClient, ProjectStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create test users
    const passwordHash = await bcrypt.hash('password123', 10);

    const user1 = await prisma.user.upsert({
        where: { email: 'john@example.com' },
        update: {},
        create: {
            email: 'john@example.com',
            name: 'John Doe',
            passwordHash,
        },
    });

    const user2 = await prisma.user.upsert({
        where: { email: 'jane@example.com' },
        update: {},
        create: {
            email: 'jane@example.com',
            name: 'Jane Smith',
            passwordHash,
        },
    });

    console.log('✅ Created users:', { user1: user1.email, user2: user2.email });

    // Create test projects
    const project1 = await prisma.project.create({
        data: {
            name: 'Website Redesign',
            description: 'Complete redesign of the company website',
            status: ProjectStatus.ACTIVE,
            ownerId: user1.id,
        },
    });

    const project2 = await prisma.project.create({
        data: {
            name: 'Mobile App Development',
            description: 'Build a new mobile app for iOS and Android',
            status: ProjectStatus.ACTIVE,
            ownerId: user1.id,
        },
    });

    const project3 = await prisma.project.create({
        data: {
            name: 'Marketing Campaign',
            description: 'Q1 marketing campaign planning and execution',
            status: ProjectStatus.ON_HOLD,
            ownerId: user2.id,
        },
    });

    console.log('✅ Created projects:', {
        project1: project1.name,
        project2: project2.name,
        project3: project3.name,
    });

    console.log('🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
