'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState({ alunosAtivos: 17, avaliacoesCriadas: 2 });
  const [turmas, setTurmas] = useState([
    { id: '1', nome: 'Laboratório de Programação I', codigo: 'LPI', semestre: '2026.1' },
    { id: '2', nome: 'Linguagem de Programação I', codigo: 'LP1', semestre: '2026.1' }
  ]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white p-6">
        <h1 className="text-2xl font-bold text-blue-500 mb-8">Provius</h1>
        <nav className="space-y-4">
          <a href="#" className="block py-2 px-4 bg-blue-600 rounded">Visão Geral</a>
          <a href="#" className="block py-2 px-4 hover:bg-slate-800 rounded">Minhas Turmas</a>
          <a href="#" className="block py-2 px-4 hover:bg-slate-800 rounded">Banco de Questões</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Seu Painel de Controle</h2>
          <p className="text-gray-600">Visão geral do semestre e atalhos rápidos.</p>
        </header>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-600 text-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium">Alunos Ativos</h3>
            <p className="text-4xl font-bold mt-2">{stats.alunosAtivos}</p>
            <span className="text-sm opacity-80">Em todas as turmas</span>
          </div>

          <div className="bg-purple-600 text-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium">Avaliações Criadas</h3>
            <p className="text-4xl font-bold mt-2">{stats.avaliacoesCriadas}</p>
            <span className="text-sm opacity-80">Provas e listas propostas</span>
          </div>
        </div>

        {/* Turmas Recentes */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Turmas Recentes</h3>
          <div className="space-y-4">
            {turmas.map((turma) => (
              <div key={turma.id} className="p-4 border rounded-md flex justify-between items-center hover:bg-gray-50">
                <div>
                  <h4 className="font-semibold text-gray-800">{turma.nome}</h4>
                  <p className="text-sm text-gray-500">{turma.codigo} • {turma.semestre}</p>
                </div>
                <a href="#" className="text-blue-600 hover:underline text-sm font-medium">
                  Acessar Turma →
                </a>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}