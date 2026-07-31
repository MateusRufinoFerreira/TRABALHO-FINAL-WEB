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

// Custo do bcrypt. Cada incremento dobra o tempo de calculo, encarecendo ataques
// de forca bruta sem impacto perceptivel num login legitimo.
const CUSTO_BCRYPT = 10;

const SENHA_MINIMA = 6;

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Codigo do Prisma para violacao de restricao unica.
const VIOLACAO_UNICIDADE = 'P2002';

function textoPreenchido(valor) {
  return typeof valor === 'string' && valor.trim() !== '';
}

// E-mail e case-insensitive na pratica. Normalizar na entrada evita que o mesmo
// professor seja tratado como dois usuarios distintos.
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

    // A senha nao passa por trim: espaco no inicio ou fim e caractere valido, e
    // remover silenciosamente impediria o professor de entrar depois.
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

      // Autentica em seguida: obrigar um login manual logo apos o cadastro seria
      // um passo sem proposito, ja que as credenciais acabaram de ser definidas.
      const token = assinarToken({ sub: usuario.id, email: usuario.email });

      return sucesso({ token, usuario });
    } catch (erro) {
      // O e-mail e unico no schema. Deixar a restricao do banco decidir evita a
      // condicao de corrida de "consultar antes, inserir depois", em que dois
      // cadastros simultaneos passariam pela consulta e um falharia na insercao.
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
