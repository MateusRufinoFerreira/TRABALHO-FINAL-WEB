import { AlunoController } from '@/controllers/alunoController';
import { professorDaRequisicao } from '@/lib/autenticacao';
import { responder, respostaNaoAutenticado } from '@/lib/http';

// CAMADA DE ROTA (fina)

export async function DELETE(request, { params }) {
  const professor = professorDaRequisicao(request);

  if (!professor) return respostaNaoAutenticado();

  // Dois segmentos dinamicos na mesma rota; ambos vem do mesmo params.
  const { id, alunoId } = await params;

  return responder(await AlunoController.removerAlunoDaTurma(professor.id, id, alunoId));
}
