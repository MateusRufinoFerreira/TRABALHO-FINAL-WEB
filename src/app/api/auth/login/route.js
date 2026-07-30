import { AuthController } from '@/controllers/authController';
import { lerCorpo, responder, respostaJsonInvalido } from '@/lib/http';

// CAMADA DE ROTA (fina)

const UM_DIA_EM_SEGUNDOS = 60 * 60 * 24;

export async function POST(request) {
  const { ok, corpo } = await lerCorpo(request);

  if (!ok) return respostaJsonInvalido();

  const resultado = await AuthController.autenticar(corpo);
  const resposta = responder(resultado, 200);

  if (resultado.ok) {
    // O token tambem vai no corpo da resposta (ver authController), porque o
    // front-end precisa le-lo para montar o cabecalho Authorization. Este cookie
    // e um extra: sendo httpOnly, o JavaScript nao o acessa, o que protege
    // contra XSS mas nao serve para o cabecalho.
    resposta.cookies.set('token', resultado.dados.token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: UM_DIA_EM_SEGUNDOS,
    });
  }

  return resposta;
}
