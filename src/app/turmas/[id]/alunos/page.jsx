'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ErroDeApi } from '@/lib/api';

const CAMPOS_VAZIOS = { nome: '', matricula: '', email: '' };

export default function PaginaGerenciarAlunos() {
  const { id: turmaId } = useParams();
  const router = useRouter();

  const [turma, setTurma] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [campos, setCampos] = useState(CAMPOS_VAZIOS);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);
  // Guarda o id em remocao para desabilitar apenas aquele botao.
  const [removendo, setRemovendo] = useState(null);

  function tratarErro(e) {
    if (e instanceof ErroDeApi && e.status === 401) {
      router.replace('/login');
      return true;
    }
    setErro(e.message);
    return false;
  }

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        // As duas requisicoes sao independentes: em paralelo em vez de em fila.
        const [dadosTurma, dadosAlunos] = await Promise.all([
          api(`/api/turmas/${turmaId}`),
          api(`/api/turmas/${turmaId}/alunos`),
        ]);

        if (!ativo) return;
        setTurma(dadosTurma);
        setAlunos(dadosAlunos);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turmaId, router]);

  function atualizarCampo(nome, valor) {
    setCampos((anteriores) => ({ ...anteriores, [nome]: valor }));
  }

  async function handleMatricular(evento) {
    evento.preventDefault();

    setErro(null);
    setSalvando(true);

    try {
      const aluno = await api(`/api/turmas/${turmaId}/alunos`, {
        metodo: 'POST',
        corpo: campos,
      });

      // Insere o aluno devolvido pela API e mantem a ordenacao por nome usada
      // pelo servidor, para a lista nao "pular" no proximo carregamento.
      setAlunos((anteriores) =>
        [...anteriores, aluno].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      );
      setCampos(CAMPOS_VAZIOS);
    } catch (e) {
      tratarErro(e);
    } finally {
      setSalvando(false);
    }
  }

  async function handleRemover(aluno) {
    setErro(null);
    setRemovendo(aluno.id);

    try {
      await api(`/api/turmas/${turmaId}/alunos/${aluno.id}`, { metodo: 'DELETE' });

      setAlunos((anteriores) => anteriores.filter((a) => a.id !== aluno.id));
    } catch (e) {
      tratarErro(e);
    } finally {
      setRemovendo(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <Link href={`/turmas/${turmaId}`} className="text-sm text-blue-600 hover:underline">
          ← Voltar para a turma
        </Link>

        <h1 className="mt-1 text-2xl font-bold text-gray-800">Gerenciar Alunos</h1>
        {turma && (
          <p className="text-sm text-gray-600">
            {turma.nome} • {turma.codigo} • {turma.semestre}
          </p>
        )}

        {erro && (
          <p
            role="alert"
            className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {erro}
          </p>
        )}

        <form onSubmit={handleMatricular} className="mt-6 rounded-lg bg-white p-6 shadow-sm" noValidate>
          <h2 className="mb-4 font-semibold text-gray-800">Matricular aluno</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="nome" className="mb-1 block text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                id="nome"
                type="text"
                value={campos.nome}
                onChange={(e) => atualizarCampo('nome', e.target.value)}
                required
                placeholder="Maria Silva"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label htmlFor="matricula" className="mb-1 block text-sm font-medium text-gray-700">
                Matrícula
              </label>
              <input
                id="matricula"
                type="text"
                value={campos.matricula}
                onChange={(e) => atualizarCampo('matricula', e.target.value)}
                required
                placeholder="2026001"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={campos.email}
                onChange={(e) => atualizarCampo('email', e.target.value)}
                required
                placeholder="maria@aluno.uepb.edu.br"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={salvando}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {salvando ? 'Matriculando...' : 'Matricular'}
          </button>
        </form>

        <section className="mt-8">
          <h2 className="mb-4 font-semibold text-gray-800">
            Alunos matriculados{!carregando && ` (${alunos.length})`}
          </h2>

          {carregando && <p className="text-gray-600">Carregando alunos...</p>}

          {!carregando && alunos.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="font-medium text-gray-800">Nenhum aluno matriculado.</p>
              <p className="mt-1 text-sm text-gray-600">
                Use o formulário acima para matricular o primeiro aluno.
              </p>
            </div>
          )}

          {alunos.length > 0 && (
            <ul className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow-sm">
              {alunos.map((aluno) => (
                <li
                  key={aluno.id}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-800">{aluno.nome}</p>
                    <p className="text-sm text-gray-500">
                      {aluno.matricula} • {aluno.email}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemover(aluno)}
                    disabled={removendo === aluno.id}
                    className="self-start rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
                  >
                    {removendo === aluno.id ? 'Removendo...' : 'Remover'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
