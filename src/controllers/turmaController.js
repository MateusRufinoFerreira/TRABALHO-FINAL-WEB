import { TurmaModel } from '@/models/turmaModel';
import { ERRO, falha, sucesso } from '@/lib/resultado';

// Semestre no formato ano.periodo, ex.: "2026.1".
const FORMATO_SEMESTRE = /^\d{4}\.[12]$/;

function textoPreenchido(valor) {
  return typeof valor === 'string' && valor.trim() !== '';
}

export const TurmaController = {
  async listarTurmas(professorId) {
    try {
      return sucesso(await TurmaModel.listarPorProfessor(professorId));
    } catch (erro) {
      console.error('[listarTurmas]', erro);
      return falha(ERRO.INTERNO, 'Erro ao listar as turmas.');
    }
  },

  async criarTurma(professorId, dados) {
    const { nome, codigo, semestre } = dados ?? {};

    if (!textoPreenchido(nome)) {
      return falha(ERRO.VALIDACAO, 'O campo "nome" e obrigatorio.');
    }

    if (!textoPreenchido(codigo)) {
      return falha(ERRO.VALIDACAO, 'O campo "codigo" e obrigatorio.');
    }

    if (!textoPreenchido(semestre) || !FORMATO_SEMESTRE.test(semestre.trim())) {
      return falha(ERRO.VALIDACAO, 'O campo "semestre" deve seguir o formato 2026.1.');
    }

    try {
      // O dono vem do token, nunca do corpo.
      const turma = await TurmaModel.criar({
        nome: nome.trim(),
        codigo: codigo.trim().toUpperCase(),
        semestre: semestre.trim(),
        usuarioId: professorId,
      });

      return sucesso(turma);
    } catch (erro) {
      console.error('[criarTurma]', erro);
      return falha(ERRO.INTERNO, 'Erro ao criar a turma.');
    }
  },

  async buscarTurma(professorId, id) {
    if (!textoPreenchido(id)) {
      return falha(ERRO.VALIDACAO, 'O id da turma e obrigatorio.');
    }

    try {
      const turma = await TurmaModel.buscarDetalhadaPorId(id);

      if (!turma || turma.usuarioId !== professorId) {
        return falha(ERRO.NAO_ENCONTRADO, 'Turma nao encontrada.');
      }

      return sucesso(turma);
    } catch (erro) {
      console.error('[buscarTurma]', erro);
      return falha(ERRO.INTERNO, 'Erro ao buscar a turma.');
    }
  },
};
