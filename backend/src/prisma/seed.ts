import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.stripeWebhook.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.split.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.collaborator.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('Test1234!', 10);

  const joao = await prisma.user.create({
    data: { email: 'joao@example.com', name: 'João Silva', password: hash },
  });

  const maria = await prisma.user.create({
    data: { email: 'maria@example.com', name: 'Maria Oliveira', password: hash },
  });

  const project = await prisma.project.create({
    data: {
      userId: joao.id,
      name: 'Podcast XYZ',
      description: 'Podcast semanal sobre tecnologia',
    },
  });

  await prisma.collaborator.createMany({
    data: [
      {
        projectId: project.id,
        userId: joao.id,
        email: joao.email,
        name: joao.name,
        percentage: 70.0,
      },
      {
        projectId: project.id,
        userId: maria.id,
        email: maria.email,
        name: maria.name,
        percentage: 20.0,
      },
      {
        projectId: project.id,
        email: 'pedro@example.com',
        name: 'Pedro Santos',
        percentage: 10.0,
      },
    ],
  });

  console.log('✅ Seed concluído');
  console.log(`   joao@example.com / Test1234!`);
  console.log(`   Projeto ID: ${project.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
