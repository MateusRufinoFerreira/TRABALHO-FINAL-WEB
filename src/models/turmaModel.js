import { prisma } from '@/lib/prisma';

// CAMADA DE ACESSO A DADOS
// Sera ampliada na F06 (CRUD de turmas). Neste momento expoe apenas o que o
// controller de avaliacoes precisa para validar o vinculo.

export const TurmaModel = {
  // Devolve a turma ou null quando o id nao existe.
  async buscarPorId(id) {
    return prisma.turma.findUnique({ where: { id } });
  },

  // Ids dos alunos matriculados na turma. Usado para garantir que os
  // participantes de uma avaliacao pertencam aquela turma.
  async listarIdsDeAlunos(turmaId) {
    const alunos = await prisma.aluno.findMany({
      where: { turmas: { some: { id: turmaId } } },
      select: { id: true },
    });

    return alunos.map((aluno) => aluno.id);
  },
};
