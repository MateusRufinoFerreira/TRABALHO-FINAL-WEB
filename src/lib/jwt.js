import jwt from 'jsonwebtoken';

const EXPIRACAO = '1d';

// O segredo vem exclusivamente do .env. Nao existe valor padrao: um fallback
// escrito no codigo seria publico no repositorio, e qualquer pessoa poderia
// forjar tokens validos.
function obterSegredo() {
  const segredo = process.env.JWT_SECRET;

  if (!segredo) {
    throw new Error('JWT_SECRET nao configurado. Defina a variavel no .env.');
  }

  return segredo;
}

// O payload nao carrega senha nem hash: apenas o necessario para identificar o
// usuario nas requisicoes seguintes. Lembrando que o corpo de um JWT e apenas
// codificado em base64, nao criptografado, e pode ser lido por qualquer um.
export function assinarToken(payload) {
  return jwt.sign(payload, obterSegredo(), { expiresIn: EXPIRACAO });
}

// Devolve o payload quando o token e valido, ou null quando esta ausente,
// expirado ou com assinatura invalida.
export function verificarToken(token) {
  if (!token) return null;

  try {
    return jwt.verify(token, obterSegredo());
  } catch {
    return null;
  }
}
