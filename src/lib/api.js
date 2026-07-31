import { encerrarSessao, obterToken } from '@/lib/sessao';

export class ErroDeApi extends Error {
  constructor(mensagem, status) {
    super(mensagem);
    this.name = 'ErroDeApi';
    this.status = status;
  }
}

async function lerJson(resposta) {
  try {
    return await resposta.json();
  } catch {
    return null;
  }
}

/**
 * @param caminho  rota da API, ex.: '/api/turmas'
 * @param opcoes   { metodo, corpo } — o corpo e serializado automaticamente
 * @returns        o JSON da resposta
 * @throws         ErroDeApi com a mensagem devolvida pela API e o status HTTP
 */
export async function api(caminho, { metodo = 'GET', corpo } = {}) {
  const token = obterToken();

  const resposta = await fetch(caminho, {
    method: metodo,
    headers: {
      ...(corpo ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
    cache: 'no-store',
  });

  const dados = await lerJson(resposta);

  if (!resposta.ok) {
    if (resposta.status === 401) await sair();

    throw new ErroDeApi(dados?.erro ?? 'Nao foi possivel completar a operacao.', resposta.status);
  }

  return dados;
}

export async function sair() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
  } finally {
    encerrarSessao();
  }
}
