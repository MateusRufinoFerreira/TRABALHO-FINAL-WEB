'use client';

import { useEffect, useState } from 'react';
import { obterUsuario } from '@/lib/sessao';

// Saudacao exibida no topo das telas principais.
//
// O nome vem do localStorage, gravado no login. A leitura acontece dentro do
// useEffect, e nao durante a renderizacao: no servidor o localStorage nao existe,
// e ler direto faria o HTML gerado no servidor divergir do gerado no cliente —
// divergencia de hidratacao que o React acusa no console.
//
// Enquanto o nome nao chega, a linha de cima ja aparece e a de baixo reserva a
// altura, para o conteudo seguinte nao pular quando o nome for preenchido.
export default function SaudacaoProfessor() {
  const [nome, setNome] = useState(null);

  useEffect(() => {
    setNome(obterUsuario()?.nome ?? null);
  }, []);

  return (
    <header className="mb-6 border-b border-gray-200 pb-4">
      <p className="text-sm text-gray-600">Olá, professor</p>
      <p className="min-h-8 text-2xl font-bold tracking-tight text-blue-700">{nome}</p>
    </header>
  );
}
