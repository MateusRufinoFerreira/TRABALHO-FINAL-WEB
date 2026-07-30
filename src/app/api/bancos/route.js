import { BancoController } from '@/controllers/bancoController';
import { professorDaRequisicao } from '@/lib/autenticacao';
import { lerCorpo, responder, respostaJsonInvalido, respostaNaoAutenticado } from '@/lib/http';

// CAMADA DE ROTA (fina)

export async function GET(request) {
  const professor = professorDaRequisicao(request);

  if (!professor) return respostaNaoAutenticado();

  return responder(await BancoController.listarBancos(professor.id));
}

export async function POST(request) {
  const professor = professorDaRequisicao(request);

  if (!professor) return respostaNaoAutenticado();

  const { ok, corpo } = await lerCorpo(request);

  if (!ok) return respostaJsonInvalido();

  return responder(await BancoController.criarBanco(professor.id, corpo), 201);
}
