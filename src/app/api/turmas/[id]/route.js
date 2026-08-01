import { TurmaController } from '@/controllers/turmaController';
import { professorDaRequisicao } from '@/lib/autenticacao';
import { responder, respostaNaoAutenticado } from '@/lib/http';

export async function GET(request, { params }) {
  const professor = professorDaRequisicao(request);

  if (!professor) return respostaNaoAutenticado();

  // No Next.js 16 params e uma Promise: o acesso sincrono foi removido.
  const { id } = await params;

  return responder(await TurmaController.buscarTurma(professor.id, id));
}
