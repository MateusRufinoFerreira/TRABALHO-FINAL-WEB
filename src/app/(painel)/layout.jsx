import Sidebar from '@/components/Sidebar';

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
