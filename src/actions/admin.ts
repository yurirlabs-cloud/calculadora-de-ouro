'use server';

import { db, Timestamp } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

/**
 * Atualiza o plano de um usuário para 'trial' ou 'pro'.
 * Se o plano for alterado para 'trial', a contagem de uso é resetada.
 */
export async function updateUserPlan(uid: string, newPlan: 'trial' | 'pro') {
    if (!uid || !['trial', 'pro'].includes(newPlan)) {
        throw new Error("Parâmetros inválidos.");
    }

    try {
        const userRef = db.collection('users').doc(uid);
        const subscriptionRef = db.collection('subscriptions').doc(uid);

        await db.runTransaction(async (transaction: FirebaseFirestore.Transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw new Error("Usuário não encontrado.");
            }
            
            const currentData = userDoc.data();
            const userUpdateData: any = {
                ...currentData,
                plan: newPlan,
                updated_at: Timestamp.now(),
            };
            
            if (newPlan === 'trial') {
                userUpdateData.used_count = 0;
            }
            
            transaction.set(userRef, userUpdateData);

            transaction.set(subscriptionRef, {
                status: newPlan === 'pro' ? 'active' : 'canceled',
                provider: newPlan === 'pro' ? 'admin' : null,
                updated_at: Timestamp.now()
            }, { merge: true });
        });
        
        revalidatePath('/admin');
        return { success: true, message: `Plano do usuário ${uid} atualizado para ${newPlan}.` };

    } catch (error: any) {
        console.error("Erro em updateUserPlan:", error);
        throw new Error(error.message || "Falha ao atualizar o plano do usuário no servidor.");
    }
}

/**
 * Reseta a contagem de uso ('used_count') de um usuário para 0.
 */
export async function resetUserUsage(uid: string) {
    if (!uid) {
        throw new Error("UID do usuário é obrigatório.");
    }

    try {
        const userRef = db.collection('users').doc(uid);
        await userRef.update({
            used_count: 0,
            updated_at: Timestamp.now(),
        });

        revalidatePath('/admin');
        return { success: true, message: `Contagem de uso do usuário ${uid} foi resetada.` };

    } catch (error: any) {
        console.error("Erro em resetUserUsage:", error);
        throw new Error(error.message || "Falha ao resetar a contagem de uso do usuário.");
    }
}
