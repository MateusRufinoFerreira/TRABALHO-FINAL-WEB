// Vocabulario que os controllers usam para comunicar o desfecho de uma operacao.
//
// Os tipos de erro sao de dominio, nao de HTTP: um controller nunca decide
// "isso e 404". Ele diz "nao encontrei" e quem traduz para status code e a
// camada de rota (ver src/lib/http.js). Assim o controller permanece testavel e
// reutilizavel fora de uma requisicao HTTP.

export const ERRO = {
  VALIDACAO: 'VALIDACAO',
  NAO_ENCONTRADO: 'NAO_ENCONTRADO',
  CONFLITO: 'CONFLITO',
  NAO_AUTORIZADO: 'NAO_AUTORIZADO',
  INTERNO: 'INTERNO',
};

export function sucesso(dados) {
  return { ok: true, dados };
}

export function falha(tipo, mensagem) {
  return { ok: false, tipo, mensagem };
}
