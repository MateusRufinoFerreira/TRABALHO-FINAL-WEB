import bcrypt from 'bcryptjs';
import { UsuarioModel } from '@/models/usuarioModel';
import { assinarToken } from '@/lib/jwt';
import { ERRO, falha, sucesso } from '@/lib/resultado';

// CAMADA DE REGRAS DE NEGOCIO

// Mensagem unica para e-mail inexistente e senha errada. Responder "usuario nao
// encontrado" permitiria descobrir quais e-mails estao cadastrados testando um
// por um (enumeracao de usuarios).
const CREDENCIAIS_INVALIDAS = 'E-mail ou senha incorretos.';

// Hash descartavel usado quando o e-mail nao existe. Sem ele, o login de um
// e-mail inexistente responderia sem executar o bcrypt e seria mensuravelmente
// mais rapido, revelando quais e-mails existem (ataque por tempo de resposta).
const HASH_DESCARTAVEL = bcrypt.hashSync('nenhuma_senha_corresponde', 10);

function textoPreenchido(valor) {
  return typeof valor === 'string' && valor.trim() !== '';
}

// E-mail e case-insensitive na pratica. Normalizar na entrada evita que o mesmo
// professor seja tratado como dois usuarios distintos.
function normalizarEmail(email) {
  return email.trim().toLowerCase();
}

export const AuthController = {
  async autenticar(dados) {
    const { email, senha } = dados ?? {};

    if (!textoPreenchido(email) || !textoPreenchido(senha)) {
      return falha(ERRO.VALIDACAO, 'Informe e-mail e senha.');
    }

    try {
      const usuario = await UsuarioModel.buscarPorEmail(normalizarEmail(email));

      // A comparacao acontece sempre, exista o usuario ou nao.
      const senhaCorreta = await bcrypt.compare(senha, usuario?.senha ?? HASH_DESCARTAVEL);

      if (!usuario || !senhaCorreta) {
        return falha(ERRO.NAO_AUTORIZADO, CREDENCIAIS_INVALIDAS);
      }

      const token = assinarToken({ sub: usuario.id, email: usuario.email });

      // A senha (mesmo com hash) nunca sai da API.
      return sucesso({
        token,
        usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
      });
    } catch (erro) {
      console.error('[autenticar]', erro);
      return falha(ERRO.INTERNO, 'Erro ao realizar o login.');
    }
  },
};
