import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex flex-col w-full flex-1 min-w-0">
        <Header />
        <main className="flex-1 flex flex-col p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
