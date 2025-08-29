// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Se o hook de autenticação terminar de carregar e encontrar um usuário,
    // significa que o login foi bem-sucedido (seja por e-mail ou Google).
    // Então, redirecionamos para dentro do app.
    if (!authLoading && user) {
      router.replace('/calculator');
    }
  }, [user, authLoading, router]);

  const handleAuthAction = async () => {
    setError('');
    setIsLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // O useEffect cuidará do redirecionamento
    } catch (err) {
      setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        // O useEffect cuidará do redirecionamento
    } catch (err) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  // Se o usuário já está logado, mostramos um loader enquanto ele é redirecionado.
  if (authLoading || user) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{isSignUp ? 'Criar Conta' : 'Login'}</CardTitle>
          <CardDescription>
            {isSignUp ? 'Crie uma conta para começar a usar a calculadora.' : 'Faça login para acessar sua conta.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardContent>
        <CardFooter className="flex-col gap-4">
            <Button onClick={handleAuthAction} className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSignUp ? 'Criar Conta' : 'Entrar'}
            </Button>
            
            <Separator />
            
            <Button onClick={handleGoogleSignIn} variant="outline" className="w-full" disabled={isLoading}>
                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 64.5C308.6 102.3 282.6 92 256 92c-71.7 0-130 58.3-130 130s58.3 130 130 130c79.1 0 115.3-59.7 119.1-94.2h-119.1v-87.7h217.2c2.4 12.8 3.6 26.4 3.6 41.8z"></path></svg>
                Entrar com Google
            </Button>
            
            <div className="mt-4 text-center text-sm">
                {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
                <button onClick={() => setIsSignUp(!isSignUp)} className="underline ml-1" disabled={isLoading}>
                {isSignUp ? 'Login' : 'Criar Conta'}
                </button>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
