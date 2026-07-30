import { prisma } from '@/lib/prisma';

// CAMADA DE ACESSO A DADOS

export const TurmaModel = {
  // Turmas do professor, mais recentes primeiro. O _count evita carregar alunos
  // e avaliacoes inteiros so para exibir a quantidade na listagem.
  async listarPorProfessor(usuarioId) {
    return prisma.turma.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { alunos: true, avaliacoes: true } } },
    });
  },

  async criar({ nome, codigo, semestre, usuarioId }) {
    return prisma.turma.create({
      data: { nome, codigo, semestre, usuarioId },
      include: { _count: { select: { alunos: true, avaliacoes: true } } },
    });
  },

  // Devolve a turma ou null quando o id nao existe.
  async buscarPorId(id) {
    return prisma.turma.findUnique({ where: { id } });
  },

  // Turma com suas avaliacoes, para a tela de detalhe.
  async buscarDetalhadaPorId(id) {
    return prisma.turma.findUnique({
      where: { id },
      include: {
        avaliacoes: { orderBy: { dataInicio: 'asc' } },
        _count: { select: { alunos: true, avaliacoes: true } },
      },
    });
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
