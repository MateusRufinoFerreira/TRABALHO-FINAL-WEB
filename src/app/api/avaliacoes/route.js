import { AvaliacaoController } from '@/controllers/avaliacaoController';
import { lerCorpo, responder, respostaJsonInvalido } from '@/lib/http';

// CAMADA DE ROTA (fina)
// Recebe a requisicao, delega ao controller e traduz o resultado em resposta
// HTTP. Nao contem regra de negocio nem acesso ao banco.

export async function POST(request) {
  const { ok, corpo } = await lerCorpo(request);

  if (!ok) return respostaJsonInvalido();

  const resultado = await AvaliacaoController.agendarAvaliacao(corpo);

  return responder(resultado, 201);
}
