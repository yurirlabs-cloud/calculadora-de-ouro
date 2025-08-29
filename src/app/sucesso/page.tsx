'use client';
import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'active' | 'processing' | 'error'>('loading');

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace('/auth');
            return;
        }

        // Se o Stripe redirecionou com status=cancel, é um erro.
        if (searchParams.get('session_id') === null && status === 'loading') {
            setStatus('error');
            return;
        }

        // O onSnapshot no useAuth vai atualizar o userData.
        // Aqui apenas reagimos à mudança.
        if (userData?.plan === 'pro') {
            setStatus('active');
        } else {
            // Se o usuário chegou aqui, mas o plano ainda não é pro, 
            // mostramos 'processando'. O webhook deve atualizar em breve.
            setStatus('processing');
        }

    }, [user, userData, authLoading, router, searchParams, status]);


    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md text-center shadow-lg">
                <CardHeader>
                    {status === 'loading' && <Loader2 className="h-12 w-12 mx-auto animate-spin text-gray-400" />}
                    {status === 'active' && <CheckCircle className="h-12 w-12 mx-auto text-green-500" />}
                    {status === 'processing' && <Loader2 className="h-12 w-12 mx-auto animate-spin text-amber-500" />}
                    {status === 'error' && <XCircle className="h-12 w-12 mx-auto text-red-500" />}
                    
                    <CardTitle className="text-2xl mt-4">
                        {status === 'active' && 'Assinatura Ativa!'}
                        {status === 'processing' && 'Processando Pagamento...'}
                        {status === 'loading' && 'Verificando Status...'}
                        {status === 'error' && 'Pagamento Cancelado'}
                    </CardTitle>
                    <CardDescription>
                         {status === 'active' && 'Obrigado! Seu plano Pro foi ativado. Você já pode usar todos os recursos ilimitados.'}
                         {status === 'processing' && 'Pagamento recebido. Estamos aguardando a confirmação final do provedor. Isso pode levar alguns instantes. Sua tela será atualizada automaticamente.'}
                         {status === 'loading' && 'Aguarde enquanto verificamos o status da sua assinatura.'}
                         {status === 'error' && 'Parece que o processo de pagamento foi cancelado. Você não foi cobrado. Se isso foi um engano, pode tentar novamente.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status === 'active' ? (
                        <Button asChild className="w-full">
                            <Link href="/calculator">Ir para a Calculadora</Link>
                        </Button>
                    ) : status === 'error' ? (
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/precos">Ver Planos</Link>
                        </Button>
                    ) : (
                         <div className="text-sm text-muted-foreground">Aguardando confirmação...</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}


export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <SuccessContent />
        </Suspense>
    )
}
