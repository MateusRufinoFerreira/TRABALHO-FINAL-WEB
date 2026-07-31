import { AlunoModel } from '@/models/alunoModel';
import { garantirTurmaDoProfessor } from '@/controllers/acessoTurma';
import { ERRO, falha, sucesso } from '@/lib/resultado';

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function textoPreenchido(valor) {
  return typeof valor === 'string' && valor.trim() !== '';
}

export const AlunoController = {
  async consultarMatricula(matricula) {
    if (!textoPreenchido(matricula)) {
      return falha(ERRO.VALIDACAO, 'Informe a matricula a consultar.');
    }

    try {
      const aluno = await AlunoModel.buscarPorMatricula(matricula.trim());

      // Nao encontrar nao e erro: e a resposta esperada para uma matricula nova.
      if (!aluno) return sucesso({ existe: false });

      return sucesso({
        existe: true,
        aluno: { nome: aluno.nome, matricula: aluno.matricula, email: aluno.email },
      });
    } catch (erro) {
      console.error('[consultarMatricula]', erro);
      return falha(ERRO.INTERNO, 'Erro ao consultar a matricula.');
    }
  },

  async listarAlunosDaTurma(professorId, turmaId) {
    try {
      const acesso = await garantirTurmaDoProfessor(professorId, turmaId);
      if (!acesso.ok) return acesso;

      return sucesso(await AlunoModel.listarPorTurma(turmaId));
    } catch (erro) {
      console.error('[listarAlunosDaTurma]', erro);
      return falha(ERRO.INTERNO, 'Erro ao listar os alunos da turma.');
    }
  },

  async matricularAluno(professorId, turmaId, dados) {
    const { nome, matricula, email } = dados ?? {};

    if (!textoPreenchido(nome)) {
      return falha(ERRO.VALIDACAO, 'O campo "nome" e obrigatorio.');
    }

    if (!textoPreenchido(matricula)) {
      return falha(ERRO.VALIDACAO, 'O campo "matricula" e obrigatorio.');
    }

    if (!textoPreenchido(email) || !FORMATO_EMAIL.test(email.trim())) {
      return falha(ERRO.VALIDACAO, 'O campo "email" deve ser um e-mail valido.');
    }

    try {
      const acesso = await garantirTurmaDoProfessor(professorId, turmaId);
      if (!acesso.ok) return acesso;

      const matriculaNormalizada = matricula.trim();

      const existente = await AlunoModel.buscarPorMatricula(matriculaNormalizada);

      if (existente && (await AlunoModel.estaNaTurma(turmaId, existente.id))) {
        return falha(ERRO.CONFLITO, 'Este aluno ja esta matriculado nesta turma.');
      }

      const aluno = await AlunoModel.matricularNaTurma(turmaId, {
        nome: nome.trim(),
        matricula: matriculaNormalizada,
        email: email.trim().toLowerCase(),
      });

      return sucesso(aluno);
    } catch (erro) {
      console.error('[matricularAluno]', erro);
      return falha(ERRO.INTERNO, 'Erro ao matricular o aluno.');
    }
  },

  async removerAlunoDaTurma(professorId, turmaId, alunoId) {
    if (!textoPreenchido(alunoId)) {
      return falha(ERRO.VALIDACAO, 'O id do aluno e obrigatorio.');
    }

    try {
      const acesso = await garantirTurmaDoProfessor(professorId, turmaId);
      if (!acesso.ok) return acesso;

      if (!(await AlunoModel.estaNaTurma(turmaId, alunoId))) {
        return falha(ERRO.NAO_ENCONTRADO, 'Aluno nao encontrado nesta turma.');
      }

      await AlunoModel.desvincularDaTurma(turmaId, alunoId);

      return sucesso({ mensagem: 'Aluno removido da turma.' });
    } catch (erro) {
      console.error('[removerAlunoDaTurma]', erro);
      return falha(ERRO.INTERNO, 'Erro ao remover o aluno da turma.');
    }
  },
};
