import { QuestaoController } from '@/controllers/questaoController';
import { professorDaRequisicao } from '@/lib/autenticacao';
import { lerCorpo, responder, respostaJsonInvalido, respostaNaoAutenticado } from '@/lib/http';

// CAMADA DE ROTA (fina)

export async function GET(request) {
  const professor = professorDaRequisicao(request);

  if (!professor) return respostaNaoAutenticado();

  // Filtro opcional: /api/questoes?bancoId=<uuid>
  const bancoId = request.nextUrl.searchParams.get('bancoId');

  return responder(await QuestaoController.listarQuestoes(professor.id, { bancoId }));
}

export async function POST(request) {
  const professor = professorDaRequisicao(request);

  if (!professor) return respostaNaoAutenticado();

  const { ok, corpo } = await lerCorpo(request);

  if (!ok) return respostaJsonInvalido();

  return responder(await QuestaoController.criarQuestao(professor.id, corpo), 201);
}
