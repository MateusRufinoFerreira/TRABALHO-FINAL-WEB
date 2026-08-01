import { verificarToken } from '@/lib/jwt';

export function professorDaRequisicao(request) {
  const cabecalho = request.headers.get('authorization') ?? '';
  const doCabecalho = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7).trim() : null;
  const doCookie = request.cookies?.get('token')?.value ?? null;

  const payload = verificarToken(doCabecalho ?? doCookie);
  if (!payload?.sub) return null;

  return { id: payload.sub, email: payload.email };
}
