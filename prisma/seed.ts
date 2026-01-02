import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const passwordHash = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      passwordHash,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      passwordHash,
    },
  });

  // Create projects for user1
  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      userId: user1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App',
      userId: user1.id,
    },
  });

  // Create projects for user2
  const project3 = await prisma.project.create({
    data: {
      name: 'API Integration',
      userId: user2.id,
    },
  });

  const project4 = await prisma.project.create({
    data: {
      name: 'Data Migration',
      userId: user2.id,
    },
  });

  // Create tasks for project1
  const project1Tasks = [
    { title: 'Design homepage mockup', description: 'Create initial wireframes and mockups' },
    { title: 'Implement navigation', description: 'Build responsive navigation component' },
    { title: 'Setup color scheme', description: 'Define color palette and CSS variables' },
    { title: 'Create footer component', description: 'Build footer with links and social icons' },
    { title: 'Add contact form', description: 'Implement contact form with validation' },
    { title: 'Optimize images', description: 'Compress and lazy-load images' },
    { title: 'Test responsiveness', description: 'Ensure all pages work on mobile devices' },
  ];

  for (const task of project1Tasks) {
    await prisma.task.create({
      data: {
        ...task,
        projectId: project1.id,
        completed: Math.random() > 0.7,
      },
    });
  }

  // Create tasks for project2
  const project2Tasks = [
    { title: 'Setup React Native', description: 'Initialize project with Expo' },
    { title: 'Create login screen', description: 'Build authentication UI' },
    { title: 'Implement state management', description: 'Setup Redux or Context API' },
    { title: 'Build dashboard view', description: 'Create main dashboard component' },
    { title: 'Add push notifications', description: 'Integrate notification service' },
    { title: 'Setup CI/CD', description: 'Configure automated builds' },
  ];

  for (const task of project2Tasks) {
    await prisma.task.create({
      data: {
        ...task,
        projectId: project2.id,
        completed: Math.random() > 0.7,
      },
    });
  }

  // Create tasks for project3 (user2's project)
  const project3Tasks = [
    { title: 'Review API documentation', description: 'Understand third-party API endpoints' },
    { title: 'Create API client', description: 'Build wrapper for external API' },
    { title: 'Implement authentication', description: 'Handle OAuth flow' },
    { title: 'Build data transformers', description: 'Map external data to internal models' },
    { title: 'Add error handling', description: 'Implement retry logic and error recovery' },
    { title: 'Write integration tests', description: 'Test API integration end-to-end' },
    { title: 'Document endpoints', description: 'Create internal API documentation' },
    { title: 'Setup monitoring', description: 'Add logging and alerts' },
  ];

  for (const task of project3Tasks) {
    await prisma.task.create({
      data: {
        ...task,
        projectId: project3.id,
        completed: Math.random() > 0.7,
      },
    });
  }

  // Create tasks for project4 (user2's project)
  const project4Tasks = [
    { title: 'Analyze source data', description: 'Profile existing database' },
    { title: 'Design target schema', description: 'Create new database structure' },
    { title: 'Build ETL pipeline', description: 'Implement extraction scripts' },
    { title: 'Create data validation', description: 'Build validation checks' },
    { title: 'Test migration scripts', description: 'Run migration on test data' },
    { title: 'Plan rollback strategy', description: 'Document rollback procedures' },
    { title: 'Schedule migration window', description: 'Coordinate with stakeholders' },
  ];

  for (const task of project4Tasks) {
    await prisma.task.create({
      data: {
        ...task,
        projectId: project4.id,
        completed: Math.random() > 0.7,
      },
    });
  }

  console.log('Seed data created successfully!');
  console.log('');
  console.log('Test Users:');
  console.log('  Email: alice@example.com | Password: password123');
  console.log('  Email: bob@example.com   | Password: password123');
  console.log('');
  console.log('User IDs (for testing cross-user access):');
  console.log(`  Alice: ${user1.id}`);
  console.log(`  Bob: ${user2.id}`);
  console.log('');
  console.log('Project IDs:');
  console.log(`  Alice's projects: ${project1.id}, ${project2.id}`);
  console.log(`  Bob's projects: ${project3.id}, ${project4.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
