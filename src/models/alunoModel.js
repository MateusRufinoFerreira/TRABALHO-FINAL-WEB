import { prisma } from '@/lib/prisma';

// CAMADA DE ACESSO A DADOS

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

  // A matricula e unica no sistema inteiro: um aluno em varias turmas e UM
  // registro vinculado a todas. Por isso connectOrCreate, e nao create — que
  // falharia com violacao de unicidade para quem ja existe.
  async matricularNaTurma(turmaId, { nome, matricula, email }) {
    return prisma.aluno.upsert({
      where: { matricula },
      update: { turmas: { connect: { id: turmaId } } },
      create: { nome, matricula, email, turmas: { connect: { id: turmaId } } },
    });
  },

  // Remove apenas o vinculo com a turma. O registro do aluno e preservado,
  // porque ele pode estar matriculado em outras turmas.
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
