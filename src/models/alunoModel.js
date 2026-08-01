import { prisma } from '@/lib/prisma';

export const AlunoModel = {
  async listarPorTurma(turmaId) {
    return prisma.aluno.findMany({
      where: { turmas: { some: { id: turmaId } } },
      orderBy: { nome: 'asc' },
    });
  },

  async buscarPorMatricula(matricula) {
    return prisma.aluno.findUnique({ where: { matricula } });
  },

  async matricularNaTurma(turmaId, { nome, matricula, email }) {
    return prisma.aluno.upsert({
      where: { matricula },
      update: { turmas: { connect: { id: turmaId } } },
      create: { nome, matricula, email, turmas: { connect: { id: turmaId } } },
    });
  },

  // Desfaz apenas o vinculo: o aluno pode estar em outras turmas.
  async desvincularDaTurma(turmaId, alunoId) {
    return prisma.aluno.update({
      where: { id: alunoId },
      data: { turmas: { disconnect: { id: turmaId } } },
    });
  },

  async estaNaTurma(turmaId, alunoId) {
    const encontrado = await prisma.aluno.findFirst({
      where: { id: alunoId, turmas: { some: { id: turmaId } } },
      select: { id: true },
    });

    return Boolean(encontrado);
  },
};
