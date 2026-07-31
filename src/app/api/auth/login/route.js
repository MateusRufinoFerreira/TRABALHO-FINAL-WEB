import { AuthController } from '@/controllers/authController';
import { lerCorpo, responder, respostaJsonInvalido } from '@/lib/http';

const UM_DIA_EM_SEGUNDOS = 60 * 60 * 24;

export async function POST(request) {
  const { ok, corpo } = await lerCorpo(request);

  if (!ok) return respostaJsonInvalido();

  const resultado = await AuthController.autenticar(corpo);
  const resposta = responder(resultado, 200);

  if (resultado.ok) {
    resposta.cookies.set('token', resultado.dados.token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: UM_DIA_EM_SEGUNDOS,
    });
  }

  return resposta;
}
