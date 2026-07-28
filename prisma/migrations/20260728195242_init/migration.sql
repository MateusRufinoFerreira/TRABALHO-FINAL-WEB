-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Turma" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "semestre" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    CONSTRAINT "Turma_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Aluno" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BancoQuestao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Questao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "enunciado" TEXT NOT NULL,
    "peso" REAL NOT NULL DEFAULT 1.0,
    "gabarito" TEXT NOT NULL,
    "bancoId" TEXT NOT NULL,
    CONSTRAINT "Questao_bancoId_fkey" FOREIGN KEY ("bancoId") REFERENCES "BancoQuestao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Avaliacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dataInicio" DATETIME NOT NULL,
    "dataTermino" DATETIME NOT NULL,
    "ordemAleatoria" BOOLEAN NOT NULL DEFAULT false,
    "turmaId" TEXT NOT NULL,
    CONSTRAINT "Avaliacao_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AlunoToTurma" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AlunoToTurma_A_fkey" FOREIGN KEY ("A") REFERENCES "Aluno" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AlunoToTurma_B_fkey" FOREIGN KEY ("B") REFERENCES "Turma" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AlunoToAvaliacao" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AlunoToAvaliacao_A_fkey" FOREIGN KEY ("A") REFERENCES "Aluno" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AlunoToAvaliacao_B_fkey" FOREIGN KEY ("B") REFERENCES "Avaliacao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AvaliacaoToQuestao" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AvaliacaoToQuestao_A_fkey" FOREIGN KEY ("A") REFERENCES "Avaliacao" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AvaliacaoToQuestao_B_fkey" FOREIGN KEY ("B") REFERENCES "Questao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_matricula_key" ON "Aluno"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "_AlunoToTurma_AB_unique" ON "_AlunoToTurma"("A", "B");

-- CreateIndex
CREATE INDEX "_AlunoToTurma_B_index" ON "_AlunoToTurma"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AlunoToAvaliacao_AB_unique" ON "_AlunoToAvaliacao"("A", "B");

-- CreateIndex
CREATE INDEX "_AlunoToAvaliacao_B_index" ON "_AlunoToAvaliacao"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AvaliacaoToQuestao_AB_unique" ON "_AvaliacaoToQuestao"("A", "B");

-- CreateIndex
CREATE INDEX "_AvaliacaoToQuestao_B_index" ON "_AvaliacaoToQuestao"("B");
