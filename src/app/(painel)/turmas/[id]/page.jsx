'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useErroDeApi } from '@/hooks/useErroDeApi';

const ROTULO_TIPO = { PROVA: 'Prova', LISTA: 'Lista de Exercícios' };

function formatarData(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PaginaTurma() {
  // Em Client Component o id vem do useParams: nas props seria uma Promise.
  const { id } = useParams();

  const [turma, setTurma] = useState(null);
  const { erro, setErro, tratarErro } = useErroDeApi();
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function carregarTurma() {
      try {
        const dados = await api(`/api/turmas/${id}`);
        if (ativo) setTurma(dados);
      } catch (e) {
        if (ativo) tratarErro(e);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarTurma();

    return () => {
      ativo = false;
    };
  }, [id, tratarErro]);

  return (
    <>
    <Link href="/turmas" className="text-sm text-blue-600 hover:underline">
      ← Minhas Turmas
    </Link>

    {carregando && <p className="mt-4 text-gray-600">Carregando turma...</p>}

    {erro && (
      <p
        role="alert"
        className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {erro}
      </p>
    )}

    {turma && (
      <>
        <header className="mt-1 mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{turma.nome}</h1>
            <p className="text-sm text-gray-600">
              {turma.codigo} • {turma.semestre} • {turma._count.alunos}{' '}
              {turma._count.alunos === 1 ? 'aluno' : 'alunos'}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/turmas/${turma.id}/alunos`}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-center font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Gerenciar Alunos
            </Link>
            <Link
              href={`/turmas/${turma.id}/avaliacoes/nova`}
              className="rounded-md bg-blue-600 px-4 py-2 text-center font-medium text-white transition hover:bg-blue-700"
            >
              Criar Nova Avaliação
            </Link>
          </div>
        </header>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Avaliações</h2>

          {turma.avaliacoes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="font-medium text-gray-800">Nenhuma avaliação agendada.</p>
              <p className="mt-1 text-sm text-gray-600">
                Monte uma prova ou lista puxando questões dos bancos.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {turma.avaliacoes.map((avaliacao) => (
                <li key={avaliacao.id} className="rounded-lg bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-semibold text-gray-800">{avaliacao.titulo}</h3>
                    <span className="text-xs font-medium uppercase tracking-wide text-blue-600">
                      {ROTULO_TIPO[avaliacao.tipo] ?? avaliacao.tipo}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-600">
                    {formatarData(avaliacao.dataInicio)} até {formatarData(avaliacao.dataTermino)}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Ordem das questões: {avaliacao.ordemAleatoria ? 'aleatória' : 'fixa'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </>
    )}
    </>
  );
}
