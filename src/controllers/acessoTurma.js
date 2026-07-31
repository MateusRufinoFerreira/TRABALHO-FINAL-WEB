import { TurmaModel } from '@/models/turmaModel';
import { ERRO, falha, sucesso } from '@/lib/resultado';

export async function garantirTurmaDoProfessor(professorId, turmaId) {
  if (typeof turmaId !== 'string' || turmaId.trim() === '') {
    return falha(ERRO.VALIDACAO, 'O id da turma e obrigatorio.');
  }

  const turma = await TurmaModel.buscarPorId(turmaId);

  // Inexistente e alheia respondem igual, para nao revelar quais ids existem.
  if (!turma || turma.usuarioId !== professorId) {
    return falha(ERRO.NAO_ENCONTRADO, 'Turma nao encontrada.');
  }

  return sucesso(turma);
}
