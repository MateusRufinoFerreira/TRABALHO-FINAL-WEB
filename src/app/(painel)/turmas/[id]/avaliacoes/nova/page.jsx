'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useErroDeApi } from '@/hooks/useErroDeApi';

const CAMPOS_INICIAIS = {
  titulo: '',
  tipo: 'PROVA',
  dataInicio: '',
  dataTermino: '',
};

function paraIso(valorLocal) {
  if (!valorLocal) return '';

  const data = new Date(valorLocal);
  return Number.isNaN(data.getTime()) ? '' : data.toISOString();
}

export default function PaginaNovaAvaliacao() {
  const { id: turmaId } = useParams();
  const router = useRouter();

  const [turma, setTurma] = useState(null);
  const { erro, setErro, tratarErro } = useErroDeApi();
  const [alunos, setAlunos] = useState([]);
  const [questoes, setQuestoes] = useState([]);
  const [filtroBanco, setFiltroBanco] = useState('TODOS');
  const [selecionadas, setSelecionadas] = useState(() => new Set());
  const [ordemAleatoria, setOrdemAleatoria] = useState(false);
  const [campos, setCampos] = useState(CAMPOS_INICIAIS);
  // Set: a checagem por aluno a cada render e O(1), contra O(n) de um array.
  const [participantes, setParticipantes] = useState(() => new Set());
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const [dadosTurma, dadosAlunos, dadosQuestoes] = await Promise.all([
          api(`/api/turmas/${turmaId}`),
          api(`/api/turmas/${turmaId}/alunos`),
          // Sem filtro: a avaliacao pode combinar questoes de bancos diferentes.
          api('/api/questoes'),
        ]);

        if (!ativo) return;
        setTurma(dadosTurma);
        setAlunos(dadosAlunos);
        setQuestoes(dadosQuestoes);
        // Por padrao a avaliacao vale para a turma inteira.
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
    // Set novo: mutar o existente manteria a referencia e nao re-renderizaria.
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

  function adicionarQuestao(questaoId) {
    setSelecionadas((anteriores) => new Set(anteriores).add(questaoId));
  }

  function removerQuestao(questaoId) {
    setSelecionadas((anteriores) => {
      const proximo = new Set(anteriores);
      proximo.delete(questaoId);
      return proximo;
    });
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
          ordemAleatoria,
          turmaId,
          alunoIds: [...participantes],
          questaoIds: [...selecionadas],
        },
      });

      router.push(`/turmas/${turmaId}`);
    } catch (e) {
      tratarErro(e);
      setSalvando(false);
    }
  }

  const bancosDisponiveis = [...new Map(questoes.map((q) => [q.banco.id, q.banco])).values()];

  const disponiveis = questoes.filter(
    (q) => !selecionadas.has(q.id) && (filtroBanco === 'TODOS' || q.banco.id === filtroBanco)
  );

  // Ordem createdAt asc do servidor, que e a ordem exibida quando fixa.
  const montadas = questoes.filter((q) => selecionadas.has(q.id));

  const pesoTotal = montadas.reduce((soma, q) => soma + q.peso, 0);

  return (
    <>
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
        <h2 className="mb-1 font-semibold text-gray-800">Informações básicas</h2>
        <p className="mb-4 text-xs text-gray-500">
          Campos com <span className="text-red-500">*</span> são obrigatórios.
        </p>

        <div className="mb-4">
          <label htmlFor="titulo" className="mb-1 block text-sm font-medium text-gray-700">
            Título <span className="text-red-500">*</span>
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
              Início <span className="text-red-500">*</span>
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
              Término <span className="text-red-500">*</span>
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

        <section className="mt-8 border-t border-gray-200 pt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-gray-800">
              Montagem da avaliação{' '}
              <span className="font-normal text-gray-500">
                ({montadas.length} {montadas.length === 1 ? 'questão' : 'questões'} • peso total{' '}
                {pesoTotal})
              </span>
            </h2>

            {bancosDisponiveis.length > 1 && (
              <select
                aria-label="Filtrar por banco"
                value={filtroBanco}
                onChange={(e) => setFiltroBanco(e.target.value)}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="TODOS">Todos os bancos</option>
                {bancosDisponiveis.map((banco) => (
                  <option key={banco.id} value={banco.id}>
                    {banco.titulo}
                  </option>
                ))}
              </select>
            )}
          </div>

          {questoes.length === 0 ? (
            <p className="rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-600">
              Nenhuma questão cadastrada.{' '}
              <Link href="/bancos" className="font-medium text-blue-600 hover:underline">
                Criar questões no banco
              </Link>
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-700">
                  Disponíveis ({disponiveis.length})
                </h3>
                <ul
                  data-lista="disponiveis"
                  className="max-h-72 divide-y divide-gray-100 overflow-y-auto rounded-md border border-gray-200"
                >
                  {disponiveis.length === 0 && (
                    <li className="px-4 py-6 text-center text-sm text-gray-500">
                      Nenhuma questão disponível neste filtro.
                    </li>
                  )}
                  {disponiveis.map((questao) => (
                    <li key={questao.id} className="flex items-start gap-3 px-4 py-3">
                      <span className="flex-1">
                        <span className="block text-sm text-gray-800">{questao.enunciado}</span>
                        <span className="block text-xs text-gray-500">
                          {questao.banco.titulo} • peso {questao.peso}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => adicionarQuestao(questao.id)}
                        aria-label={`Adicionar: ${questao.enunciado}`}
                        className="rounded-md border border-blue-200 px-2.5 py-1 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                      >
                        Adicionar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-700">
                  Nesta avaliação ({montadas.length})
                </h3>
                <ul
                  data-lista="montadas"
                  className="max-h-72 divide-y divide-gray-100 overflow-y-auto rounded-md border border-gray-200"
                >
                  {montadas.length === 0 && (
                    <li className="px-4 py-6 text-center text-sm text-gray-500">
                      Adicione questões da lista ao lado.
                    </li>
                  )}
                  {montadas.map((questao, indice) => (
                    <li key={questao.id} className="flex items-start gap-3 px-4 py-3">
                      <span className="flex-1">
                        <span className="block text-sm text-gray-800">
                          {indice + 1}. {questao.enunciado}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {questao.banco.titulo} • peso {questao.peso}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removerQuestao(questao.id)}
                        aria-label={`Remover: ${questao.enunciado}`}
                        className="rounded-md border border-red-200 px-2.5 py-1 text-sm font-medium text-red-700 transition hover:bg-red-50"
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="mt-6 rounded-md bg-gray-50 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={ordemAleatoria}
                onChange={(e) => setOrdemAleatoria(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                <span className="block text-sm font-medium text-gray-800">
                  Embaralhar a ordem das questões
                </span>
                <span className="block text-xs text-gray-600">
                  {ordemAleatoria
                    ? 'Cada consulta à avaliação devolve as questões em ordem diferente.'
                    : 'As questões seguem sempre a ordem exibida acima.'}
                </span>
              </span>
            </label>
          </div>
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
    </>
  );
}
