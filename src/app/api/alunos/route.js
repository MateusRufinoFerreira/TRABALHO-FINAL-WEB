import { AlunoController } from '@/controllers/alunoController';
import { professorDaRequisicao } from '@/lib/autenticacao';
import { responder, respostaNaoAutenticado } from '@/lib/http';

// CAMADA DE ROTA (fina)
//
// Diferente das demais rotas de aluno, esta NAO e aninhada em turma: a consulta
// por matricula e global, porque a matricula e unica no sistema inteiro e o
// objetivo e justamente descobrir se ela existe em qualquer lugar.

export async function GET(request) {
  const professor = professorDaRequisicao(request);

  if (!professor) return respostaNaoAutenticado();

  const matricula = request.nextUrl.searchParams.get('matricula');

  return responder(await AlunoController.consultarMatricula(matricula));
}
