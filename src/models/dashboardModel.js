import { prisma } from '@/lib/prisma';

// CAMADA DE ACESSO A DADOS

const TURMAS_RECENTES = 3;

export const DashboardModel = {
  // As quatro consultas sao independentes: em paralelo em vez de em fila.
  // Todas escopadas ao professor, direta ou indiretamente pela turma.
  async obterEstatisticas(usuarioId) {
    const [alunosAtivos, avaliacoesCriadas, turmasTotal, turmasRecentes] = await Promise.all([
      // Alunos DISTINTOS: um aluno em tres turmas conta uma vez. O `some`
      // resolve isso no banco, sem trazer os registros para somar em memoria.
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
