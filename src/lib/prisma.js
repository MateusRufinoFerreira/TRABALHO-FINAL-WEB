import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// O Prisma 7 exige driver adapter: new PrismaClient() sem adapter lanca erro.
function criarPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

// Instancia unica por processo: o hot reload abriria um pool novo a cada recarga.
const globalParaPrisma = globalThis;

export const prisma = globalParaPrisma.prismaGlobal ?? criarPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalParaPrisma.prismaGlobal = prisma;
}
