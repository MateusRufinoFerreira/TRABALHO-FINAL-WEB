import { TurmaModel } from '@/models/turmaModel';
import { ERRO, falha, sucesso } from '@/lib/resultado';

// Regra de acesso compartilhada entre os controllers que operam no contexto de
// uma turma (alunos, avaliacoes).
//
// Toda operacao sobre dados de uma turma precisa confirmar que a turma pertence
// ao professor autenticado. O proxy garante apenas que existe um token valido:
// nao diz nada sobre a quem pertence o recurso acessado.
export async function garantirTurmaDoProfessor(professorId, turmaId) {
  if (typeof turmaId !== 'string' || turmaId.trim() === '') {
    return falha(ERRO.VALIDACAO, 'O id da turma e obrigatorio.');
  }

  const turma = await TurmaModel.buscarPorId(turmaId);

  // Turma inexistente e turma de outro professor devolvem a MESMA resposta.
  // Diferenciar as duas permitiria descobrir quais ids existem varrendo valores.
  if (!turma || turma.usuarioId !== professorId) {
    return falha(ERRO.NAO_ENCONTRADO, 'Turma nao encontrada.');
  }

  return sucesso(turma);
}
