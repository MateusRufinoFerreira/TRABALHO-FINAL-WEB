import jwt from 'jsonwebtoken';

const EXPIRACAO = '1d';

function obterSegredo() {
  const segredo = process.env.JWT_SECRET;

  if (!segredo) {
    throw new Error('JWT_SECRET nao configurado. Defina a variavel no .env.');
  }

  return segredo;
}

export function assinarToken(payload) {
  return jwt.sign(payload, obterSegredo(), { expiresIn: EXPIRACAO });
}

export function verificarToken(token) {
  if (!token) return null;

  try {
    return jwt.verify(token, obterSegredo());
  } catch {
    return null;
  }
}
