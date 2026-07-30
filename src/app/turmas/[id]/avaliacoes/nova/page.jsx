'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ErroDeApi } from '@/lib/api';

const CAMPOS_INICIAIS = {
  titulo: '',
  tipo: 'PROVA',
  dataInicio: '',
  dataTermino: '',
};

// O input datetime-local devolve "2026-08-10T14:00", sem fuso e sem segundos.
// new Date() interpreta esse texto como hora LOCAL, que e o que o professor
// digitou; toISOString converte para UTC, que e o formato aceito pela API.
function paraIso(valorLocal) {
  if (!valorLocal) return '';

  const data = new Date(valorLocal);
  return Number.isNaN(data.getTime()) ? '' : data.toISOString();
}

export default function PaginaNovaAvaliacao() {
  const { id: turmaId } = useParams();
  const router = useRouter();

  const [turma, setTurma] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [campos, setCampos] = useState(CAMPOS_INICIAIS);
  // Set em vez de array: a checagem de "esta selecionado" acontece a cada
  // renderizacao, para cada aluno. Com Set e O(1); com array seria O(n).
  const [participantes, setParticipantes] = useState(() => new Set());
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);

  function tratarErro(e) {
    if (e instanceof ErroDeApi && e.status === 401) {
      router.replace('/login');
      return;
    }
    setErro(e.message);
  }

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const [dadosTurma, dadosAlunos] = await Promise.all([
          api(`/api/turmas/${turmaId}`),
          api(`/api/turmas/${turmaId}/alunos`),
        ]);

        if (!ativo) return;
        setTurma(dadosTurma);
        setAlunos(dadosAlunos);
        // Por padrao a avaliacao e para a turma inteira: o caso comum nao exige
        // marcar aluno por aluno, e desmarcar excecoes e mais rapido.
        setParticipantes(new Set(dadosAlunos.map((aluno) => aluno.id)));
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

  function alternarParticipante(alunoId) {
    // Um Set novo a cada alteracao: mutar o Set existente nao mudaria a
    // referencia, e o React nao re-renderizaria.
    setParticipantes((anteriores) => {
      const proximo = new Set(anteriores);
      if (proximo.has(alunoId)) proximo.delete(alunoId);
      else proximo.add(alunoId);
      return proximo;
    });
  }

  function alternarTodos() {
    setParticipantes((anteriores) =>
      anteriores.size === alunos.length ? new Set() : new Set(alunos.map((a) => a.id))
    );
  }

  async function handleSalvar(evento) {
    evento.preventDefault();

    setErro(null);
    setSalvando(true);

    try {
      await api('/api/avaliacoes', {
        metodo: 'POST',
        corpo: {
          titulo: campos.titulo,
          tipo: campos.tipo,
          dataInicio: paraIso(campos.dataInicio),
          dataTermino: paraIso(campos.dataTermino),
          turmaId,
          alunoIds: [...participantes],
        },
      });

      router.push(`/turmas/${turmaId}`);
    } catch (e) {
      tratarErro(e);
      setSalvando(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <Link href={`/turmas/${turmaId}`} className="text-sm text-blue-600 hover:underline">
          ← Voltar para a turma
        </Link>

        <h1 className="mt-1 text-2xl font-bold text-gray-800">Criar Nova Avaliação</h1>
        {turma && (
          <p className="text-sm text-gray-600">
            {turma.nome} • {turma.codigo} • {turma.semestre}
          </p>
        )}

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
          <form onSubmit={handleSalvar} className="mt-6 rounded-lg bg-white p-6 shadow-sm" noValidate>
            <h2 className="mb-4 font-semibold text-gray-800">Informações básicas</h2>

            <div className="mb-4">
              <label htmlFor="titulo" className="mb-1 block text-sm font-medium text-gray-700">
                Título
              </label>
              <input
                id="titulo"
                type="text"
                value={campos.titulo}
                onChange={(e) => atualizarCampo('titulo', e.target.value)}
                required
                placeholder="Prova 1 - Ponteiros e Alocação Dinâmica"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="tipo" className="mb-1 block text-sm font-medium text-gray-700">
                Tipo
              </label>
              <select
                id="tipo"
                value={campos.tipo}
                onChange={(e) => atualizarCampo('tipo', e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-64"
              >
                <option value="PROVA">Prova</option>
                <option value="LISTA">Lista de Exercícios</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="dataInicio" className="mb-1 block text-sm font-medium text-gray-700">
                  Início
                </label>
                <input
                  id="dataInicio"
                  type="datetime-local"
                  value={campos.dataInicio}
                  onChange={(e) => atualizarCampo('dataInicio', e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label htmlFor="dataTermino" className="mb-1 block text-sm font-medium text-gray-700">
                  Término
                </label>
                <input
                  id="dataTermino"
                  type="datetime-local"
                  value={campos.dataTermino}
                  onChange={(e) => atualizarCampo('dataTermino', e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            <section className="mt-8 border-t border-gray-200 pt-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold text-gray-800">
                  Participantes{' '}
                  <span className="font-normal text-gray-500">
                    ({participantes.size} de {alunos.length})
                  </span>
                </h2>

                {alunos.length > 0 && (
                  <button
                    type="button"
                    onClick={alternarTodos}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {participantes.size === alunos.length ? 'Desmarcar todos' : 'Marcar todos'}
                  </button>
                )}
              </div>

              {alunos.length === 0 ? (
                <p className="rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-600">
                  Esta turma não tem alunos matriculados.{' '}
                  <Link
                    href={`/turmas/${turmaId}/alunos`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    Gerenciar alunos
                  </Link>
                </p>
              ) : (
                <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
                  {alunos.map((aluno) => (
                    <li key={aluno.id}>
                      {/* O label envolve o checkbox: clicar em qualquer ponto da
                          linha alterna a selecao, area de clique maior. */}
                      <label className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={participantes.has(aluno.id)}
                          onChange={() => alternarParticipante(aluno.id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="flex-1">
                          <span className="block text-sm font-medium text-gray-800">{aluno.nome}</span>
                          <span className="block text-xs text-gray-500">
                            {aluno.matricula} • {aluno.email}
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={salvando}
                className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {salvando ? 'Agendando...' : 'Agendar Avaliação'}
              </button>

              <Link
                href={`/turmas/${turmaId}`}
                className="rounded-md border border-gray-300 px-4 py-2 text-center font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
