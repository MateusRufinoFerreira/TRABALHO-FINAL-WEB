import { prisma } from '@/lib/prisma';

const TURMAS_RECENTES = 3;

export const DashboardModel = {
  async obterEstatisticas(usuarioId) {
    const [alunosAtivos, avaliacoesCriadas, turmasTotal, turmasRecentes] = await Promise.all([
      // Alunos distintos: um aluno em tres turmas conta uma vez.
      prisma.aluno.count({ where: { turmas: { some: { usuarioId } } } }),

      prisma.avaliacao.count({ where: { turma: { usuarioId } } }),

      prisma.turma.count({ where: { usuarioId } }),

      prisma.turma.findMany({
        where: { usuarioId },
        orderBy: { createdAt: 'desc' },
        take: TURMAS_RECENTES,
        include: { _count: { select: { alunos: true, avaliacoes: true } } },
      }),
    ]);

    return { alunosAtivos, avaliacoesCriadas, turmasTotal, turmasRecentes };
  },
};
