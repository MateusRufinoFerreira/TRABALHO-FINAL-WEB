import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function embaralhar(array) {
  return array.sort(() => Math.random() - 0.5);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { titulo, tipo, dataInicio, dataTermino, ordemAleatoria, turmaId, alunoIds, questaoIds } = body;

    const avaliacao = await prisma.avaliacao.create({
      data: {
        titulo,
        tipo,
        dataInicio: new Date(dataInicio),
        dataTermino: new Date(dataTermino),
        ordemAleatoria,
        turmaId,
        alunos: { connect: (alunoIds || []).map(id => ({ id })) },
        questoes: { connect: (questaoIds || []).map(id => ({ id })) }
      },
      include: {
        questoes: true
      }
    });

    if (ordemAleatoria) {
      avaliacao.questoes = embaralhar(avaliacao.questoes);
    }

    return NextResponse.json(avaliacao, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao agendar avaliação' }, { status: 500 });
  }
}