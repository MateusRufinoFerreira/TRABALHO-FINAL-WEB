import bcrypt from 'bcryptjs';
import { UsuarioModel } from '@/models/usuarioModel';
import { assinarToken } from '@/lib/jwt';
import { ERRO, falha, sucesso } from '@/lib/resultado';

const CREDENCIAIS_INVALIDAS = 'E-mail ou senha incorretos.';

const HASH_DESCARTAVEL = bcrypt.hashSync('nenhuma_senha_corresponde', 10);

// Cada incremento dobra o custo de calcular o hash.
const CUSTO_BCRYPT = 10;

const SENHA_MINIMA = 6;

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Prisma: violacao de restricao unica.
const VIOLACAO_UNICIDADE = 'P2002';

function textoPreenchido(valor) {
  return typeof valor === 'string' && valor.trim() !== '';
}

// Sem normalizar, o mesmo e-mail em caixas diferentes viraria dois usuarios.
function normalizarEmail(email) {
  return email.trim().toLowerCase();
}

export const AuthController = {
  async cadastrar(dados) {
    const { nome, email, senha } = dados ?? {};

    if (!textoPreenchido(nome)) {
      return falha(ERRO.VALIDACAO, 'O campo "nome" e obrigatorio.');
    }

    if (!textoPreenchido(email) || !FORMATO_EMAIL.test(email.trim())) {
      return falha(ERRO.VALIDACAO, 'Informe um e-mail valido.');
    }

    // Sem trim: espaco e caractere valido numa senha.
    if (typeof senha !== 'string' || senha.length < SENHA_MINIMA) {
      return falha(ERRO.VALIDACAO, `A senha deve ter ao menos ${SENHA_MINIMA} caracteres.`);
    }

    try {
      const senhaHash = await bcrypt.hash(senha, CUSTO_BCRYPT);

      const usuario = await UsuarioModel.criar({
        nome: nome.trim(),
        email: normalizarEmail(email),
        senha: senhaHash,
      });

      const token = assinarToken({ sub: usuario.id, email: usuario.email });

      return sucesso({ token, usuario });
    } catch (erro) {
      if (erro?.code === VIOLACAO_UNICIDADE) {
        return falha(ERRO.CONFLITO, 'Este e-mail ja esta cadastrado.');
      }

      console.error('[cadastrar]', erro);
      return falha(ERRO.INTERNO, 'Erro ao criar a conta.');
    }
  },

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
