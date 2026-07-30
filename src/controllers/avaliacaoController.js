import { AvaliacaoModel } from '@/models/avaliacaoModel';
import { TurmaModel } from '@/models/turmaModel';
import { garantirTurmaDoProfessor } from '@/controllers/acessoTurma';
import { ERRO, falha, sucesso } from '@/lib/resultado';

// CAMADA DE REGRAS DE NEGOCIO
// Nao importa o Prisma (isso e papel do model) e nao importa NextResponse
// (isso e papel da rota). Valida a entrada, aplica as regras e devolve um
// resultado descrito em termos de dominio.

const TIPOS_VALIDOS = ['PROVA', 'LISTA'];

// Codigo do Prisma para "registro obrigatorio nao encontrado", devolvido quando
// um connect aponta para um id inexistente.
const REGISTRO_NAO_ENCONTRADO = 'P2025';

function textoPreenchido(valor) {
  return typeof valor === 'string' && valor.trim() !== '';
}

// Converte a data recebida em JSON (string ISO) para Date, ou null se invalida.
function converterData(valor) {
  if (typeof valor !== 'string' && !(valor instanceof Date)) return null;

  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}

function listaDeIds(valor) {
  if (valor === undefined || valor === null) return [];
  if (!Array.isArray(valor)) return null;
  if (!valor.every(textoPreenchido)) return null;

  // Remove duplicatas: o connect do Prisma falharia ao vincular o mesmo id duas vezes.
  return [...new Set(valor)];
}

// Fisher-Yates. Substitui o `sort(() => Math.random() - 0.5)` usado antes, que
// produzia distribuicao enviesada e alterava o array original.
function embaralhar(itens) {
  const copia = [...itens];

  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }

  return copia;
}

export const AvaliacaoController = {
  // Recebe o professorId do token: sem ele, qualquer professor autenticado
  // poderia agendar avaliacao na turma de outro.
  async agendarAvaliacao(professorId, dados) {
    const {
      titulo,
      tipo,
      dataInicio,
      dataTermino,
      ordemAleatoria = false,
      turmaId,
      alunoIds,
      questaoIds,
    } = dados ?? {};

    // --- Validacao de formato -------------------------------------------------
    if (!textoPreenchido(titulo)) {
      return falha(ERRO.VALIDACAO, 'O campo "titulo" e obrigatorio.');
    }

    if (!TIPOS_VALIDOS.includes(tipo)) {
      return falha(ERRO.VALIDACAO, `O campo "tipo" deve ser ${TIPOS_VALIDOS.join(' ou ')}.`);
    }

    const inicio = converterData(dataInicio);
    const termino = converterData(dataTermino);

    if (!inicio || !termino) {
      return falha(ERRO.VALIDACAO, 'As datas de inicio e termino devem ser datas validas.');
    }

    if (termino <= inicio) {
      return falha(ERRO.VALIDACAO, 'A data de termino deve ser posterior a data de inicio.');
    }

    if (typeof ordemAleatoria !== 'boolean') {
      return falha(ERRO.VALIDACAO, 'O campo "ordemAleatoria" deve ser true ou false.');
    }

    if (!textoPreenchido(turmaId)) {
      return falha(ERRO.VALIDACAO, 'O campo "turmaId" e obrigatorio.');
    }

    const alunos = listaDeIds(alunoIds);
    const questoes = listaDeIds(questaoIds);

    if (!alunos || !questoes) {
      return falha(ERRO.VALIDACAO, '"alunoIds" e "questaoIds" devem ser listas de ids.');
    }

    try {
      // --- Regras de consistencia entre entidades ----------------------------
      // A turma precisa existir E pertencer ao professor autenticado.
      const acesso = await garantirTurmaDoProfessor(professorId, turmaId);
      if (!acesso.ok) return acesso;

      // Um participante da avaliacao precisa estar matriculado na turma dela.
      // Sem esta checagem seria possivel vincular um aluno de outra turma.
      if (alunos.length > 0) {
        const matriculados = await TurmaModel.listarIdsDeAlunos(turmaId);
        const forasteiros = alunos.filter((id) => !matriculados.includes(id));

        if (forasteiros.length > 0) {
          return falha(
            ERRO.VALIDACAO,
            'Todos os participantes devem estar matriculados na turma da avaliacao.'
          );
        }
      }

      const avaliacao = await AvaliacaoModel.criar({
        titulo: titulo.trim(),
        tipo,
        dataInicio: inicio,
        dataTermino: termino,
        ordemAleatoria,
        turmaId,
        alunoIds: alunos,
        questaoIds: questoes,
      });

      // Ordem aleatoria e decidida na entrega, nao na persistencia: a tabela de
      // juncao implicita nao guarda posicao (ver docs/MER.md).
      if (avaliacao.ordemAleatoria) {
        avaliacao.questoes = embaralhar(avaliacao.questoes);
      }

      return sucesso(avaliacao);
    } catch (erro) {
      // Ocorre quando algum id de questao informado nao existe.
      if (erro?.code === REGISTRO_NAO_ENCONTRADO) {
        return falha(ERRO.VALIDACAO, 'Uma ou mais questoes informadas nao existem.');
      }

      console.error('[agendarAvaliacao]', erro);
      return falha(ERRO.INTERNO, 'Erro ao agendar a avaliacao.');
    }
  },

  async listarAvaliacoes(professorId, filtros) {
    const { turmaId } = filtros ?? {};

    try {
      // Se uma turma foi informada, ela precisa pertencer ao professor. Sem esta
      // checagem, passar o id de uma turma alheia listaria as avaliacoes dela.
      if (turmaId) {
        const acesso = await garantirTurmaDoProfessor(professorId, turmaId);
        if (!acesso.ok) return acesso;
      }

      return sucesso(await AvaliacaoModel.listarPorProfessor(professorId, { turmaId }));
    } catch (erro) {
      console.error('[listarAvaliacoes]', erro);
      return falha(ERRO.INTERNO, 'Erro ao listar as avaliacoes.');
    }
  },

  async buscarAvaliacao(professorId, id) {
    if (!textoPreenchido(id)) {
      return falha(ERRO.VALIDACAO, 'O id da avaliacao e obrigatorio.');
    }

    try {
      const avaliacao = await AvaliacaoModel.buscarPorId(id);

      // A avaliacao pertence ao professor por meio da turma. Inexistente e
      // alheia devolvem a mesma resposta, para nao revelar quais ids existem.
      if (!avaliacao || avaliacao.turma.usuarioId !== professorId) {
        return falha(ERRO.NAO_ENCONTRADO, 'Avaliacao nao encontrada.');
      }

      // O embaralhamento acontece na LEITURA, nao na persistencia: a tabela de
      // juncao implicita nao guarda posicao (ver docs/MER.md). Consequencia
      // deliberada: cada consulta devolve uma ordem diferente, o que serve ao
      // proposito de evitar cola entre alunos.
      if (avaliacao.ordemAleatoria) {
        avaliacao.questoes = embaralhar(avaliacao.questoes);
      }

      // O usuarioId da turma foi carregado apenas para a checagem acima e nao
      // precisa vazar na resposta.
      delete avaliacao.turma.usuarioId;

      return sucesso(avaliacao);
    } catch (erro) {
      console.error('[buscarAvaliacao]', erro);
      return falha(ERRO.INTERNO, 'Erro ao buscar a avaliacao.');
    }
  },
};
