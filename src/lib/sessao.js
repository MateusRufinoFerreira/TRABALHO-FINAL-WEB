// Sessao do professor no navegador.
//
// O token e guardado no localStorage porque o front-end precisa le-lo para
// montar o cabecalho "Authorization: Bearer". O cookie httpOnly definido pela
// rota de login nao serve para isso: por ser httpOnly, o JavaScript nao o acessa.

const CHAVE_TOKEN = 'provius.token';
const CHAVE_USUARIO = 'provius.usuario';

// Estas funcoes tambem sao importadas por modulos avaliados no servidor durante
// o build, onde localStorage nao existe.
function armazenamentoDisponivel() {
  return typeof window !== 'undefined' && window.localStorage;
}

export function salvarSessao({ token, usuario }) {
  if (!armazenamentoDisponivel()) return;

  window.localStorage.setItem(CHAVE_TOKEN, token);
  window.localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
}

export function obterToken() {
  if (!armazenamentoDisponivel()) return null;

  return window.localStorage.getItem(CHAVE_TOKEN);
}

export function obterUsuario() {
  if (!armazenamentoDisponivel()) return null;

  const bruto = window.localStorage.getItem(CHAVE_USUARIO);
  if (!bruto) return null;

  try {
    return JSON.parse(bruto);
  } catch {
    // Conteudo corrompido nao deve derrubar a aplicacao.
    return null;
  }
}

export function encerrarSessao() {
  if (!armazenamentoDisponivel()) return;

  window.localStorage.removeItem(CHAVE_TOKEN);
  window.localStorage.removeItem(CHAVE_USUARIO);
}
