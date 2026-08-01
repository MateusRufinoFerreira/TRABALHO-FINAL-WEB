'use client';

import { useEffect, useState } from 'react';
import { obterUsuario } from '@/lib/sessao';

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
