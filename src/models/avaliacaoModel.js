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
};
