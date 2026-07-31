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

  // Recebe a senha JA com hash: gerar o hash e regra de negocio, nao acesso a
  // dados. O select impede que o hash volte na resposta.
  async criar({ nome, email, senha }) {
    return prisma.usuario.create({
      data: { nome, email, senha },
      select: { id: true, nome: true, email: true },
    });
  },
};
