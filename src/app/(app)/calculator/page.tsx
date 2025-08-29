'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';


// API da AwesomeAPI para buscar cotações
const AWESOME_API_KEY = 'f0f3604a5e5ee615a67aa6c2758cb4e17855e7236047cbdacd150f26bf58e66c';
const METAL_PRICE_API_URL = `https://economia.awesomeapi.com.br/json/last/XAU-BRL,XAG-BRL?token=${AWESOME_API_KEY}`;

// Fallbacks em caso de falha da API
const FALLBACK_GOLD_PRICE = 370.00; // Preço médio por grama
const FALLBACK_SILVER_PRICE = 4.50;  // Preço médio por grama

const GRAMS_IN_TROY_OUNCE = 31.1035;
const CACHE_DURATION_MINUTES = 5;
const TRIAL_LIMIT = 5; // Limite de 5 cálculos para o plano trial

const GoldBarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M2 5.5L3.5 9.5H20.5L22 5.5L20 4H4L2 5.5Z" stroke="#FBBF24" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M3.5 9.5L5 18H19L20.5 9.5H3.5Z" stroke="#FBBF24" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
);

const SilverBarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M2 5.5L3.5 9.5H20.5L22 5.5L20 4H4L2 5.5Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M3.5 9.5L5 18H19L20.5 9.5H3.5Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
);


