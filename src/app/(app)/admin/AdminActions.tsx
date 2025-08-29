'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCw } from 'lucide-react';
import { updateUserPlan, resetUserUsage } from '@/actions/admin';

interface AdminActionsProps {
  user: {
    id: string;
    plan: 'trial' | 'pro';
  };
}

export function AdminActions({ user }: AdminActionsProps) {
  const router = useRouter();
  const [isPlanChangePending, startPlanChangeTransition] = useTransition();
  const [isResetPending, startResetTransition] = useTransition();

  const handlePlanChange = (newPlan: 'trial' | 'pro') => {
    startPlanChangeTransition(async () => {
      try {
        await updateUserPlan(user.id, newPlan);
        alert(`Plano do usuário atualizado para ${newPlan}.`);
      } catch (error: any) {
        alert(`Falha ao atualizar o plano: ${error.message}`);
      } finally {
        router.refresh();
      }
    });
  };

  const handleResetUsage = () => {
    startResetTransition(async () => {
      try {
        await resetUserUsage(user.id);
        alert('Contagem de uso do usuário resetada.');
      } catch (error: any) {
        alert(`Falha ao resetar uso: ${error.message}`);
      } finally {
        router.refresh();
      }
    });
  };
  
  const isChangingPlan = user.plan === 'trial';

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => handlePlanChange(isChangingPlan ? 'pro' : 'trial')}
        disabled={isPlanChangePending || isResetPending}
        variant={isChangingPlan ? 'default' : 'destructive'}
        size="sm"
      >
        {isPlanChangePending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {isChangingPlan ? 'Ativar Pro' : 'Desativar Pro'}
      </Button>

      {user.plan === 'trial' && (
        <Button
          onClick={handleResetUsage}
          disabled={isPlanChangePending || isResetPending}
          variant="outline"
          size="sm"
        >
          {isResetPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RotateCw className="mr-2 h-4 w-4" />
          )}
          Resetar Uso
        </Button>
      )}
    </div>
  );
}
