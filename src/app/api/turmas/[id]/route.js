import { TurmaController } from '@/controllers/turmaController';
import { professorDaRequisicao } from '@/lib/autenticacao';
import { responder, respostaNaoAutenticado } from '@/lib/http';

export async function GET(request, { params }) {
  const professor = professorDaRequisicao(request);

  if (!professor) return respostaNaoAutenticado();

  const { id } = await params;

  return responder(await TurmaController.buscarTurma(professor.id, id));
}