export default function MetalCalculatorPage() {
  const { user, userData } = useAuth();
  const router = useRouter();

  const [metalPrices, setMetalPrices] = useState({ gold: FALLBACK_GOLD_PRICE, silver: FALLBACK_SILVER_PRICE });
  const [selectedMetal, setSelectedMetal] = useState('gold');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [timeSinceUpdate, setTimeSinceUpdate] = useState('');


  const [pesoSeco, setPesoSeco] = useState('');
  const [pesoMolhado, setPesoMolhado] = useState('');
  const [ajustePercentual, setAjustePercentual] = useState('10');
  const [calculationResult, setCalculationResult] = useState({ teor: 0, pesoFino: 0, valorFinal: 0 });


  useEffect(() => {
    // A lógica de criação/busca de usuário já é tratada no useAuth
    // Este useEffect pode ser simplificado ou removido se useAuth for suficiente
  }, [user]);
  
  useEffect(() => {
    if (!lastUpdate) return;

    const calculateTimeSince = () => {
      const now = new Date().getTime();
      const diffMinutes = Math.floor((now - lastUpdate) / (1000 * 60));
      if (diffMinutes < 1) {
        setTimeSinceUpdate('Atualizado há menos de 1 minuto.');
      } else if (diffMinutes === 1) {
        setTimeSinceUpdate('Atualizado há 1 minuto.');
      } else {
        setTimeSinceUpdate(`Atualizado há ${diffMinutes} minutos.`);
      }
    };

    calculateTimeSince();
    const interval = setInterval(calculateTimeSince, 60000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  useEffect(() => {
    const fetchMetalPrices = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const cachedData = localStorage.getItem('metalPrices');
        const now = new Date().getTime();

        if (cachedData) {
            const { prices, timestamp } = JSON.parse(cachedData);
            const ageMinutes = (now - timestamp) / (1000 * 60);

            if (ageMinutes < CACHE_DURATION_MINUTES) {
                setMetalPrices(prices);
                setLastUpdate(timestamp);
                setIsLoading(false);
                return;
            }
        }
        
        const response = await fetch(METAL_PRICE_API_URL);
        if (!response.ok) {
          throw new Error('Não foi possível buscar as cotações dos metais.');
        }
        const data = await response.json();
        
        const goldPricePerOunce = parseFloat(data.XAUBRL?.bid);
        const silverPricePerOunce = parseFloat(data.XAGBRL?.bid);

        if (!goldPricePerOunce || !silverPricePerOunce) {
            throw new Error('Resposta da API inválida.');
        }
        
        const goldPricePerGram = goldPricePerOunce / GRAMS_IN_TROY_OUNCE;
        const silverPricePerGram = silverPricePerOunce / GRAMS_IN_TROY_OUNCE;
        
        const newPrices = { gold: goldPricePerGram, silver: silverPricePerGram };
        const newTimestamp = new Date().getTime();
        setMetalPrices(newPrices);
        setLastUpdate(newTimestamp);
        localStorage.setItem('metalPrices', JSON.stringify({ prices: newPrices, timestamp: newTimestamp }));

      } catch (err) {
        setError('Erro ao buscar cotações. Usando valores de fallback.');
        setMetalPrices({ gold: FALLBACK_GOLD_PRICE, silver: FALLBACK_SILVER_PRICE });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetalPrices();
  }, []);

  const currentPrice = selectedMetal === 'gold' ? metalPrices.gold : metalPrices.silver;

  const performCalculation = async () => {
    if (!user || !userData) return;
    
    // Validação de Quota (Paywall)
    if (userData.plan === 'trial' && userData.used_count >= TRIAL_LIMIT) {
        alert('Seus 5 cálculos gratuitos acabaram. Faça o upgrade para o plano Pro para continuar calculando sem limites.');
        router.push('/precos');
        return;
    }
    
    // Lógica de cálculo
    const pSeco = parseFloat(pesoSeco) || 0;
    const pMolhado = parseFloat(pesoMolhado) || 0;
    const ajuste = parseFloat(ajustePercentual) || 0;

    let results = { teor: 0, pesoFino: 0, valorFinal: 0 };
    if (pSeco > 0 && pMolhado > 0 && pSeco >= pMolhado) {
        const teor = (pMolhado / pSeco * 2307.454) - 2088.088;
        const pesoFino = pSeco * (teor / 100);
        const valorPagarSemAjuste = pesoFino * (currentPrice || 0);
        const valorFinal = valorPagarSemAjuste * (1 - ajuste / 100);
        results = { teor, pesoFino, valorFinal };
    }
    setCalculationResult(results);

    // Gera o PDF com os resultados calculados
    await generatePDF(results);

    // Incrementa o uso no trial
    if (userData.plan === 'trial') {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            used_count: increment(1),
            last_calc_at: serverTimestamp(),
            updated_at: serverTimestamp()
        });
        // A atualização de estado local agora é tratada pelo onSnapshot no useAuth
    }
  };


  const formatCurrency = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return formatCurrency(0);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatNumber = (value: number, decimalPlaces = 2) => {
    if (isNaN(value) || value === Infinity || value < 0) return '0,00';
    return value.toFixed(decimalPlaces).replace('.', ',');
  };
  
  const resetFields = () => {
    setPesoSeco('');
    setPesoMolhado('');
    setAjustePercentual('10');
    setCalculationResult({ teor: 0, pesoFino: 0, valorFinal: 0 });
  };
  
  const generatePDF = async (results: { teor: number; pesoFino: number; valorFinal: number }) => {
    const doc_ = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const metalName = selectedMetal === 'gold' ? 'Ouro' : 'Prata';
    const generationDate = new Date().toLocaleString('pt-BR');
    const isPro = userData?.plan === 'pro';
    
    // Configurações de página
    const pageWidth = doc_.internal.pageSize.getWidth();
    const pageHeight = doc_.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    // Carregar logo
    let logoDataUri = null;
    try {
        const response = await fetch('/brand/logo-app.png');
        if(response.ok) {
            const blob = await response.blob();
            logoDataUri = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }
    } catch (e) {
        console.warn("Logo padrão não encontrada, o PDF será gerado sem ela.");
    }
    
    // Cabeçalho
    const logoHeight = 10;
    const logoWidth = logoHeight * 3; // proporção exemplo
    if(logoDataUri) {
        doc_.addImage(logoDataUri, 'PNG', margin, 15, logoWidth, logoHeight);
    }
    
    doc_.setFontSize(20);
    doc_.setFont('helvetica', 'bold');
    doc_.text('Calculadora de Ouro', pageWidth / 2, 22, { align: 'center' });

    doc_.setFontSize(12);
    doc_.setFont('helvetica', 'normal');
    doc_.text(`Relatório de Avaliação de ${metalName}`, pageWidth / 2, 30, { align: 'center' });
    
    doc_.setFontSize(9);
    doc_.setTextColor('#666');
    doc_.text(`Gerado em: ${generationDate} • Usuário: ${user?.email || 'N/A'}`, pageWidth / 2, 36, { align: 'center' });


    // Tabela de Dados
    const tableData = [
        ['Peso Seco (g)', `${formatNumber(parseFloat(pesoSeco))}`],
        ['Peso Molhado (g)', `${formatNumber(parseFloat(pesoMolhado))}`],
        ['Cotação do Grama (BRL)', `${formatCurrency(currentPrice)}`],
        ['Deságio Aplicado (%)', `${formatNumber(parseFloat(ajustePercentual))}`],
        ['Teor do Metal Calculado (%)', `${formatNumber(results.teor)}%`],
        ['Peso Fino (g)', `${formatNumber(results.pesoFino)}`],
    ];

    (doc_ as any).autoTable({
        startY: 45,
        head: [['Parâmetro', 'Valor']],
        body: tableData,
        theme: 'grid',
        margin: { left: margin, right: margin },
        headStyles: {
            fillColor: '#F1F8E9',
            textColor: '#333333',
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 11,
            cellPadding: 3,
        },
        alternateRowStyles: {
            fillColor: '#fafafa'
        },
    });

    const finalY = (doc_ as any).autoTable.previous.finalY + 15;

    // Resumo Final
    doc_.setFontSize(11);
    doc_.setFont('helvetica', 'normal');
    doc_.setTextColor('#333');
    let summaryText = isPro
      ? `Com base nos parâmetros informados, o valor justo de compra do ${metalName.toLowerCase()} é ${formatCurrency(results.valorFinal)}.`
      : "Este é um relatório demonstrativo. Para relatórios oficiais e personalizados, faça upgrade para a versão Pro.";
    
    const summaryLines = doc_.splitTextToSize(summaryText, contentWidth);
    doc_.text(summaryLines, margin, finalY);

    // Valor Final em destaque
    doc_.setFontSize(16);
    doc_.setFont('helvetica', 'bold');
    doc_.setFillColor('#f0fdf4');
    doc_.rect(margin, finalY + 12, contentWidth, 16, 'F');
    doc_.setTextColor('#059669');
    doc_.text('Valor Final a Pagar:', margin + 5, finalY + 22);
    doc_.text(formatCurrency(results.valorFinal), pageWidth - margin - 5, finalY + 22, { align: 'right' });

    // Marca d'água (apenas para trial)
    if (!isPro) {
      doc_.saveGraphicsState();
      doc_.setFontSize(48);
      doc_.setFont('helvetica', 'bold');
      doc_.setTextColor("#E0E0E0");
      doc_.setGState(new (doc_ as any).GState({opacity: 0.15}));
      
      const watermarkText = "VERSÃO GRATUITA — CALCULADORA DE OURO";
      const textWidth = doc_.getStringUnitWidth(watermarkText) * doc_.getFontSize() / doc_.internal.scaleFactor;
      const angle = -30;

      for (let y = -pageHeight; y < pageHeight * 2; y += 80) {
        for (let x = -pageWidth; x < pageWidth * 2; x += textWidth - 50) {
          doc_.text(watermarkText, x, y, {
            angle: angle,
          });
        }
      }
      doc_.restoreGraphicsState();
    }


    // Rodapé
    doc_.setFontSize(8);
    doc_.setFont('helvetica', 'italic');
    doc_.setTextColor('#888888');
    const footerText = `Gerado pela Calculadora de Ouro • yurirodrigueslabs.com • ${isPro ? 'Versão Pro' : 'Versão Gratuita'}`;
    doc_.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });


    doc_.save(`relatorio-calculo-${metalName.toLowerCase()}-${Date.now()}.pdf`);
  };

  const remainingCalculations = userData ? Math.max(0, TRIAL_LIMIT - userData.used_count) : 0;
  const hasTrialEnded = userData?.plan === 'trial' && remainingCalculations <= 0;
  
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader>
          <ToggleGroup type="single" defaultValue="gold" value={selectedMetal} onValueChange={(value) => { if (value) setSelectedMetal(value) }} className="justify-center">
            <ToggleGroupItem value="gold" aria-label="Selecionar Ouro">Ouro</ToggleGroupItem>
            <ToggleGroupItem value="silver" aria-label="Selecionar Prata">Prata</ToggleGroupItem>
          </ToggleGroup>
          <div className="flex items-center justify-center gap-3 pt-4">
            {selectedMetal === 'gold' ? <GoldBarIcon className="w-8 h-8 text-amber-400"/> : <SilverBarIcon className="w-8 h-8 text-gray-400"/>}
            <CardTitle className="text-3xl font-bold text-gray-700 dark:text-gray-200">
                Calculadora de {selectedMetal === 'gold' ? 'Ouro' : 'Prata'}
            </CardTitle>
          </div>
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
            Cotação {selectedMetal === 'gold' ? 'Ouro (g)' : 'Prata (g)'}:{' '}
            {isLoading ? <span className="italic">Carregando...</span> : <Badge variant="secondary">{formatCurrency(currentPrice || 0)}</Badge>}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            {!isLoading && !error && timeSinceUpdate && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{timeSinceUpdate}</p>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="peso-seco">Peso Seco (g)</Label>
              <Input id="peso-seco" placeholder="Ex: 9,68" type="number" value={pesoSeco} onChange={(e) => setPesoSeco(e.target.value)} disabled={hasTrialEnded} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="peso-molhado">Peso Molhado (g)</Label>
              <Input id="peso-molhado" placeholder="Ex: 8,99" type="number" value={pesoMolhado} onChange={(e) => setPesoMolhado(e.target.value)} disabled={hasTrialEnded} />
            </div>
          </div>
          
          <Separator />

          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <Label htmlFor="ajuste">Deságio (%)</Label>
              <Input id="ajuste" placeholder="Ex: 10" type="number" value={ajustePercentual} onChange={(e) => setAjustePercentual(e.target.value)} disabled={hasTrialEnded} />
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Teor do Metal</p>
                <p className="text-2xl font-bold text-amber-600">{formatNumber(calculationResult.teor)}%</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Peso Fino (g):</span>
              <span className="font-semibold text-lg">{formatNumber(calculationResult.pesoFino)} g</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold text-emerald-600 dark:text-emerald-400 p-3 bg-emerald-50 dark:bg-emerald-900/50 rounded-md">
              <span>Valor Final à Pagar:</span>
              <span>{formatCurrency(calculationResult.valorFinal)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
            {userData && userData.plan === 'trial' && (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {hasTrialEnded ? (
                      <span className="font-bold text-red-500">Seus cálculos gratuitos acabaram.</span>
                    ) : (
                      <>Você tem <span className="font-bold text-amber-600">{remainingCalculations}</span> de <span className="font-bold">{TRIAL_LIMIT}</span> cálculos gratuitos restantes.</>
                    )}
                </div>
            )}
             <div className="flex w-full gap-2">
                <Button onClick={resetFields} variant="outline" className="w-full" disabled={hasTrialEnded}>Limpar Campos</Button>
                <Button onClick={performCalculation} className="w-full" disabled={hasTrialEnded || !pesoSeco || !pesoMolhado}>Calcular e Gerar PDF</Button>
            </div>
        </CardFooter>
      </Card>
    </main>
  );
}
