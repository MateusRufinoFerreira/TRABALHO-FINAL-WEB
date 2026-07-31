import { AlunoController } from '@/controllers/alunoController';
import { professorDaRequisicao } from '@/lib/autenticacao';
import { lerCorpo, responder, respostaJsonInvalido, respostaNaoAutenticado } from '@/lib/http';

export async function GET(request, { params }) {
  const professor = professorDaRequisicao(request);

  if (!professor) return respostaNaoAutenticado();

  const { id } = await params;

  return responder(await AlunoController.listarAlunosDaTurma(professor.id, id));
}

export async function POST(request, { params }) {
  const professor = professorDaRequisicao(request);

  if (!professor) return respostaNaoAutenticado();

  const { id } = await params;
  const { ok, corpo } = await lerCorpo(request);

  if (!ok) return respostaJsonInvalido();

  return responder(await AlunoController.matricularAluno(professor.id, id, corpo), 201);
}
