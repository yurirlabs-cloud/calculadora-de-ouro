'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, UserData } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { Logo } from './Logo';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, User, Shield, LogOut, Calculator, Home } from 'lucide-react';
import { Separator } from './ui/separator';

const TRIAL_LIMIT = 5;

const UserAvatar = ({ userData }: { userData: UserData | null }) => {
    const getInitials = () => {
        if (!userData || !userData.email) return '?';
        const email = userData.email;
        return email[0].toUpperCase();
    };

    return (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-sm">
            {getInitials()}
        </div>
    );
};

const PlanBadge = ({ userData, loading }: { userData: UserData | null; loading: boolean }) => {
    if (loading) {
        return <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />;
    }

    if (!userData) {
        return <Badge variant="secondary">Trial (0/{TRIAL_LIMIT})</Badge>;
    }

    if (userData.plan === 'pro') {
        return <Badge className="bg-amber-500 text-black hover:bg-amber-600">Pro</Badge>;
    }

    const used = userData.used_count ?? 0;
    return <Badge variant="secondary">Trial ({used}/{TRIAL_LIMIT})</Badge>;
};


const DesktopNav = ({ userData, loading }: { userData: UserData | null, loading: boolean }) => (
    <div className="hidden sm:flex items-center gap-4">
        <Link href="/calculator">
            <Button variant="ghost" size="sm">
                <Calculator className="mr-2 h-4 w-4" /> Calculadora
            </Button>
        </Link>
        <PlanBadge userData={userData} loading={loading} />
        {userData?.role === 'admin' && (
            <Link href="/admin">
                <Button variant="ghost" size="sm">
                    <Shield className="mr-2 h-4 w-4" /> Admin
                </Button>
            </Link>
        )}
        <div className="flex items-center gap-2">
            <UserAvatar userData={userData} />
            <span className="text-sm text-muted-foreground">{userData?.email ?? '...'}</span>
        </div>
        <Button onClick={() => auth.signOut()} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
    </div>
);

const MobileNav = ({ userData, loading }: { userData: UserData | null, loading: boolean }) => (
    <div className="sm:hidden">
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Abrir menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent>
                <div className="flex flex-col h-full">
                    <div className="p-4 space-y-2">
                        <UserAvatar userData={userData} />
                        <p className="font-semibold text-foreground">{userData?.email ?? 'Carregando...'}</p>
                        <PlanBadge userData={userData} loading={loading} />
                    </div>
                    <Separator />
                    <nav className="flex flex-col gap-2 p-4">
                         <SheetClose asChild>
                            <Link href="/" className="flex items-center gap-2 p-2 rounded-md hover:bg-accent">
                                <Home className="h-5 w-5 text-muted-foreground" />
                                <span>Landing Page</span>
                            </Link>
                        </SheetClose>
                         <SheetClose asChild>
                            <Link href="/calculator" className="flex items-center gap-2 p-2 rounded-md hover:bg-accent">
                                <Calculator className="h-5 w-5 text-muted-foreground" />
                                <span>Calculadora</span>
                            </Link>
                        </SheetClose>
                         {userData?.role === 'admin' && (
                            <SheetClose asChild>
                                <Link href="/admin" className="flex items-center gap-2 p-2 rounded-md hover:bg-accent">
                                    <Shield className="h-5 w-5 text-muted-foreground" />
                                    <span>Painel Admin</span>
                                </Link>
                            </SheetClose>
                        )}
                    </nav>
                    <div className="mt-auto p-4">
                        <Button onClick={() => auth.signOut()} variant="outline" className="w-full">
                            <LogOut className="mr-2 h-4 w-4" /> Sair
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    </div>
);

export default function AppHeader() {
    const { user, userData, loading } = useAuth();
    const pathname = usePathname();

    // Do not render header on public pages like landing and auth
    const publicPages = ['/', '/auth'];
    if (publicPages.includes(pathname)) {
        return null;
    }
    
    // Only render header if inside the app routes
    if (!pathname.startsWith('/calculator') && !pathname.startsWith('/admin')) {
        return null;
    }


    return (
        <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                <Link href="/calculator" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Logo className="h-8 w-8" />
                    <h1 className="text-lg font-bold text-foreground whitespace-nowrap hidden sm:block">Calculadora de Ouro</h1>
                </Link>
                
                <DesktopNav userData={userData} loading={loading} />
                <MobileNav userData={userData} loading={loading} />
            </div>
        </header>
    );
}
