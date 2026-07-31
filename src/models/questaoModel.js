import { prisma } from '@/lib/prisma';

export const QuestaoModel = {
  // Sem filtro, devolve todas as questoes disponiveis para montar avaliacoes.
  async listarPorProfessor(usuarioId, { bancoId } = {}) {
    return prisma.questao.findMany({
      where: {
        banco: { usuarioId },
        ...(bancoId ? { bancoId } : {}),
      },
      orderBy: { createdAt: 'asc' },
      include: { banco: { select: { id: true, titulo: true } } },
    });
  },

  async criar({ tipo, enunciado, peso, gabarito, bancoId }) {
    return prisma.questao.create({
      data: { tipo, enunciado, peso, gabarito, bancoId },
    });
  },
};
