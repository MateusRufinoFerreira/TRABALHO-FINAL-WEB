import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const { email, senha } = await req.json();

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: usuario.id, email: usuario.email },
      process.env.JWT_SECRET || 'chave_secreta_padrao',
      { expiresIn: '1d' }
    );

    const response = NextResponse.json({ message: 'Login realizado com sucesso' });
    response.cookies.set('token', token, { httpOnly: true, path: '/' });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}