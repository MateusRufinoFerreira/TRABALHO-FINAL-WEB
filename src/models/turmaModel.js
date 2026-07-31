import { prisma } from '@/lib/prisma';

export const TurmaModel = {
  // _count evita carregar as colecoes so para exibir a quantidade.
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

  async buscarPorId(id) {
    return prisma.turma.findUnique({ where: { id } });
  },

  async buscarDetalhadaPorId(id) {
    return prisma.turma.findUnique({
      where: { id },
      include: {
        avaliacoes: { orderBy: { dataInicio: 'asc' } },
        _count: { select: { alunos: true, avaliacoes: true } },
      },
    });
  },

  // Usado para garantir que os participantes pertencam a turma da avaliacao.
  async listarIdsDeAlunos(turmaId) {
    const alunos = await prisma.aluno.findMany({
      where: { turmas: { some: { id: turmaId } } },
      select: { id: true },
    });

    return alunos.map((aluno) => aluno.id);
  },
};
