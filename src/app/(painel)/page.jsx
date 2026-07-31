'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useErroDeApi } from '@/hooks/useErroDeApi';

function Indicador({ rotulo, valor, descricao, cor }) {
  return (
    <div className={`rounded-lg p-6 text-white shadow-md ${cor}`}>
      <h2 className="text-lg font-medium">{rotulo}</h2>
      <p className="mt-2 text-4xl font-bold">{valor}</p>
      <span className="text-sm opacity-80">{descricao}</span>
    </div>
  );
}

export default function PaginaVisaoGeral() {

  const [dados, setDados] = useState(null);
  const { erro, setErro, tratarErro } = useErroDeApi();
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const estatisticas = await api('/api/dashboard');
        if (ativo) setDados(estatisticas);
      } catch (e) {
        if (ativo) tratarErro(e);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, [tratarErro]);

  return (
    <>
    <header className="mb-8">
      <h1 className="text-2xl font-bold text-gray-800">Visão Geral</h1>
      <p className="text-sm text-gray-600">Resumo do semestre e atalhos rápidos.</p>
    </header>

    {carregando && <p className="text-gray-600">Carregando estatísticas...</p>}

    {erro && (
      <p
        role="alert"
        className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {erro}
      </p>
    )}

    {dados && (
      <>
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Indicador
            rotulo="Alunos Ativos"
            valor={dados.alunosAtivos}
            descricao="Alunos distintos em todas as turmas"
            cor="bg-blue-600"
          />
          <Indicador
            rotulo="Avaliações Criadas"
            valor={dados.avaliacoesCriadas}
            descricao="Provas e listas agendadas"
            cor="bg-purple-600"
          />
          <Indicador
            rotulo="Turmas"
            valor={dados.turmasTotal}
            descricao="Turmas sob sua responsabilidade"
            cor="bg-emerald-600"
          />
        </div>

        <section className="rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-gray-800">Turmas Recentes</h2>
            <Link href="/turmas" className="text-sm font-medium text-blue-600 hover:underline">
              Ver todas →
            </Link>
          </div>

          {dados.turmasRecentes.length === 0 ? (
            <div className="rounded-md border border-dashed border-gray-300 p-8 text-center">
              <p className="font-medium text-gray-800">Nenhuma turma cadastrada.</p>
              <p className="mt-1 text-sm text-gray-600">
                Comece criando uma turma para depois montar avaliações.
              </p>
              <Link
                href="/turmas/nova"
                className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
              >
                Criar Nova Turma
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {dados.turmasRecentes.map((turma) => (
                <li
                  key={turma.id}
                  className="flex flex-col gap-2 rounded-md border p-4 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-gray-800">{turma.nome}</h3>
                    <p className="text-sm text-gray-500">
                      {turma.codigo} • {turma.semestre} • {turma._count.alunos}{' '}
                      {turma._count.alunos === 1 ? 'aluno' : 'alunos'} •{' '}
                      {turma._count.avaliacoes}{' '}
                      {turma._count.avaliacoes === 1 ? 'avaliação' : 'avaliações'}
                    </p>
                  </div>

                  <Link
                    href={`/turmas/${turma.id}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Acessar Turma →
                  </Link>
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
