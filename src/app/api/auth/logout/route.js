import { NextResponse } from 'next/server';

// Encerra a sessao expirando o cookie httpOnly.
//
// Precisa ser uma rota de servidor: por ser httpOnly, o cookie e invisivel ao
// JavaScript, que portanto nao consegue apaga-lo. O token no localStorage e
// removido no cliente (ver src/lib/sessao.js).
//
// Continua acessivel sem autenticacao: sair com um token ja expirado deve
// funcionar, nao retornar 401.

export async function POST() {
  const resposta = NextResponse.json({ mensagem: 'Sessao encerrada.' });

  resposta.cookies.set('token', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return resposta;
}
