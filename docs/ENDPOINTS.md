# Contrato da API

Endpoints REST da Plataforma de Gerenciamento de Avaliações (Provius).

- **Base:** `http://localhost:3000`
- **Formato:** JSON em requisições e respostas
- **Autenticação:** JWT no cabeçalho `Authorization: Bearer <token>`

A coluna **Status** indica o que já existe no repositório e o que será entregue —
a referência das features (F01…F23) é o `PLANO-DE-FEATURES.md`.

---

## Convenções

### Códigos de status

| Código | Uso |
|---|---|
| `200 OK` | leitura ou atualização bem-sucedida |
| `201 Created` | recurso criado |
| `400 Bad Request` | dados inválidos ou campo obrigatório ausente |
| `401 Unauthorized` | token ausente, inválido ou expirado; credenciais incorretas |
| `404 Not Found` | recurso inexistente |
| `409 Conflict` | violação de unicidade (ex.: matrícula já cadastrada) |
| `500 Internal Server Error` | erro inesperado no servidor |

### Formato de erro

Toda resposta de erro segue o mesmo formato:

```json
{ "erro": "Descrição legível do problema" }
```

### Arquitetura das rotas

As rotas são **finas**: recebem a requisição, delegam ao *controller* e devolvem
`NextResponse` com o status adequado. Nenhuma regra de negócio ou chamada ao
Prisma vive no arquivo `route.js`.

```
route.js  ->  controller  ->  model  ->  Prisma  ->  PostgreSQL
(HTTP)        (validação)     (dados)
```

---

## Autenticação

| Método | Rota | Protegida | Descrição | Status |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | não | autentica e devolve o token JWT | existe · ajuste na **F03** |

### `POST /api/auth/login`

**Requisição**

```json
{ "email": "professor@uepb.edu.br", "senha": "senha123" }
```

