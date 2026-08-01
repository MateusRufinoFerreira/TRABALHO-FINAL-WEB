import { AlunoController } from '@/controllers/alunoController';
import { professorDaRequisicao } from '@/lib/autenticacao';
import { responder, respostaNaoAutenticado } from '@/lib/http';

export async function DELETE(request, { params }) {
  const professor = professorDaRequisicao(request);

  if (!professor) return respostaNaoAutenticado();

  const { id, alunoId } = await params;

  return responder(await AlunoController.removerAlunoDaTurma(professor.id, id, alunoId));
}
