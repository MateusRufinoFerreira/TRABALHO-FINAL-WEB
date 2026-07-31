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
