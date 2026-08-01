import { prisma } from '@/lib/prisma';

export const BancoModel = {
  // _count evita carregar as questoes so para exibir a quantidade.
  async listarPorProfessor(usuarioId) {
    return prisma.bancoQuestao.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { questoes: true } } },
    });
  },

  async criar({ titulo, usuarioId }) {
    return prisma.bancoQuestao.create({
      data: { titulo, usuarioId },
      include: { _count: { select: { questoes: true } } },
    });
  },

  async buscarPorId(id) {
    return prisma.bancoQuestao.findUnique({ where: { id } });
  },

  async buscarDetalhadoPorId(id) {
    return prisma.bancoQuestao.findUnique({
      where: { id },
      include: {
        questoes: { orderBy: { createdAt: 'asc' } },
        _count: { select: { questoes: true } },
      },
    });
  },
};
