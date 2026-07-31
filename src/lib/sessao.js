const CHAVE_TOKEN = 'provius.token';
const CHAVE_USUARIO = 'provius.usuario';

// localStorage nao existe no servidor.
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
    return null;
  }
}

export function encerrarSessao() {
  if (!armazenamentoDisponivel()) return;

  window.localStorage.removeItem(CHAVE_TOKEN);
  window.localStorage.removeItem(CHAVE_USUARIO);
}
