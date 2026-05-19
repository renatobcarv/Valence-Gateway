import { prisma } from '../config';
import { NotFoundError, ForbiddenError } from '../utils/errors';

const PAYMENT_LINK_BASE = 'https://www.valencepro.com/pay';

function paymentLink(projectId: string) {
  return `${PAYMENT_LINK_BASE}/${projectId}`;
}

export const projectService = {
  async create(userId: string, name: string, description?: string) {
    const project = await prisma.project.create({
      data: { userId, name, description: description ?? null },
    });
    return { ...project, paymentLink: paymentLink(project.id) };
  },

  async list(userId: string, limit: number, offset: number) {
    const [projects, total] = await prisma.$transaction([
      prisma.project.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          _count: { select: { collaborators: true, payments: true } },
          payments: { select: { amount: true, status: true } },
        },
      }),
      prisma.project.count({ where: { userId } }),
    ]);

    const result = projects.map((p) => {
      const completedPayments = p.payments.filter((pay) => pay.status === 'completed');
      const totalRevenue = completedPayments.reduce(
        (sum, pay) => sum + Number(pay.amount),
        0,
      );
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        paymentLink: paymentLink(p.id),
        collaboratorCount: p._count.collaborators,
        totalRevenue: totalRevenue.toFixed(2),
        totalPayments: completedPayments.length,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    return { projects: result, total, limit, offset };
  },

  async getById(projectId: string, requestingUserId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        collaborators: {
          include: {
            transfers: { where: { status: 'completed' }, select: { amount: true, completedAt: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        payments: { where: { status: 'completed' }, select: { amount: true, createdAt: true } },
      },
    });

    if (!project) throw new NotFoundError('Project');

    const isOwner = project.userId === requestingUserId;
    const isCollaborator = project.collaborators.some((c) => c.userId === requestingUserId);
    if (!isOwner && !isCollaborator) throw new ForbiddenError();

    const completedPayments = project.payments;
    const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const lastPayment = completedPayments.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    )[0];

    return {
      id: project.id,
      userId: project.userId,
      name: project.name,
      description: project.description,
      paymentLink: paymentLink(project.id),
      collaborators: project.collaborators.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        percentage: Number(c.percentage),
        stripeAccountId: c.stripeAccountId,
        totalEarned: c.transfers
          .reduce((sum, t) => sum + Number(t.amount), 0)
          .toFixed(2),
        lastTransfer: c.transfers.sort(
          (a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0),
        )[0]?.completedAt ?? null,
      })),
      stats: {
        totalPayments: completedPayments.length,
        totalRevenue: totalRevenue.toFixed(2),
        averagePayment:
          completedPayments.length > 0
            ? (totalRevenue / completedPayments.length).toFixed(2)
            : '0.00',
        lastPayment: lastPayment?.createdAt ?? null,
      },
    };
  },

  async update(projectId: string, userId: string, data: { name?: string; description?: string }) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError('Project');
    if (project.userId !== userId) throw new ForbiddenError();

    return prisma.project.update({ where: { id: projectId }, data });
  },

  async remove(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError('Project');
    if (project.userId !== userId) throw new ForbiddenError();

    await prisma.project.delete({ where: { id: projectId } });
  },

  async assertOwner(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError('Project');
    if (project.userId !== userId) throw new ForbiddenError();
    return project;
  },
};
