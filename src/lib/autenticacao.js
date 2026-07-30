import { verificarToken } from '@/lib/jwt';

// Identifica o professor autenticado a partir da requisicao.
//
// O proxy ja barra requisicoes sem token, mas cada rota verifica de novo por
// conta propria. Isso e recomendacao explicita da documentacao do Next.js:
//
//   "A matcher change or a refactor that moves a Server Function to a different
//    route can silently remove Proxy coverage. Always verify authentication and
//    authorization inside each Server Function rather than relying on Proxy
//    alone."
//
// A alternativa seria o proxy injetar o id do usuario num cabecalho e a rota
// confiar nele. O risco: se o matcher deixasse de cobrir uma rota, o cliente
// poderia enviar esse cabecalho a mao e se passar por qualquer professor.
// Reverificar a assinatura custa pouco (HMAC) e nao depende do matcher.

export function professorDaRequisicao(request) {
  const cabecalho = request.headers.get('authorization') ?? '';
  const doCabecalho = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7).trim() : null;
  const doCookie = request.cookies?.get('token')?.value ?? null;

  const payload = verificarToken(doCabecalho ?? doCookie);
  if (!payload?.sub) return null;

  return { id: payload.sub, email: payload.email };
}
