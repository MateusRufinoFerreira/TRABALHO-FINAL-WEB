'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { sair } from '@/lib/api';

const ITENS = [
  { rotulo: 'Visão Geral', href: '/' },
  { rotulo: 'Minhas Turmas', href: '/turmas' },
  { rotulo: 'Banco de Questões', href: '/bancos' },
];

// A raiz exige comparacao exata; as demais casam subrotas.
function estaAtivo(pathname, href) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function handleSair() {
    setSaindo(true);
    await sair();
    router.replace('/login');
  }

  return (
    <aside className="bg-slate-900 p-4 text-white lg:w-64 lg:shrink-0 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 lg:block">
        <Link href="/" className="text-xl font-bold text-blue-500 lg:mb-8 lg:block lg:text-2xl">
          Provius
        </Link>

        <nav className="flex flex-wrap gap-2 lg:mt-0 lg:flex-col lg:space-y-1">
          {ITENS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={estaAtivo(pathname, item.href) ? 'page' : undefined}
              className={`rounded px-3 py-2 text-sm transition lg:px-4 ${
                estaAtivo(pathname, item.href)
                  ? 'bg-blue-600 font-medium'
                  : 'hover:bg-slate-800'
              }`}
            >
              {item.rotulo}
            </Link>
          ))}

          <button
            type="button"
            onClick={handleSair}
            disabled={saindo}
            className="rounded px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50 lg:mt-4 lg:px-4"
          >
            {saindo ? 'Saindo...' : 'Sair'}
          </button>
        </nav>
      </div>
    </aside>
  );
}
