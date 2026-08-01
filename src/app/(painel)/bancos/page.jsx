'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useErroDeApi } from '@/hooks/useErroDeApi';
import SaudacaoProfessor from '@/components/SaudacaoProfessor';

export default function PaginaBancos() {
  const [bancos, setBancos] = useState([]);
  const { erro, setErro, tratarErro } = useErroDeApi();
  const [titulo, setTitulo] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarBancos() {
      try {
        const dados = await api('/api/bancos');
        if (ativo) setBancos(dados);
      } catch (e) {
        if (ativo) tratarErro(e);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarBancos();

    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tratarErro]);

  async function handleCriar(evento) {
    evento.preventDefault();

    setErro(null);
    setSalvando(true);

    try {
      const banco = await api('/api/bancos', { metodo: 'POST', corpo: { titulo } });

      // Acompanha a ordenacao createdAt desc do servidor.
      setBancos((anteriores) => [banco, ...anteriores]);
      setTitulo('');
    } catch (e) {
      tratarErro(e);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
    <SaudacaoProfessor />

    <header className="mb-6">
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← Visão Geral
      </Link>
      <h1 className="mt-1 text-2xl font-bold text-gray-800">Banco de Questões</h1>
      <p className="text-sm text-gray-600">
        Agrupe questões por tema para reaproveitá-las em várias avaliações.
      </p>
    </header>

    {erro && (
      <p
        role="alert"
        className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {erro}
      </p>
    )}

    <form onSubmit={handleCriar} className="mb-8 rounded-lg bg-white p-6 shadow-sm" noValidate>
      <h2 className="mb-1 font-semibold text-gray-800">Novo Banco</h2>
      <p className="mb-4 text-xs text-gray-500">
        Campos com <span className="text-red-500">*</span> são obrigatórios.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="titulo" className="mb-1 block text-sm font-medium text-gray-700">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            id="titulo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            placeholder="Estruturas de Dados"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <button
          type="submit"
          disabled={salvando}
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {salvando ? 'Criando...' : 'Criar Banco'}
        </button>
      </div>
    </form>

    <h2 className="mb-4 font-semibold text-gray-800">
      Meus bancos{!carregando && ` (${bancos.length})`}
    </h2>

    {carregando && <p className="text-gray-600">Carregando bancos...</p>}

    {!carregando && bancos.length === 0 && (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="font-medium text-gray-800">Nenhum banco cadastrado.</p>
        <p className="mt-1 text-sm text-gray-600">
          Crie o primeiro banco para começar a cadastrar questões.
        </p>
      </div>
    )}

    {bancos.length > 0 && (
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {bancos.map((banco) => (
          <li key={banco.id} className="rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md">
            <h3 className="font-semibold text-gray-800">{banco.titulo}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {banco._count.questoes}{' '}
              {banco._count.questoes === 1 ? 'questão' : 'questões'}
            </p>

            <Link
              href={`/bancos/${banco.id}`}
              className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              Ver questões →
            </Link>
          </li>
        ))}
      </ul>
    )}
    </>
  );
}
