import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// O Prisma 7 exige um driver adapter para provedores SQL: `new PrismaClient()`
// sem adapter lanca erro.
function criarPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

// Instancia unica por processo. Sem o cache no globalThis, o hot reload do
// `next dev` abriria um novo pool de conexoes a cada alteracao de arquivo.
const globalParaPrisma = globalThis;

export const prisma = globalParaPrisma.prismaGlobal ?? criarPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalParaPrisma.prismaGlobal = prisma;
}
