
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle, Gem, BarChart, Clock, Award, ShieldCheck, Scale, ArrowRight, Wallet, TrendingUp, Menu, Users, Star, FileText } from 'lucide-react';
import { Logo } from '@/components/Logo';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";


const GoldBarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M2 5.5L3.5 9.5H20.5L22 5.5L20 4H4L2 5.5Z" stroke="#FBBF24" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M3.5 9.5L5 18H19L20.5 9.5H3.5Z" stroke="#FBBF24" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
);


const CalculatorMockup = () => (
    <Card className="w-full max-w-lg shadow-2xl animate-fade-in-up">
        <CardHeader>
            <ToggleGroup type="single" defaultValue="gold" className="justify-center w-full">
                <ToggleGroupItem value="gold" aria-label="Selecionar Ouro" className="w-full" disabled>Ouro</ToggleGroupItem>
                <ToggleGroupItem value="silver" aria-label="Selecionar Prata" className="w-full" disabled>Prata</ToggleGroupItem>
            </ToggleGroup>
            <div className="flex items-center justify-center gap-3 pt-4">
                <GoldBarIcon className="w-8 h-8 text-amber-400"/>
                <CardTitle className="text-3xl font-bold text-gray-700">
                    Calculadora de Ouro
                </CardTitle>
            </div>
            <div className="text-center text-sm text-gray-500 pt-2">
                Cotação Ouro (g): <Badge variant="secondary">R$ 375,41</Badge>
            </div>
        </CardHeader>
        <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="peso-seco-mock">Peso Seco (g)</Label>
                    <Input id="peso-seco-mock" value="9,68" type="text" disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="peso-molhado-mock">Peso Molhado (g)</Label>
                    <Input id="peso-molhado-mock" value="8,99" type="text" disabled />
                </div>
            </div>
            
            <Separator />

            <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                    <Label htmlFor="ajuste-mock">Deságio (%)</Label>
                    <Input id="ajuste-mock" value="10" type="text" disabled />
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Teor do Metal</p>
                    <p className="text-2xl font-bold text-amber-600">54,89%</p>
                </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Peso Fino (g):</span>
                    <span className="font-semibold text-lg">5,31 g</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold text-emerald-600 p-3 bg-emerald-50 rounded-md">
                    <span>Valor Final à Pagar:</span>
                    <span>R$ 1.796,56</span>
                </div>
            </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
            <div className="text-center text-sm text-gray-500 mb-2">
                Você tem <span className="font-bold text-amber-600">5</span> de <span className="font-bold">5</span> cálculos gratuitos restantes.
            </div>
            <div className="flex w-full gap-2">
                <Button variant="outline" className="w-full" disabled>Limpar Campos</Button>
                <Button className="w-full" disabled>Calcular e Gerar PDF</Button>
            </div>
        </CardFooter>
    </Card>
);


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="font-bold text-lg text-gray-800">Calculadora de Ouro</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/auth">Entrar</Link>
            </Button>
            <Button asChild className="bg-amber-500 hover:bg-amber-600 text-black">
              <Link href="/auth">Começar Agora</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="text-center py-20 lg:py-28 overflow-hidden">
           <div className="container mx-auto px-4 relative">
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
              Calcule o valor do ouro e da prata com <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-600">precisão de mercado.</span>
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg lg:text-xl text-gray-600">
              A ferramenta definitiva para joalheiros e compradores de metais preciosos. Cotação em tempo real, cálculo de teor e relatórios profissionais em PDF.
            </p>
            <div className="mt-8 flex justify-center">
              <Button asChild size="lg" className="text-lg bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20">
                <Link href="/auth">
                  5 Cálculos Gratuitos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="relative mt-12 flex justify-center">
                <GoldBarIcon className="w-10 h-10 text-amber-400 absolute top-0 -left-10 opacity-0 animate-float-up" style={{ animationDelay: '0.2s' }} />
                <FileText className="w-8 h-8 text-gray-400 absolute top-20 -right-4 opacity-0 animate-float-up" style={{ animationDelay: '0.5s' }} />
                <GoldBarIcon className="w-12 h-12 text-amber-400 absolute bottom-1/4 -right-12 opacity-0 animate-float-up" style={{ animationDelay: '0.8s' }} />
                <FileText className="w-10 h-10 text-gray-400 absolute bottom-0 left-1/4 opacity-0 animate-float-up" style={{ animationDelay: '1.1s' }}/>
                <GoldBarIcon className="w-16 h-16 text-amber-400 absolute top-1/2 -left-16 opacity-0 animate-float-up" style={{ animationDelay: '1.4s' }} />
                <FileText className="w-9 h-9 text-gray-400 absolute top-0 right-0 opacity-0 animate-float-up" style={{ animationDelay: '1.7s' }} />
                <GoldBarIcon className="w-8 h-8 text-amber-400 absolute bottom-0 -left-2 opacity-0 animate-float-up" style={{ animationDelay: '2s' }} />


                <CalculatorMockup />
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section className="py-20 lg:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">A ferramenta que impulsiona seu negócio</h2>
              <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">Vantagens que vão além da matemática, economizando seu tempo e dinheiro.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 text-emerald-600">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-bold text-lg">Cotações em Tempo Real</h3>
                <p className="mt-2 text-gray-600">Nossa integração busca o valor atualizado do ouro e da prata para garantir o preço mais justo em cada transação.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                 <div className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 text-emerald-600">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-bold text-lg">Precisão Garantida</h3>
                <p className="mt-2 text-gray-600">A fórmula de cálculo de teor baseada em densidade elimina erros, garantindo que você pague o valor correto.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                 <div className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 text-emerald-600">
                  <BarChart className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-bold text-lg">Relatórios Profissionais</h3>
                <p className="mt-2 text-gray-600">Gere relatórios em PDF com um clique para arquivar ou compartilhar com seus clientes e fornecedores.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Depoimento */}
        <section className="py-20 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4 max-w-4xl">
            <figure className="text-center">
              <Star className="h-8 w-8 text-amber-400 mx-auto mb-4" />
              <blockquote className="text-xl lg:text-2xl font-medium text-gray-900">
                <p>“Desde que comecei a usar a Calculadora de Ouro, nunca mais errei na hora de pagar pelas peças. O sistema é rápido, confiável e me passa a segurança que eu precisava para escalar minhas operações.”</p>
              </blockquote>
              <figcaption className="mt-6">
                <div className="text-base text-gray-900 font-bold">— Carlos Martins</div>
                <div className="text-base text-gray-600">Joalheiro Empresário</div>
              </figcaption>
            </figure>
          </div>
        </section>
        
        {/* Comparativo Free vs Premium */}
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
                     <Button asChild variant="outline" className="w-full mt-8">
                        <Link href="/auth">Começar Gratuitamente</Link>
                    </Button>
                </div>
                <div className="p-8 bg-gray-800 text-white border-t md:border-t-0 md:border-l border-gray-200">
                    <h3 className="text-2xl font-bold text-center text-amber-400">Premium</h3>
                    <p className="text-center text-gray-300 mt-2">Para profissionais</p>
                     <ul className="mt-8 space-y-4 text-gray-300">
                        <li className="flex items-start"><CheckCircle className="h-5 w-5 text-amber-400 mr-3 mt-1 flex-shrink-0" /><span>Cálculos <span className="font-bold">ilimitados</span></span></li>
                        <li className="flex items-start"><CheckCircle className="h-5 w-5 text-amber-400 mr-3 mt-1 flex-shrink-0" /><span>Relatórios PDF <span className="font-bold">sem marca d’água</span></span></li>
                        <li className="flex items-start"><CheckCircle className="h-5 w-5 text-amber-400 mr-3 mt-1 flex-shrink-0" /><span>Cotação em tempo real</span></li>
                        <li className="flex items-start"><CheckCircle className="h-5 w-5 text-amber-400 mr-3 mt-1 flex-shrink-0" /><span>Logo e contato no PDF (em breve)</span></li>
                        <li className="flex items-start"><CheckCircle className="h-5 w-5 text-amber-400 mr-3 mt-1 flex-shrink-0" /><span>Suporte prioritário</span></li>
                    </ul>
                    <Button asChild className="w-full mt-8 bg-amber-500 hover:bg-amber-600 text-black">
                        <Link href="/precos">Assinar Premium</Link>
                    </Button>
                </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="bg-gray-100">
          <div className="container mx-auto px-4 py-20 lg:py-24 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Pare de perder dinheiro com cálculos manuais.
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              Tenha a confiança de estar fazendo o melhor negócio. Sempre.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="text-lg bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20">
                <Link href="/auth">
                  Calcular Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>© 2025 Calculadora de Ouro | Desenvolvido por Yuri Rodrigues Labs</p>
        </div>
      </footer>
    </div>
  );
}

