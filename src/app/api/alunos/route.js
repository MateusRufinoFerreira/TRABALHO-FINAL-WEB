import { AlunoController } from '@/controllers/alunoController';
import { professorDaRequisicao } from '@/lib/autenticacao';
import { responder, respostaNaoAutenticado } from '@/lib/http';

export async function GET(request) {
  const professor = professorDaRequisicao(request);

  if (!professor) return respostaNaoAutenticado();

  const matricula = request.nextUrl.searchParams.get('matricula');

  return responder(await AlunoController.consultarMatricula(matricula));
}
