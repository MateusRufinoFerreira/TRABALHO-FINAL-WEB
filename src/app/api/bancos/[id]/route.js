import { BancoController } from '@/controllers/bancoController';
import { professorDaRequisicao } from '@/lib/autenticacao';
import { responder, respostaNaoAutenticado } from '@/lib/http';

export async function GET(request, { params }) {
  const professor = professorDaRequisicao(request);

  if (!professor) return respostaNaoAutenticado();

  const { id } = await params;

  return responder(await BancoController.buscarBanco(professor.id, id));
}
