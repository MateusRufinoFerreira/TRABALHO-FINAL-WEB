import { NextResponse } from 'next/server';
import { ERRO } from '@/lib/resultado';

const STATUS_POR_ERRO = {
  [ERRO.VALIDACAO]: 400,
  [ERRO.NAO_AUTORIZADO]: 401,
  [ERRO.NAO_ENCONTRADO]: 404,
  [ERRO.CONFLITO]: 409,
  [ERRO.INTERNO]: 500,
};

export function responder(resultado, statusSucesso = 200) {
  if (!resultado.ok) {
    return NextResponse.json(
      { erro: resultado.mensagem },
      { status: STATUS_POR_ERRO[resultado.tipo] ?? 500 }
    );
  }

  return NextResponse.json(resultado.dados, { status: statusSucesso });
}

export async function lerCorpo(request) {
  try {
    return { ok: true, corpo: await request.json() };
  } catch {
    return { ok: false };
  }
}

export function respostaJsonInvalido() {
  return NextResponse.json(
    { erro: 'O corpo da requisicao nao e um JSON valido.' },
    { status: 400 }
  );
}

export function respostaNaoAutenticado() {
  return NextResponse.json(
    { erro: 'Token ausente, invalido ou expirado.' },
    { status: 401 }
  );
}
