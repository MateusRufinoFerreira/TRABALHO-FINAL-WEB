import { AvaliacaoController } from '@/controllers/avaliacaoController';
import { professorDaRequisicao } from '@/lib/autenticacao';
import { lerCorpo, responder, respostaJsonInvalido, respostaNaoAutenticado } from '@/lib/http';

// CAMADA DE ROTA (fina)
// Recebe a requisicao, delega ao controller e traduz o resultado em resposta
// HTTP. Nao contem regra de negocio nem acesso ao banco.

export async function POST(request) {
  const professor = professorDaRequisicao(request);

  if (!professor) return respostaNaoAutenticado();

  const { ok, corpo } = await lerCorpo(request);

  if (!ok) return respostaJsonInvalido();

  const resultado = await AvaliacaoController.agendarAvaliacao(professor.id, corpo);

  return responder(resultado, 201);
}
