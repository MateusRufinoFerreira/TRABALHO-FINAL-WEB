import { BancoModel } from '@/models/bancoModel';
import { ERRO, falha, sucesso } from '@/lib/resultado';

// Regra de acesso compartilhada pelos controllers que operam sobre bancos de
// questoes (bancos e questoes). Equivalente ao acessoTurma.js.
export async function garantirBancoDoProfessor(professorId, bancoId) {
  if (typeof bancoId !== 'string' || bancoId.trim() === '') {
    return falha(ERRO.VALIDACAO, 'O id do banco e obrigatorio.');
  }

  const banco = await BancoModel.buscarPorId(bancoId);

  // Banco inexistente e banco de outro professor devolvem a MESMA resposta,
  // para nao revelar quais ids existem.
  if (!banco || banco.usuarioId !== professorId) {
    return falha(ERRO.NAO_ENCONTRADO, 'Banco de questoes nao encontrado.');
  }

  return sucesso(banco);
}
