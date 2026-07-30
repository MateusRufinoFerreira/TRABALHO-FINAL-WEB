import { NextResponse } from 'next/server';
import { verificarToken } from '@/lib/jwt';

// Intercepta as requisicoes antes de chegarem as rotas e as paginas.
//
// NOME DO ARQUIVO: no Next.js 16 o antigo "middleware" foi descontinuado e
// renomeado para "proxy". A diferenca nao e apenas de nome: o middleware legado
// roda no Edge runtime, que nao possui o modulo crypto do Node, e por isso o
// jsonwebtoken nao funcionaria ali. O proxy roda em Node por definicao.
//
// Este arquivo NAO deve importar @/lib/prisma: o driver do Postgres e um modulo
// nativo e nao pertence a camada de interceptacao.
//
// Dois canais de autenticacao, porque servem a coisas diferentes:
//   - ROTAS DE API  -> cabecalho "Authorization: Bearer", enviado pelo fetch
//   - PAGINAS       -> cookie httpOnly, enviado pelo navegador na navegacao
// O localStorage nao acompanha a navegacao direta (digitar a URL), logo nao ha
// como proteger uma pagina com ele.

const API_PUBLICA = ['/api/auth/login', '/api/auth/logout'];
const PAGINAS_PUBLICAS = ['/login'];

function tokenDoCabecalho(request) {
  const cabecalho = request.headers.get('authorization') ?? '';

  return cabecalho.startsWith('Bearer ') ? cabecalho.slice(7).trim() : null;
}

function tokenDoCookie(request) {
  return request.cookies.get('token')?.value ?? null;
}

function redirecionarPara(caminho, request) {
  const url = request.nextUrl.clone();
  url.pathname = caminho;
  url.search = '';

  return NextResponse.redirect(url);
}

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // ----- Rotas de API -------------------------------------------------------
  if (pathname.startsWith('/api/')) {
    if (API_PUBLICA.includes(pathname)) return NextResponse.next();

    // Aceita o cookie como alternativa para que a API possa ser exercitada pelo
    // navegador; o canal principal continua sendo o cabecalho.
    const token = tokenDoCabecalho(request) ?? tokenDoCookie(request);

    if (!verificarToken(token)) {
      // Responde JSON, e nao redirect: quem chama e um fetch, nao uma navegacao.
      return NextResponse.json(
        { erro: 'Token ausente, invalido ou expirado.' },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // ----- Paginas ------------------------------------------------------------
  const autenticado = Boolean(verificarToken(tokenDoCookie(request)));

  if (PAGINAS_PUBLICAS.includes(pathname)) {
    // Quem ja esta autenticado nao precisa ver o login novamente.
    return autenticado ? redirecionarPara('/', request) : NextResponse.next();
  }

  return autenticado ? NextResponse.next() : redirecionarPara('/login', request);
}

export const config = {
  // Roda em tudo, exceto arquivos estaticos e de imagem. Sem estas exclusoes o
  // proxy bloquearia CSS, JS e imagens de quem nao esta autenticado — inclusive
  // os da propria tela de login.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
