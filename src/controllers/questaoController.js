import { QuestaoModel } from '@/models/questaoModel';
import { garantirBancoDoProfessor } from '@/controllers/acessoBanco';
import { ERRO, falha, sucesso } from '@/lib/resultado';

const TIPOS_VALIDOS = ['DISCURSIVA', 'MULTIPLA_ESCOLHA'];

function textoPreenchido(valor) {
  return typeof valor === 'string' && valor.trim() !== '';
}

export const QuestaoController = {
  async listarQuestoes(professorId, filtros) {
    const { bancoId } = filtros ?? {};

    try {
      if (bancoId) {
        const acesso = await garantirBancoDoProfessor(professorId, bancoId);
        if (!acesso.ok) return acesso;
      }

      return sucesso(await QuestaoModel.listarPorProfessor(professorId, { bancoId }));
    } catch (erro) {
      console.error('[listarQuestoes]', erro);
      return falha(ERRO.INTERNO, 'Erro ao listar as questoes.');
    }
  },

  async criarQuestao(professorId, dados) {
    const { tipo, enunciado, peso, gabarito, bancoId } = dados ?? {};

    if (!TIPOS_VALIDOS.includes(tipo)) {
      return falha(ERRO.VALIDACAO, `O campo "tipo" deve ser ${TIPOS_VALIDOS.join(' ou ')}.`);
    }

    if (!textoPreenchido(enunciado)) {
      return falha(ERRO.VALIDACAO, 'O campo "enunciado" e obrigatorio.');
    }

    if (!textoPreenchido(gabarito)) {
      return falha(ERRO.VALIDACAO, 'O campo "gabarito" e obrigatorio.');
    }

    // Number('') e 0 e Number('abc') e NaN: ambos recusados abaixo.
    const pesoNumerico = peso === undefined || peso === null || peso === '' ? 1 : Number(peso);

    if (!Number.isFinite(pesoNumerico) || pesoNumerico <= 0) {
      return falha(ERRO.VALIDACAO, 'O campo "peso" deve ser um numero maior que zero.');
    }

    try {
      const acesso = await garantirBancoDoProfessor(professorId, bancoId);
      if (!acesso.ok) return acesso;

      const questao = await QuestaoModel.criar({
        tipo,
        enunciado: enunciado.trim(),
        peso: pesoNumerico,
        gabarito: gabarito.trim(),
        bancoId,
      });

      return sucesso(questao);
    } catch (erro) {
      console.error('[criarQuestao]', erro);
      return falha(ERRO.INTERNO, 'Erro ao criar a questao.');
    }
  },
};
