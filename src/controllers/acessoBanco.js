import { BancoModel } from '@/models/bancoModel';
import { ERRO, falha, sucesso } from '@/lib/resultado';

export async function garantirBancoDoProfessor(professorId, bancoId) {
  if (typeof bancoId !== 'string' || bancoId.trim() === '') {
    return falha(ERRO.VALIDACAO, 'O id do banco e obrigatorio.');
  }

  const banco = await BancoModel.buscarPorId(bancoId);

  if (!banco || banco.usuarioId !== professorId) {
    return falha(ERRO.NAO_ENCONTRADO, 'Banco de questoes nao encontrado.');
  }

  return sucesso(banco);
}
