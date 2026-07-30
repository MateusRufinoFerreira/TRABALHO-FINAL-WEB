'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ErroDeApi } from '@/lib/api';

export default function PaginaNovaTurma() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [semestre, setSemestre] = useState('');
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);

  async function handleSalvar(evento) {
    evento.preventDefault();

    setErro(null);
    setSalvando(true);

    try {
      await api('/api/turmas', {
        metodo: 'POST',
        corpo: { nome, codigo, semestre },
      });

      // A listagem recarrega os dados no proprio useEffect, entao basta navegar.
      router.push('/turmas');
    } catch (e) {
      if (e instanceof ErroDeApi && e.status === 401) {
        router.replace('/login');
        return;
      }
      setErro(e.message);
      setSalvando(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <Link href="/turmas" className="text-sm text-blue-600 hover:underline">
            ← Minhas Turmas
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-800">Criar Nova Turma</h1>
        </header>

        <form onSubmit={handleSalvar} className="rounded-lg bg-white p-6 shadow-sm sm:p-8" noValidate>
          {erro && (
            <p
              role="alert"
              className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {erro}
            </p>
          )}

          <div className="mb-4">
            <label htmlFor="nome" className="mb-1 block text-sm font-medium text-gray-700">
              Nome da disciplina
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Laboratório de Programação I"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="codigo" className="mb-1 block text-sm font-medium text-gray-700">
                Código
              </label>
              <input
                id="codigo"
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                required
                placeholder="LPI"
                className="w-full rounded-md border border-gray-300 px-3 py-2 uppercase text-gray-900 placeholder:normal-case placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label htmlFor="semestre" className="mb-1 block text-sm font-medium text-gray-700">
                Semestre
              </label>
              <input
                id="semestre"
                type="text"
                value={semestre}
                onChange={(e) => setSemestre(e.target.value)}
                required
                placeholder="2026.1"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <p className="mt-1 text-xs text-gray-500">Formato: ano.período (ex.: 2026.1)</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={salvando}
              className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {salvando ? 'Salvando...' : 'Salvar Turma'}
            </button>

            <Link
              href="/turmas"
              className="rounded-md border border-gray-300 px-4 py-2 text-center font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
