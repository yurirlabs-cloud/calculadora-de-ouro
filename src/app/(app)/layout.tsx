
'use client';
import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AppHeader from '@/components/AppHeader';
import { Loader2 } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Se o carregamento terminou e não há usuário, redireciona para a autenticação.
    if (!loading && !user) {
      router.replace('/auth');
    }
    
    // Se o usuário está logado e na página raiz da área logada, redireciona para a calculadora.
    if (!loading && user && pathname === '/') {
        router.replace('/calculator');
    }
  }, [user, loading, router, pathname]);

  // Durante o carregamento inicial, exibe um spinner centralizado.
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // Se não há usuário (e não está mais carregando), a tela fica em branco enquanto o redirecionamento acontece.
  if (!user) {
    return null;
  }

  // Se o usuário está logado, exibe o layout da aplicação.
  return (
    <div className="flex flex-col h-screen">
        <AppHeader />
        <main className="flex-grow w-full">
            {children}
        </main>
    </div>
  );
}
