import { AvaliacaoController } from '@/controllers/avaliacaoController';
import { professorDaRequisicao } from '@/lib/autenticacao';
import { lerCorpo, responder, respostaJsonInvalido, respostaNaoAutenticado } from '@/lib/http';

export async function GET(request) {
  const professor = professorDaRequisicao(request);

  if (!professor) return respostaNaoAutenticado();

  const turmaId = request.nextUrl.searchParams.get('turmaId');

  return responder(await AvaliacaoController.listarAvaliacoes(professor.id, { turmaId }));
}

export async function POST(request) {
  const professor = professorDaRequisicao(request);

  if (!professor) return respostaNaoAutenticado();

  const { ok, corpo } = await lerCorpo(request);

  if (!ok) return respostaJsonInvalido();

  const resultado = await AvaliacaoController.agendarAvaliacao(professor.id, corpo);

  return responder(resultado, 201);
}
