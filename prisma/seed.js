require('dotenv/config');

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const NOME = process.env.SEED_PROFESSOR_NOME || 'Thiago';
const EMAIL = (process.env.SEED_PROFESSOR_EMAIL || 'thiago@uepb.edu.br').toLowerCase();
const SENHA = process.env.SEED_PROFESSOR_SENHA || 'thiago123';

// Cada incremento dobra o custo de calcular o hash.
const CUSTO_BCRYPT = 10;

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

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
