// Cadastra o professor inicial, sem o qual nao ha como fazer login.
//
//   npx prisma db seed
//
// Roda como processo Node independente do Next.js, por isso carrega o .env por
// conta propria e monta seu proprio PrismaClient: o alias "@/" e o singleton de
// src/lib/prisma.js sao resolvidos pelo Next, nao pelo Node.
//
// E idempotente (upsert): rodar mais de uma vez atualiza o registro em vez de
// falhar por e-mail duplicado.

require('dotenv/config');

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const NOME = process.env.SEED_PROFESSOR_NOME || 'Professor Thiago';
const EMAIL = (process.env.SEED_PROFESSOR_EMAIL || 'thiago@uepb.edu.br').toLowerCase();
const SENHA = process.env.SEED_PROFESSOR_SENHA || 'thiago123';

// Custo do bcrypt. Cada incremento dobra o tempo de calculo, o que encarece
// ataques de forca bruta sem impacto perceptivel num login legitimo.
const CUSTO_BCRYPT = 10;

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  // A senha nunca e gravada em texto puro.
  const senhaHash = await bcrypt.hash(SENHA, CUSTO_BCRYPT);

  const professor = await prisma.usuario.upsert({
    where: { email: EMAIL },
    update: { nome: NOME, senha: senhaHash },
    create: { nome: NOME, email: EMAIL, senha: senhaHash },
  });

  console.log('Professor disponivel para login:');
  console.log(`  id:    ${professor.id}`);
  console.log(`  email: ${professor.email}`);
  console.log(`  senha: ${SENHA}`);

  await prisma.$disconnect();
}

main().catch(async (erro) => {
  console.error('Falha ao executar o seed:', erro.message);
  process.exit(1);
});
