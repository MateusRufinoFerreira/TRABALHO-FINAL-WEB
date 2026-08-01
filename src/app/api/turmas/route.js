import { TurmaController } from '@/controllers/turmaController';
import { professorDaRequisicao } from '@/lib/autenticacao';
import { lerCorpo, responder, respostaJsonInvalido, respostaNaoAutenticado } from '@/lib/http';

export async function GET(request) {
  const professor = professorDaRequisicao(request);

  if (!professor) return respostaNaoAutenticado();

  return responder(await TurmaController.listarTurmas(professor.id));
}

export async function POST(request) {
  const professor = professorDaRequisicao(request);

  if (!professor) return respostaNaoAutenticado();

  const { ok, corpo } = await lerCorpo(request);

  if (!ok) return respostaJsonInvalido();

  return responder(await TurmaController.criarTurma(professor.id, corpo), 201);
}
