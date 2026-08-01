import { NextResponse } from 'next/server';
import { verificarToken } from '@/lib/jwt';

const API_PUBLICA = ['/api/auth/login', '/api/auth/logout', '/api/auth/registro'];
const PAGINAS_PUBLICAS = ['/login', '/cadastro'];

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

  if (pathname.startsWith('/api/')) {
    if (API_PUBLICA.includes(pathname)) return NextResponse.next();

    // O cookie e alternativa ao cabecalho, que e o canal principal.
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

  const autenticado = Boolean(verificarToken(tokenDoCookie(request)));

  if (PAGINAS_PUBLICAS.includes(pathname)) {
    return autenticado ? redirecionarPara('/', request) : NextResponse.next();
  }

  return autenticado ? NextResponse.next() : redirecionarPara('/login', request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
