import { prisma } from '@/lib/prisma';

// CAMADA DE ACESSO A DADOS
// Unica camada que conhece o Prisma. Nao valida entrada e nao conhece HTTP:
// recebe dados ja validados pelo controller e devolve registros ou null.

export const AvaliacaoModel = {
  // Cria a avaliacao e, na mesma operacao, estabelece os vinculos N:M com
  // alunos (participantes) e questoes (conteudo).
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
        // Sem coluna de ordem na tabela de juncao implicita, a ordem estavel
        // possivel e a de criacao da questao (ver docs/MER.md).
        questoes: { orderBy: { createdAt: 'asc' } },
      },
    });
  },

  // Avaliacoes das turmas do professor. O filtro por turma e opcional.
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

  // Avaliacao completa, com participantes e questoes. Inclui o usuarioId da
  // turma para o controller poder verificar a propriedade.
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
