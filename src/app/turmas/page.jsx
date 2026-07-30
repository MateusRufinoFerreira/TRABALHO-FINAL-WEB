'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ErroDeApi } from '@/lib/api';

export default function PaginaTurmas() {
  const router = useRouter();

  const [turmas, setTurmas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    // Em desenvolvimento o React executa os efeitos duas vezes (StrictMode).
    // A flag evita atualizar o estado de um componente ja desmontado, o que
    // geraria aviso no console e, em navegacoes rapidas, dados desatualizados.
    let ativo = true;

    async function carregarTurmas() {
      try {
        const dados = await api('/api/turmas');
        if (ativo) setTurmas(dados);
      } catch (e) {
        // Sessao expirada: o helper api() ja limpou os dados locais.
        if (e instanceof ErroDeApi && e.status === 401) {
          router.replace('/login');
          return;
        }
        if (ativo) setErro(e.message);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarTurmas();

    return () => {
      ativo = false;
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="text-sm text-blue-600 hover:underline">
              ← Visão Geral
            </Link>
            <h1 className="mt-1 text-2xl font-bold text-gray-800">Minhas Turmas</h1>
            <p className="text-sm text-gray-600">
              Turmas que você leciona, da mais recente para a mais antiga.
            </p>
          </div>

          <Link
            href="/turmas/nova"
            className="rounded-md bg-blue-600 px-4 py-2 text-center font-medium text-white transition hover:bg-blue-700"
          >
            Nova Turma
          </Link>
        </header>

        {erro && (
          <p
            role="alert"
            className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {erro}
          </p>
        )}

        {carregando && <p className="text-gray-600">Carregando turmas...</p>}

        {!carregando && !erro && turmas.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="font-medium text-gray-800">Nenhuma turma cadastrada.</p>
            <p className="mt-1 text-sm text-gray-600">
              Crie sua primeira turma para começar a montar avaliações.
            </p>
            <Link
              href="/turmas/nova"
              className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
            >
              Criar Nova Turma
            </Link>
          </div>
        )}

        {turmas.length > 0 && (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {turmas.map((turma) => (
              // A key precisa ser estavel e unica para o React reconciliar a lista.
              <li key={turma.id} className="rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md">
                <h2 className="font-semibold text-gray-800">{turma.nome}</h2>
                <p className="text-sm text-gray-500">
                  {turma.codigo} • {turma.semestre}
                </p>

                <dl className="mt-4 flex gap-6 text-sm">
                  <div>
                    <dt className="text-gray-500">Alunos</dt>
                    <dd className="font-semibold text-gray-800">{turma._count.alunos}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Avaliações</dt>
                    <dd className="font-semibold text-gray-800">{turma._count.avaliacoes}</dd>
                  </div>
                </dl>

                <Link
                  href={`/turmas/${turma.id}`}
                  className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
                >
                  Acessar Turma →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