**Resposta `200`**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": { "id": "uuid", "nome": "Professor", "email": "professor@uepb.edu.br" }
}
```

**Erros:** `400` campos ausentes · `401` e-mail não encontrado ou senha incorreta · `500`

> O token é devolvido **no corpo** para que o front-end possa guardá-lo e enviá-lo
> no cabeçalho `Authorization`. Um cookie `httpOnly` não serviria para isso, já que
> o JavaScript não consegue lê-lo.

---

## Dashboard

| Método | Rota | Protegida | Descrição | Status |
|---|---|---|---|---|
| `GET` | `/api/dashboard` | sim | estatísticas da visão geral | **F20** |

### `GET /api/dashboard`

**Resposta `200`**

```json
{
  "alunosAtivos": 17,
  "avaliacoesCriadas": 2,
  "turmasRecentes": [
    { "id": "uuid", "nome": "Laboratório de Programação I", "codigo": "LPI", "semestre": "2026.1" }
  ]
}
```

`alunosAtivos` é a contagem de alunos distintos somando todas as turmas do
professor. `turmasRecentes` usa `createdAt` para ordenar por recência.

---

## Turmas

| Método | Rota | Protegida | Descrição | Status |
|---|---|---|---|---|
| `GET` | `/api/turmas` | sim | lista as turmas do professor logado | **F06** |
| `POST` | `/api/turmas` | sim | cria uma turma | **F06** |
| `GET` | `/api/turmas/[id]` | sim | turma específica com suas avaliações | **F06** |

### `POST /api/turmas`

**Requisição**

```json
{ "nome": "Laboratório de Programação I", "codigo": "LPI", "semestre": "2026.1" }
```

**Resposta `201`** — a turma criada. O `usuarioId` **não** vem no corpo: é extraído
do token, para que ninguém crie turma no nome de outro professor.

**Erros:** `400` campo obrigatório ausente · `401` · `500`

### `GET /api/turmas/[id]`

**Resposta `200`** — a turma com suas avaliações e a contagem de alunos.

**Erros:** `401` · `404` turma inexistente · `500`

---

## Alunos

| Método | Rota | Protegida | Descrição | Status |
|---|---|---|---|---|
| `GET` | `/api/turmas/[id]/alunos` | sim | lista os alunos da turma | **F09** |
| `POST` | `/api/turmas/[id]/alunos` | sim | matricula um aluno na turma | **F09** |
| `DELETE` | `/api/turmas/[id]/alunos/[alunoId]` | sim | remove o aluno da turma | **F09** |

As rotas são aninhadas em `turmas` porque um aluno só é gerenciado no contexto de
uma turma.

### `POST /api/turmas/[id]/alunos`

**Requisição**

```json
{ "nome": "Maria Silva", "matricula": "2026001", "email": "maria@aluno.uepb.edu.br" }
```

**Resposta `201`** — o aluno matriculado.

Como `matricula` é única globalmente, um aluno já cadastrado em outra turma é
**vinculado**, não duplicado (`connectOrCreate`).

**Erros:** `400` campo ausente · `401` · `404` turma inexistente · `409` matrícula já nesta turma · `500`

### `DELETE /api/turmas/[id]/alunos/[alunoId]`

Remove apenas o **vínculo** com a turma (`disconnect`); o registro do aluno é
preservado, pois ele pode estar matriculado em outras turmas.

**Resposta `200`** · **Erros:** `401` · `404` · `500`

---

## Bancos de Questões

| Método | Rota | Protegida | Descrição | Status |
|---|---|---|---|---|
| `GET` | `/api/bancos` | sim | lista os bancos com a contagem de questões | **F12** |
| `POST` | `/api/bancos` | sim | cria um banco | **F12** |
| `GET` | `/api/bancos/[id]` | sim | banco específico com suas questões | **F12** |

### `POST /api/bancos`

**Requisição**

```json
{ "titulo": "Estruturas de Dados" }
```

**Resposta `201`** · **Erros:** `400` título vazio · `401` · `500`

---

## Questões

| Método | Rota | Protegida | Descrição | Status |
|---|---|---|---|---|
| `GET` | `/api/questoes` | sim | lista questões (filtro opcional `?bancoId=`) | **F14** |
| `POST` | `/api/questoes` | sim | cria uma questão em um banco | **F14** |

### `POST /api/questoes`

**Requisição**

```json
{
  "bancoId": "uuid",
  "tipo": "MULTIPLA_ESCOLHA",
  "enunciado": "Qual a complexidade da busca binária?",
  "peso": 1.5,
  "gabarito": "O(log n)"
}
```

**Resposta `201`** · **Erros:** `400` tipo inválido ou campo ausente · `401` · `404` banco inexistente · `500`

Validações: `tipo` ∈ {`DISCURSIVA`, `MULTIPLA_ESCOLHA`} e `peso` numérico positivo.

---

## Avaliações

| Método | Rota | Protegida | Descrição | Status |
|---|---|---|---|---|
| `GET` | `/api/avaliacoes` | sim | lista avaliações (filtro opcional `?turmaId=`) | **F16** |
| `POST` | `/api/avaliacoes` | sim | cria e agenda uma avaliação | existe · refatorada na **F02** |
| `GET` | `/api/avaliacoes/[id]` | sim | avaliação com participantes e questões | **F16** |

### `POST /api/avaliacoes`

**Requisição**

```json
{
  "titulo": "Prova 1 - Estruturas de Dados",
  "tipo": "PROVA",
  "dataInicio": "2026-08-10T14:00:00.000Z",
  "dataTermino": "2026-08-10T16:00:00.000Z",
  "ordemAleatoria": true,
  "turmaId": "uuid",
  "alunoIds": ["uuid", "uuid"],
  "questaoIds": ["uuid", "uuid", "uuid"]
}
```

**Resposta `201`** — a avaliação criada, com as questões incluídas.

**Erros:** `400` datas inválidas ou término anterior ao início · `401` · `404` turma inexistente · `500`

### `GET /api/avaliacoes/[id]`

Devolve a avaliação com participantes e questões. Quando `ordemAleatoria` é
`true`, as questões vêm **embaralhadas pelo backend**; quando `false`, na ordem de
criação (ver a justificativa em [`MER.md`](./MER.md#implicação-de-projeto-ordem-das-questões)).

**Erros:** `401` · `404` · `500`

---

## Resumo

| # | Método | Rota | Feature |
|---|---|---|---|
| 1 | `POST` | `/api/auth/login` | F03 |
| 2 | `GET` | `/api/dashboard` | F20 |
| 3 | `GET` | `/api/turmas` | F06 |
| 4 | `POST` | `/api/turmas` | F06 |
| 5 | `GET` | `/api/turmas/[id]` | F06 |
| 6 | `GET` | `/api/turmas/[id]/alunos` | F09 |
| 7 | `POST` | `/api/turmas/[id]/alunos` | F09 |
| 8 | `DELETE` | `/api/turmas/[id]/alunos/[alunoId]` | F09 |
| 9 | `GET` | `/api/bancos` | F12 |
| 10 | `POST` | `/api/bancos` | F12 |
| 11 | `GET` | `/api/bancos/[id]` | F12 |
| 12 | `GET` | `/api/questoes` | F14 |
| 13 | `POST` | `/api/questoes` | F14 |
| 14 | `GET` | `/api/avaliacoes` | F16 |
| 15 | `POST` | `/api/avaliacoes` | F02 |
| 16 | `GET` | `/api/avaliacoes/[id]` | F16 |

**16 endpoints**, dos quais 2 já existem no repositório (login e criação de
avaliação) e serão refatorados para a arquitetura em camadas.
