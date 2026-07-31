'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { salvarSessao } from '@/lib/sessao';

export default function PaginaLogin() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function handleEntrar(evento) {
    evento.preventDefault();

    setErro(null);
    setEnviando(true);

    try {
      const { token, usuario } = await api('/api/auth/login', {
        metodo: 'POST',
        corpo: { email, senha },
      });

      salvarSessao({ token, usuario });

      // replace: o botao voltar nao retorna ao login.
      router.replace('/');
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-500">Provius</h1>
          <p className="mt-2 text-sm text-slate-400">
            Plataforma de Gerenciamento de Avaliações
          </p>
        </header>

        <form
          onSubmit={handleEntrar}
          className="rounded-lg bg-white p-6 shadow-xl sm:p-8"
          noValidate
        >
          <h2 className="mb-6 text-xl font-semibold text-gray-800">Acessar o sistema</h2>

          {erro && (
            <p
              role="alert"
              className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {erro}
            </p>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              placeholder="professor@uepb.edu.br"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="senha" className="mb-1 block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            Não tem conta?{' '}
            <Link href="/cadastro" className="font-medium text-blue-600 hover:underline">
              Criar conta
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
