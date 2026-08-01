-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Turma" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "semestre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "Turma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aluno" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Aluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BancoQuestao" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BancoQuestao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Questao" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "enunciado" TEXT NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "gabarito" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bancoId" TEXT NOT NULL,

    CONSTRAINT "Questao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avaliacao" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataTermino" TIMESTAMP(3) NOT NULL,
    "ordemAleatoria" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "turmaId" TEXT NOT NULL,

    CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AlunoToTurma" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AlunoToTurma_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AlunoToAvaliacao" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AlunoToAvaliacao_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AvaliacaoToQuestao" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AvaliacaoToQuestao_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_matricula_key" ON "Aluno"("matricula");

-- CreateIndex
CREATE INDEX "_AlunoToTurma_B_index" ON "_AlunoToTurma"("B");

-- CreateIndex
CREATE INDEX "_AlunoToAvaliacao_B_index" ON "_AlunoToAvaliacao"("B");

-- CreateIndex
CREATE INDEX "_AvaliacaoToQuestao_B_index" ON "_AvaliacaoToQuestao"("B");

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questao" ADD CONSTRAINT "Questao_bancoId_fkey" FOREIGN KEY ("bancoId") REFERENCES "BancoQuestao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlunoToTurma" ADD CONSTRAINT "_AlunoToTurma_A_fkey" FOREIGN KEY ("A") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlunoToTurma" ADD CONSTRAINT "_AlunoToTurma_B_fkey" FOREIGN KEY ("B") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlunoToAvaliacao" ADD CONSTRAINT "_AlunoToAvaliacao_A_fkey" FOREIGN KEY ("A") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlunoToAvaliacao" ADD CONSTRAINT "_AlunoToAvaliacao_B_fkey" FOREIGN KEY ("B") REFERENCES "Avaliacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AvaliacaoToQuestao" ADD CONSTRAINT "_AvaliacaoToQuestao_A_fkey" FOREIGN KEY ("A") REFERENCES "Avaliacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AvaliacaoToQuestao" ADD CONSTRAINT "_AvaliacaoToQuestao_B_fkey" FOREIGN KEY ("B") REFERENCES "Questao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
