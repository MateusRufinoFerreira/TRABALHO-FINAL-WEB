import { NextResponse } from 'next/server';

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
