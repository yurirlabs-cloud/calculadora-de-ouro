'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { createCheckoutSession } from '@/actions/stripe';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';

const PRICE_ID_PRO = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || 'price_1PKOy6RxWCo1z2b6oVys9oX5';

export default function PricingPage() {
    const { user, userData } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscription = async () => {
        if (!user) {
            router.push('/auth');
            return;
        }
        
        setIsLoading(true);
        try {
            const { checkoutUrl } = await createCheckoutSession({
                priceId: PRICE_ID_PRO,
                successUrl: `${window.location.origin}/sucesso`,
                cancelUrl: `${window.location.origin}/precos`,
                uid: user.uid,
                email: user.email,
            });

            if (checkoutUrl) {
                window.location.href = checkoutUrl;
            } else {
                throw new Error("Não foi possível criar a sessão de checkout.");
            }
        } catch (error) {
            console.error(error);
            alert("Ocorreu um erro ao iniciar o processo de assinatura. Tente novamente.");
            setIsLoading(false);
        }
    };
    
    const isAlreadyPro = userData?.plan === 'pro';

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Logo className="h-8 w-8" />
                    <span className="font-bold text-lg text-gray-800">Calculadora de Ouro</span>
                </Link>
                <div className="flex items-center gap-2">
                    {user ? (
                         <Button asChild variant="ghost">
                           <Link href="/calculator">Ir para Calculadora</Link>
                         </Button>
                    ) : (
                        <Button asChild variant="ghost">
                           <Link href="/auth">Entrar</Link>
                        </Button>
                    )}
                </div>
                </div>
            </header>

            <main className="flex-grow pt-16">
                 <section className="py-20 lg:py-24 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Planos simples e diretos</h2>
                        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">Comece gratuitamente e faça o upgrade quando precisar de mais.</p>
                        </div>
                        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-200 rounded-lg overflow-hidden shadow-xl">
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-center text-gray-500">Trial</h3>
                                <p className="text-center text-gray-500 mt-2">Para experimentar</p>
                                <ul className="mt-8 space-y-4 text-gray-600">
                                    <li className="flex items-start"><CheckCircle className="h-5 w-5 text-gray-400 mr-3 mt-1 flex-shrink-0" /><span><span className="font-bold">5 cálculos</span> disponíveis</span></li>
                                    <li className="flex items-start"><CheckCircle className="h-5 w-5 text-gray-400 mr-3 mt-1 flex-shrink-0" /><span>Relatórios PDF com marca d’água</span></li>
                                    <li className="flex items-start"><CheckCircle className="h-5 w-5 text-emerald-500 mr-3 mt-1 flex-shrink-0" /><span>Cotação em tempo real</span></li>
                                </ul>
                                <Button asChild variant="outline" className="w-full mt-8" disabled={isAlreadyPro}>
                                    <Link href="/calculator">Ir para Calculadora</Link>
                                </Button>
                            </div>
                            <div className="p-8 bg-gray-800 text-white border-t md:border-t-0 md:border-l border-gray-200">
                                <h3 className="text-2xl font-bold text-center text-amber-400">Pro</h3>
                                <p className="text-center text-gray-300 mt-2">Para profissionais</p>
                                <ul className="mt-8 space-y-4 text-gray-300">
                                    <li className="flex items-start"><CheckCircle className="h-5 w-5 text-amber-400 mr-3 mt-1 flex-shrink-0" /><span>Cálculos <span className="font-bold">ilimitados</span></span></li>
                                    <li className="flex items-start"><CheckCircle className="h-5 w-5 text-amber-400 mr-3 mt-1 flex-shrink-0" /><span>Relatórios PDF <span className="font-bold">sem marca d’água</span></span></li>
                                    <li className="flex items-start"><CheckCircle className="h-5 w-5 text-amber-400 mr-3 mt-1 flex-shrink-0" /><span>Cotação em tempo real</span></li>
                                    <li className="flex items-start"><CheckCircle className="h-5 w-5 text-amber-400 mr-3 mt-1 flex-shrink-0" /><span>Logo e contato no PDF (em breve)</span></li>
                                    <li className="flex items-start"><CheckCircle className="h-5 w-5 text-amber-400 mr-3 mt-1 flex-shrink-0" /><span>Suporte prioritário</span></li>
                                </ul>
                                <Button onClick={handleSubscription} className="w-full mt-8 bg-amber-500 hover:bg-amber-600 text-black" disabled={isLoading || isAlreadyPro}>
                                    {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (isAlreadyPro ? 'Seu Plano Atual' : 'Assinar Pro')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
