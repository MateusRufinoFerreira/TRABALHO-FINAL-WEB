import { AuthController } from '@/controllers/authController';
import { lerCorpo, responder, respostaJsonInvalido } from '@/lib/http';

// CAMADA DE ROTA (fina)
// Publica por natureza: quem se cadastra ainda nao tem token.

const UM_DIA_EM_SEGUNDOS = 60 * 60 * 24;

export async function POST(request) {
  const { ok, corpo } = await lerCorpo(request);

  if (!ok) return respostaJsonInvalido();

  const resultado = await AuthController.cadastrar(corpo);
  const resposta = responder(resultado, 201);

  if (resultado.ok) {
    // Mesmo tratamento do login: token no corpo para o cabecalho Authorization
    // e cookie httpOnly para a navegacao entre paginas.
    resposta.cookies.set('token', resultado.dados.token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: UM_DIA_EM_SEGUNDOS,
    });
  }

  return resposta;
}
