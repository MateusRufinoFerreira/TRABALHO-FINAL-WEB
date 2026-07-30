import { prisma } from '@/lib/prisma';

// CAMADA DE ACESSO A DADOS

export const UsuarioModel = {
  // Devolve o usuario completo (incluindo o hash da senha, necessario para a
  // comparacao no login) ou null quando o e-mail nao existe.
  async buscarPorEmail(email) {
    return prisma.usuario.findUnique({ where: { email } });
  },

  async buscarPorId(id) {
    return prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nome: true, email: true },
    });
  },
};
