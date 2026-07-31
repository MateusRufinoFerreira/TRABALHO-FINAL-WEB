import Sidebar from '@/components/Sidebar';

// Layout do painel autenticado. O grupo de rotas (painel) nao aparece na URL:
// serve apenas para que estas paginas compartilhem este layout, enquanto /login
// permanece fora dele e continua sem a navegacao.
//
// Concentrar aqui o container e o espacamento elimina a repeticao que existia em
// oito telas.
export default function LayoutPainel({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100 lg:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
