import { encerrarSessao, obterToken } from '@/lib/sessao';

// Ponto unico de comunicacao do front-end com a API.
//
// Centralizar aqui evita repetir o cabecalho Authorization em cada tela — o tipo
// de repeticao onde se esquece de um lugar e o bug passa silencioso.

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
    // Respostas sem corpo (ex.: 204) ou com corpo invalido.
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
    // Dados de gestao mudam a cada requisicao: nunca servir do cache.
    cache: 'no-store',
  });

  const dados = await lerJson(resposta);

  if (!resposta.ok) {
    // Token invalido ou expirado: a sessao local nao vale mais nada.
    if (resposta.status === 401) encerrarSessao();

    throw new ErroDeApi(dados?.erro ?? 'Nao foi possivel completar a operacao.', resposta.status);
  }

  return dados;
}
