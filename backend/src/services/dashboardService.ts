import { prisma } from '../config';

export const dashboardService = {
  async getEarnings(userId: string) {
    // Ganhos como owner (receita dos projetos)
    const ownerProjects = await prisma.project.findMany({
      where: { userId },
      include: {
        payments: { where: { status: 'completed' }, select: { amount: true } },
        _count: { select: { payments: true } },
      },
    });

    const ownerRevenue = ownerProjects.reduce(
      (sum, p) => sum + p.payments.reduce((s, pay) => s + Number(pay.amount), 0),
      0,
    );

    // Ganhos como colaborador (transfers recebidos)
    const collabTransfers = await prisma.transfer.findMany({
      where: {
        status: 'completed',
        collaborator: { email: { in: await getEmailsForUser(userId) } },
      },
      select: { amount: true, completedAt: true },
    });

    const collabEarned = collabTransfers.reduce((s, t) => s + Number(t.amount), 0);

    const allTransactions = [
      ...ownerProjects.flatMap((p) => p.payments.map((pay) => ({ amount: Number(pay.amount) }))),
      ...collabTransfers,
    ];

    const lastTxDate =
      collabTransfers.sort(
        (a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0),
      )[0]?.completedAt ?? null;

    // Projetos onde colabora
    const collabProjects = await prisma.collaborator.findMany({
      where: { user: { id: userId } },
      select: { projectId: true },
      distinct: ['projectId'],
    });

    return {
      asOwner: {
        totalRevenue: ownerRevenue.toFixed(2),
        totalProjects: ownerProjects.length,
        totalPayments: ownerProjects.reduce((s, p) => s + p._count.payments, 0),
        averagePayment:
          ownerProjects.reduce((s, p) => s + p._count.payments, 0) > 0
            ? (ownerRevenue / ownerProjects.reduce((s, p) => s + p._count.payments, 0)).toFixed(2)
            : '0.00',
      },
      asCollaborator: {
        totalEarned: collabEarned.toFixed(2),
        collaboratingIn: collabProjects.length,
        totalTransfers: collabTransfers.length,
        averageTransfer:
          collabTransfers.length > 0
            ? (collabEarned / collabTransfers.length).toFixed(2)
            : '0.00',
      },
      combined: {
        totalEarnings: (ownerRevenue + collabEarned).toFixed(2),
        lastTransactionDate: lastTxDate,
      },
    };
  },

  async getTransfers(
    userId: string,
    limit: number,
    offset: number,
    status?: string,
  ) {
    const userEmails = await getEmailsForUser(userId);

    const where = {
      collaborator: { email: { in: userEmails } },
      ...(status && { status }),
    };

    const [transfers, total] = await prisma.$transaction([
      prisma.transfer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          split: {
            include: {
              payment: { include: { project: { select: { name: true } } } },
            },
          },
          collaborator: { select: { name: true, email: true } },
        },
      }),
      prisma.transfer.count({ where }),
    ]);

    // Totais por status
    const summary = await prisma.transfer.groupBy({
      by: ['status'],
      where: { collaborator: { email: { in: userEmails } } },
      _sum: { amount: true },
    });

    const summaryMap = Object.fromEntries(
      summary.map((s) => [s.status, Number(s._sum.amount ?? 0).toFixed(2)]),
    );

    return {
      transfers: transfers.map((t) => ({
        id: t.id,
        splitId: t.splitId,
        projectName: t.split.payment.project.name,
        collaboratorName: t.collaborator.name,
        amount: t.amount,
        method: t.method,
        status: t.status,
        stripeTransferId: t.stripeTransferId,
        createdAt: t.createdAt,
        completedAt: t.completedAt,
      })),
      total,
      summary: {
        pendingAmount: summaryMap['pending'] ?? '0.00',
        processingAmount: summaryMap['processing'] ?? '0.00',
        completedAmount: summaryMap['completed'] ?? '0.00',
        failedAmount: summaryMap['failed'] ?? '0.00',
      },
    };
  },

  async getRevenueChart(userId: string) {
    // Últimos 6 meses de receita diária (para o gráfico)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const payments = await prisma.payment.findMany({
      where: {
        project: { userId },
        status: 'completed',
        createdAt: { gte: sixMonthsAgo },
      },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Agrupa por mês
    const byMonth: Record<string, number> = {};
    for (const p of payments) {
      const key = p.createdAt.toISOString().slice(0, 7); // "2026-01"
      byMonth[key] = (byMonth[key] ?? 0) + Number(p.amount);
    }

    return Object.entries(byMonth).map(([month, total]) => ({
      month,
      total: Number(total.toFixed(2)),
    }));
  },
};

async function getEmailsForUser(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  return user ? [user.email] : [];
}
