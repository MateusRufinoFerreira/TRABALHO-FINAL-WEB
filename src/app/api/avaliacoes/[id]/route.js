import { AvaliacaoController } from '@/controllers/avaliacaoController';
import { professorDaRequisicao } from '@/lib/autenticacao';
import { responder, respostaNaoAutenticado } from '@/lib/http';

// CAMADA DE ROTA (fina)

export async function GET(request, { params }) {
  const professor = professorDaRequisicao(request);

  if (!professor) return respostaNaoAutenticado();

  const { id } = await params;

  return responder(await AvaliacaoController.buscarAvaliacao(professor.id, id));
}
