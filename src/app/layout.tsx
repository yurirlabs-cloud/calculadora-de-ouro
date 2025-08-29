
import './globals.css';
import { AuthProvider } from '@/hooks/use-auth';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import AppHeader from '@/components/AppHeader';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Calculadora de Ouro - Precisão e Confiança para seu Negócio',
  description: 'Calcule o valor real do ouro e da prata em segundos com cotações em tempo real. A ferramenta definitiva para joalheiros e compradores de metais preciosos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={cn("h-full bg-background font-sans antialiased", inter.variable)}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

    