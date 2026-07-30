import { prisma } from '@/lib/prisma';

// CAMADA DE ACESSO A DADOS

export const BancoModel = {
  // Bancos do professor, mais recentes primeiro. O _count evita carregar as
  // questoes inteiras so para exibir a quantidade na listagem.
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

  // Banco com suas questoes, para a tela de detalhe.
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
