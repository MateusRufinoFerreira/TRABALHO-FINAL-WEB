'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useErroDeApi } from '@/hooks/useErroDeApi';

const CAMPOS_VAZIOS = { nome: '', matricula: '', email: '' };

export default function PaginaGerenciarAlunos() {
  const { id: turmaId } = useParams();

  const [turma, setTurma] = useState(null);
  const { erro, setErro, tratarErro } = useErroDeApi();
  const [alunos, setAlunos] = useState([]);
  const [campos, setCampos] = useState(CAMPOS_VAZIOS);
  // Aluno ja cadastrado com a matricula digitada, ou null. Quando preenchido, o
  // nome e o e-mail do formulario passam a ser somente leitura, porque a API
  // reaproveita o registro existente e descarta o que for digitado.
  const [jaCadastrado, setJaCadastrado] = useState(null);
  const [consultando, setConsultando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  // Guarda o id em remocao para desabilitar apenas aquele botao.
  const [removendo, setRemovendo] = useState(null);
  // Id do aluno aguardando confirmacao. Como e um id e nao um booleano, apenas
  // uma linha entra em modo de confirmacao por vez.
  const [confirmando, setConfirmando] = useState(null);

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
  }, [turmaId, tratarErro]);

  function atualizarCampo(nome, valor) {
    setCampos((anteriores) => ({ ...anteriores, [nome]: valor }));
  }

  function limparConsulta() {
    setJaCadastrado(null);
    setCampos(CAMPOS_VAZIOS);
  }

  // Disparada ao sair do campo de matricula, e nao a cada tecla: evita uma
  // requisicao por caractere digitado.
  async function handleVerificarMatricula() {
    const matricula = campos.matricula.trim();

    if (!matricula) {
      setJaCadastrado(null);
      return;
    }

    // Ja consultada: nao repete a requisicao.
    if (jaCadastrado?.matricula === matricula) return;

    setErro(null);
    setConsultando(true);

    try {
      const { existe, aluno } = await api(`/api/alunos?matricula=${encodeURIComponent(matricula)}`);

      if (existe) {
        setJaCadastrado(aluno);
        // Mostra os dados reais que serao usados, em vez de deixar o professor
        // digitar valores que a API vai ignorar.
        setCampos({ nome: aluno.nome, matricula: aluno.matricula, email: aluno.email });
      } else {
        setJaCadastrado(null);
      }
    } catch (e) {
      tratarErro(e);
    } finally {
      setConsultando(false);
    }
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
      limparConsulta();
    } catch (e) {
      tratarErro(e);
    } finally {
      setSalvando(false);
    }
  }

  // Chamada apenas depois da confirmacao: remover matricula por um clique
  // acidental seria destrutivo e nao ha como desfazer pela interface.
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
      setConfirmando(null);
    }
  }

  return (
    <>
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
          <label htmlFor="matricula" className="mb-1 block text-sm font-medium text-gray-700">
            Matrícula
          </label>
          <input
            id="matricula"
            type="text"
            value={campos.matricula}
            onChange={(e) => atualizarCampo('matricula', e.target.value)}
            onBlur={handleVerificarMatricula}
            required
            placeholder="2026001"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <p className="mt-1 text-xs text-gray-500">
            {consultando ? 'Verificando matrícula...' : 'Verificada ao sair do campo.'}
          </p>
        </div>

        <div>
          <label htmlFor="nome" className="mb-1 block text-sm font-medium text-gray-700">
            Nome
          </label>
          <input
            id="nome"
            type="text"
            value={campos.nome}
            onChange={(e) => atualizarCampo('nome', e.target.value)}
            readOnly={!!jaCadastrado}
            required
            placeholder="Maria Silva"
            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
              jaCadastrado ? 'cursor-not-allowed bg-gray-100' : ''
            }`}
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
            readOnly={!!jaCadastrado}
            required
            placeholder="maria@aluno.uepb.edu.br"
            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
              jaCadastrado ? 'cursor-not-allowed bg-gray-100' : ''
            }`}
          />
        </div>
      </div>

      {jaCadastrado && (
        <div
          role="status"
          className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          <p>
            A matrícula <strong>{jaCadastrado.matricula}</strong> já está cadastrada como{' '}
            <strong>{jaCadastrado.nome}</strong>. Ao matricular, este aluno será vinculado a esta
            turma — nome e e-mail permanecem os já registrados.
          </p>
          <button
            type="button"
            onClick={limparConsulta}
            className="mt-2 text-sm font-medium text-amber-900 underline hover:no-underline"
          >
            Limpar e digitar outra matrícula
          </button>
        </div>
      )}

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

              {confirmando === aluno.id ? (
                // Confirmacao em duas etapas, no lugar de um dialogo nativo:
                // mantem o contexto da linha e nao bloqueia a pagina.
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <span className="text-sm text-gray-600">Remover da turma?</span>
                  <button
                    type="button"
                    onClick={() => handleRemover(aluno)}
                    disabled={removendo === aluno.id}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {removendo === aluno.id ? 'Removendo...' : 'Confirmar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmando(null)}
                    disabled={removendo === aluno.id}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmando(aluno.id)}
                  className="self-start rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 sm:self-auto"
                >
                  Remover
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
    </>
  );
}
