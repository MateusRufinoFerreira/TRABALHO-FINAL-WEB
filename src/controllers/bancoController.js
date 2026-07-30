import { BancoModel } from '@/models/bancoModel';
import { garantirBancoDoProfessor } from '@/controllers/acessoBanco';
import { ERRO, falha, sucesso } from '@/lib/resultado';

// CAMADA DE REGRAS DE NEGOCIO

function textoPreenchido(valor) {
  return typeof valor === 'string' && valor.trim() !== '';
}

export const BancoController = {
  async listarBancos(professorId) {
    try {
      return sucesso(await BancoModel.listarPorProfessor(professorId));
    } catch (erro) {
      console.error('[listarBancos]', erro);
      return falha(ERRO.INTERNO, 'Erro ao listar os bancos de questoes.');
    }
  },

  async criarBanco(professorId, dados) {
    const { titulo } = dados ?? {};

    if (!textoPreenchido(titulo)) {
      return falha(ERRO.VALIDACAO, 'O campo "titulo" e obrigatorio.');
    }

    try {
      // O dono vem do token, nunca do corpo da requisicao.
      const banco = await BancoModel.criar({
        titulo: titulo.trim(),
        usuarioId: professorId,
      });

      return sucesso(banco);
    } catch (erro) {
      console.error('[criarBanco]', erro);
      return falha(ERRO.INTERNO, 'Erro ao criar o banco de questoes.');
    }
  },

  async buscarBanco(professorId, id) {
    try {
      const acesso = await garantirBancoDoProfessor(professorId, id);
      if (!acesso.ok) return acesso;

      return sucesso(await BancoModel.buscarDetalhadoPorId(id));
    } catch (erro) {
      console.error('[buscarBanco]', erro);
      return falha(ERRO.INTERNO, 'Erro ao buscar o banco de questoes.');
    }
  },
};
