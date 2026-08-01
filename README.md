# Provius

Plataforma web para professores universitários gerenciarem turmas, alunos, bancos
de questões e avaliações (provas e listas de exercícios). Trabalho final da
disciplina de Programação Web — UEPB.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Interface | React 19.2 + Tailwind CSS v4 |
| Banco de dados | PostgreSQL 17 |
| ORM | Prisma 7.9 + `@prisma/adapter-pg` |
| Autenticação | JWT (`jsonwebtoken`) + `bcryptjs` |
| Runtime | Node.js 22 |

Arquitetura em camadas: `src/app/api/**/route.js` (HTTP) → `src/controllers/`
(validação e regras de negócio) → `src/models/` (Prisma). Detalhes das decisões
técnicas e divergências em relação ao enunciado estão documentados em
[`docs/MER.md`](docs/MER.md) e [`docs/ENDPOINTS.md`](docs/ENDPOINTS.md).

## Como rodar

### Opção 1 — Docker Compose (recomendado)

Sobe o banco, aplica as migrations, roda o seed e inicia a aplicação — sem precisar
instalar Node ou Postgres localmente.

```bash
docker compose up --build
```

Acesse `http://localhost:3000`. Credenciais do professor de teste (seed):

- **E-mail:** `thiago@uepb.edu.br`
- **Senha:** `thiago123`

Esses valores (e a `JWT_SECRET`/senha do banco) têm fallback padrão em
`docker-compose.yml` só para facilitar a avaliação local; personalize-os criando um
`.env` na raiz (ver `.env.example`) antes de subir o compose.

Para derrubar tudo: `docker compose down` (adicione `-v` para apagar os dados).

### Opção 2 — Local, sem Docker

Requer Node.js ≥ 20.19 e um PostgreSQL acessível.

```bash
cp .env.example .env        # ajuste DATABASE_URL e JWT_SECRET
npm install                 # roda "prisma generate" no postinstall
npm run db:migrate          # aplica as migrations
npm run seed                # cria o professor de teste
npm run dev
```

## Scripts

| Comando | Faz |
|---|---|
| `npm run dev` | sobe o servidor de desenvolvimento |
| `npm run build` / `npm run start` | build e execução em produção |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:studio` | abre o Prisma Studio |
| `npm run seed` | popula o professor inicial (`prisma/seed.js`) |

## Estrutura

```
src/
  app/
    (painel)/        páginas autenticadas (dashboard, turmas, bancos)
    login/, cadastro/ páginas públicas
    api/              rotas HTTP finas (sem regra de negócio nem Prisma)
  controllers/        validação e regras de negócio
  models/             acesso a dados via Prisma
  lib/                jwt, sessão, cliente de API, helpers HTTP
  components/         Sidebar, saudação etc.
  proxy.js            middleware de autenticação (JWT via header e cookie)
prisma/
  schema.prisma        modelo de dados
  migrations/           histórico de migrations
  seed.js                seed do professor de teste
docs/
  MER.md                modelo entidade-relacionamento e decisões de modelagem
  ENDPOINTS.md           contrato completo da API
```

## Funcionalidades

- Autenticação por JWT (cadastro e login de professores), com proteção de rotas de
  API e de páginas via `src/proxy.js`.
- Gerenciamento de turmas e matrícula de alunos (matrícula única globalmente).
- Bancos de questões reaproveitáveis entre avaliações (discursivas e múltipla
  escolha).
- Criação de avaliações (provas/listas) com seleção de participantes, montagem de
  questões e ordem fixa ou aleatória (embaralhamento Fisher-Yates no backend).
- Dashboard com indicadores em tempo real (alunos ativos, avaliações, turmas
  recentes).
