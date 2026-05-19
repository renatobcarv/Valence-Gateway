import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../config';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';
import { projectService } from './projectService';

export const collaboratorService = {
  async add(
    projectId: string,
    requestingUserId: string,
    data: { email: string; name: string; percentage: number; stripeAccountId?: string },
  ) {
    await projectService.assertOwner(projectId, requestingUserId);

    // Verifica se já existe
    const existing = await prisma.collaborator.findUnique({
      where: { projectId_email: { projectId, email: data.email } },
    });
    if (existing) throw new ConflictError('Email already added to this project');

    // Verifica se a soma dos percentuais não vai ultrapassar 100
    const current = await prisma.collaborator.aggregate({
      where: { projectId },
      _sum: { percentage: true },
    });
    const currentTotal = Number(current._sum.percentage ?? 0);
    if (currentTotal + data.percentage > 100) {
      throw new ValidationError(
        `Total percentage would exceed 100% (current: ${currentTotal}%, adding: ${data.percentage}%)`,
      );
    }

    // Vincula ao user cadastrado se existir
    const linkedUser = await prisma.user.findUnique({ where: { email: data.email } });

    return prisma.collaborator.create({
      data: {
        projectId,
        userId: linkedUser?.id ?? null,
        email: data.email,
        name: data.name,
        percentage: new Decimal(data.percentage),
        stripeAccountId: data.stripeAccountId ?? null,
      },
      select: {
        id: true,
        projectId: true,
        email: true,
        name: true,
        percentage: true,
        stripeAccountId: true,
        createdAt: true,
      },
    });
  },

  async list(projectId: string, requestingUserId: string) {
    await projectService.getById(projectId, requestingUserId); // valida acesso

    const collaborators = await prisma.collaborator.findMany({
      where: { projectId },
      include: {
        transfers: { where: { status: 'completed' }, select: { amount: true, completedAt: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalPercentage = collaborators.reduce((sum, c) => sum + Number(c.percentage), 0);

    return {
      collaborators: collaborators.map((c) => ({
        id: c.id,
        email: c.email,
        name: c.name,
        percentage: Number(c.percentage),
        stripeAccountId: c.stripeAccountId,
        totalEarned: c.transfers.reduce((sum, t) => sum + Number(t.amount), 0).toFixed(2),
        lastTransfer:
          c.transfers.sort(
            (a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0),
          )[0]?.completedAt ?? null,
      })),
      totalPercentage,
    };
  },

  async update(
    projectId: string,
    collabId: string,
    requestingUserId: string,
    data: { percentage?: number; stripeAccountId?: string },
  ) {
    await projectService.assertOwner(projectId, requestingUserId);

    const collab = await prisma.collaborator.findFirst({
      where: { id: collabId, projectId },
    });
    if (!collab) throw new NotFoundError('Collaborator');

    if (data.percentage !== undefined) {
      const others = await prisma.collaborator.aggregate({
        where: { projectId, id: { not: collabId } },
        _sum: { percentage: true },
      });
      const othersTotal = Number(others._sum.percentage ?? 0);
      if (othersTotal + data.percentage > 100) {
        throw new ValidationError(
          `Total percentage would exceed 100% (others: ${othersTotal}%, new: ${data.percentage}%)`,
        );
      }
    }

    return prisma.collaborator.update({
      where: { id: collabId },
      data: {
        ...(data.percentage !== undefined && { percentage: new Decimal(data.percentage) }),
        ...(data.stripeAccountId !== undefined && { stripeAccountId: data.stripeAccountId }),
      },
      select: { id: true, email: true, name: true, percentage: true, stripeAccountId: true },
    });
  },

  async remove(projectId: string, collabId: string, requestingUserId: string) {
    await projectService.assertOwner(projectId, requestingUserId);

    const collab = await prisma.collaborator.findFirst({
      where: { id: collabId, projectId },
    });
    if (!collab) throw new NotFoundError('Collaborator');

    await prisma.collaborator.delete({ where: { id: collabId } });
  },
};
