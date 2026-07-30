import { QuestaoModel } from '@/models/questaoModel';
import { garantirBancoDoProfessor } from '@/controllers/acessoBanco';
import { ERRO, falha, sucesso } from '@/lib/resultado';

// CAMADA DE REGRAS DE NEGOCIO

const TIPOS_VALIDOS = ['DISCURSIVA', 'MULTIPLA_ESCOLHA'];

function textoPreenchido(valor) {
  return typeof valor === 'string' && valor.trim() !== '';
}

export const QuestaoController = {
  async listarQuestoes(professorId, filtros) {
    const { bancoId } = filtros ?? {};

    try {
      // Se um banco foi informado, ele precisa pertencer ao professor. Sem esta
      // checagem, passar o id de um banco alheio listaria as questoes dele.
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

    // O peso vem do formulario como string. Number('') e 0, e Number('abc') e
    // NaN: as duas situacoes sao recusadas pela checagem seguinte.
    const pesoNumerico = peso === undefined || peso === null || peso === '' ? 1 : Number(peso);

    if (!Number.isFinite(pesoNumerico) || pesoNumerico <= 0) {
      return falha(ERRO.VALIDACAO, 'O campo "peso" deve ser um numero maior que zero.');
    }

    try {
      // A questao so pode ser criada num banco do proprio professor.
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
