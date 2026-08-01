import { prisma } from '@/lib/prisma';

export const AvaliacaoModel = {
  async criar({
    titulo,
    tipo,
    dataInicio,
    dataTermino,
    ordemAleatoria,
    turmaId,
    alunoIds,
    questaoIds,
  }) {
    return prisma.avaliacao.create({
      data: {
        titulo,
        tipo,
        dataInicio,
        dataTermino,
        ordemAleatoria,
        turmaId,
        alunos: { connect: alunoIds.map((id) => ({ id })) },
        questoes: { connect: questaoIds.map((id) => ({ id })) },
      },
      include: {
        alunos: true,
        // A juncao implicita nao guarda posicao: a ordem estavel e a de criacao.
        questoes: { orderBy: { createdAt: 'asc' } },
      },
    });
  },

  async listarPorProfessor(usuarioId, { turmaId } = {}) {
    return prisma.avaliacao.findMany({
      where: {
        turma: { usuarioId },
        ...(turmaId ? { turmaId } : {}),
      },
      orderBy: { dataInicio: 'asc' },
      include: {
        turma: { select: { id: true, nome: true, codigo: true } },
        _count: { select: { alunos: true, questoes: true } },
      },
    });
  },

  // Inclui turma.usuarioId para o controller verificar a propriedade.
  async buscarPorId(id) {
    return prisma.avaliacao.findUnique({
      where: { id },
      include: {
        turma: { select: { id: true, nome: true, codigo: true, usuarioId: true } },
        alunos: { orderBy: { nome: 'asc' } },
        questoes: { orderBy: { createdAt: 'asc' } },
      },
    });
  },
};
