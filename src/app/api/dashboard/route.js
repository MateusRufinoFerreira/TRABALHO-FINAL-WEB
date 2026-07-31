import { DashboardController } from '@/controllers/dashboardController';
import { professorDaRequisicao } from '@/lib/autenticacao';
import { responder, respostaNaoAutenticado } from '@/lib/http';

// CAMADA DE ROTA (fina)

export async function GET(request) {
  const professor = professorDaRequisicao(request);

  if (!professor) return respostaNaoAutenticado();

  return responder(await DashboardController.obterVisaoGeral(professor.id));
}
