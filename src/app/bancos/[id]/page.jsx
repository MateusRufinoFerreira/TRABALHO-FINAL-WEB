'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ErroDeApi } from '@/lib/api';

const ROTULO_TIPO = { DISCURSIVA: 'Discursiva', MULTIPLA_ESCOLHA: 'Múltipla Escolha' };

const CAMPOS_INICIAIS = {
  tipo: 'DISCURSIVA',
  enunciado: '',
  peso: '1',
  gabarito: '',
};

export default function PaginaBanco() {
  const { id } = useParams();
  const router = useRouter();

  const [banco, setBanco] = useState(null);
  const [bancos, setBancos] = useState([]);
  const [questoes, setQuestoes] = useState([]);
  const [bancoDestino, setBancoDestino] = useState(id);
  const [campos, setCampos] = useState(CAMPOS_INICIAIS);
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
        // O banco atual (com suas questoes) e a lista de bancos para o combobox
        // de destino. Requisicoes independentes, portanto em paralelo.
        const [detalhe, todos] = await Promise.all([api(`/api/bancos/${id}`), api('/api/bancos')]);

        if (!ativo) return;
        setBanco(detalhe);
        setQuestoes(detalhe.questoes);
        setBancos(todos);
        setBancoDestino(id);
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
  }, [id, router]);

  function atualizarCampo(nome, valor) {
    setCampos((anteriores) => ({ ...anteriores, [nome]: valor }));
  }

  async function handleCriarQuestao(evento) {
    evento.preventDefault();

    setErro(null);
    setSalvando(true);

    try {
      const questao = await api('/api/questoes', {
        metodo: 'POST',
        corpo: { ...campos, bancoId: bancoDestino },
      });

      setCampos(CAMPOS_INICIAIS);

      // Se o professor escolheu outro banco de destino, a questao nao pertence a
      // esta tela: navega para o banco que a recebeu, em vez de sumir com ela.
      if (bancoDestino !== id) {
        router.push(`/bancos/${bancoDestino}`);
        return;
      }

      // Anexa ao fim, acompanhando a ordenacao por createdAt asc do servidor.
      setQuestoes((anteriores) => [...anteriores, questao]);
    } catch (e) {
      tratarErro(e);
    } finally {
      setSalvando(false);
    }
  }

  const multiplaEscolha = campos.tipo === 'MULTIPLA_ESCOLHA';

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/bancos" className="text-sm text-blue-600 hover:underline">
          ← Banco de Questões
        </Link>

        {carregando && <p className="mt-4 text-gray-600">Carregando banco...</p>}

        {erro && (
          <p
            role="alert"
            className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {erro}
          </p>
        )}

        {banco && (
          <>
            <header className="mt-1 mb-6">
              <h1 className="text-2xl font-bold text-gray-800">{banco.titulo}</h1>
              <p className="text-sm text-gray-600">
                {questoes.length} {questoes.length === 1 ? 'questão' : 'questões'}
              </p>
            </header>

            <form
              onSubmit={handleCriarQuestao}
              className="mb-8 rounded-lg bg-white p-6 shadow-sm"
              noValidate
            >
              <h2 className="mb-4 font-semibold text-gray-800">Nova Questão</h2>

              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="bancoDestino" className="mb-1 block text-sm font-medium text-gray-700">
                    Banco de destino
                  </label>
                  <select
                    id="bancoDestino"
                    value={bancoDestino}
                    onChange={(e) => setBancoDestino(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {bancos.map((opcao) => (
                      <option key={opcao.id} value={opcao.id}>
                        {opcao.titulo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tipo" className="mb-1 block text-sm font-medium text-gray-700">
                    Tipo
                  </label>
                  <select
                    id="tipo"
                    value={campos.tipo}
                    onChange={(e) => atualizarCampo('tipo', e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="DISCURSIVA">Discursiva</option>
                    <option value="MULTIPLA_ESCOLHA">Múltipla Escolha</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="enunciado" className="mb-1 block text-sm font-medium text-gray-700">
                  Enunciado
                </label>
                <textarea
                  id="enunciado"
                  value={campos.enunciado}
                  onChange={(e) => atualizarCampo('enunciado', e.target.value)}
                  required
                  rows={3}
                  placeholder="Qual a complexidade da busca binária?"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div>
                  <label htmlFor="peso" className="mb-1 block text-sm font-medium text-gray-700">
                    Peso
                  </label>
                  <input
                    id="peso"
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={campos.peso}
                    onChange={(e) => atualizarCampo('peso', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="sm:col-span-3">
                  {/* O rotulo muda conforme o tipo: na discursiva o gabarito e a
                      resposta esperada; na multipla escolha, a alternativa correta. */}
                  <label htmlFor="gabarito" className="mb-1 block text-sm font-medium text-gray-700">
                    {multiplaEscolha ? 'Alternativa correta' : 'Gabarito'}
                  </label>
                  <input
                    id="gabarito"
                    type="text"
                    value={campos.gabarito}
                    onChange={(e) => atualizarCampo('gabarito', e.target.value)}
                    required
                    placeholder={multiplaEscolha ? 'B' : 'O(log n)'}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={salvando}
                className="mt-4 rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {salvando ? 'Salvando...' : 'Adicionar Questão'}
              </button>
            </form>

            <h2 className="mb-4 font-semibold text-gray-800">Questões deste banco</h2>

            {questoes.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
                <p className="font-medium text-gray-800">Nenhuma questão cadastrada.</p>
                <p className="mt-1 text-sm text-gray-600">
                  Use o formulário acima para adicionar a primeira.
                </p>
              </div>
            ) : (
              <ol className="space-y-3">
                {questoes.map((questao, indice) => (
                  <li key={questao.id} className="rounded-lg bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <p className="font-medium text-gray-800">
                        {indice + 1}. {questao.enunciado}
                      </p>
                      <span className="whitespace-nowrap text-xs font-medium uppercase tracking-wide text-blue-600">
                        {ROTULO_TIPO[questao.tipo] ?? questao.tipo}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Gabarito:</span> {questao.gabarito}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Peso: {questao.peso}</p>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </div>
    </main>
  );
}
