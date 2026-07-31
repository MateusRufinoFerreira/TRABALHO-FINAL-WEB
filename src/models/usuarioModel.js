import { prisma } from '@/lib/prisma';

export const UsuarioModel = {
  // Inclui o hash da senha, necessario para a comparacao no login.
  async buscarPorEmail(email) {
    return prisma.usuario.findUnique({ where: { email } });
  },

  async buscarPorId(id) {
    return prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nome: true, email: true },
    });
  },

  // A senha chega ja com hash; o select impede que ele volte na resposta.
  async criar({ nome, email, senha }) {
    return prisma.usuario.create({
      data: { nome, email, senha },
      select: { id: true, nome: true, email: true },
    });
  },
};
