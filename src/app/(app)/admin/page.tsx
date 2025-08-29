import { db } from '@/lib/firebase-admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserData, SubscriptionData } from '@/hooks/use-auth';
import { AdminActions } from './AdminActions';
import { Shield } from 'lucide-react';

interface FullUserData extends UserData {
    id: string;
    subscription?: SubscriptionData;
}

// Força a página a ser renderizada dinamicamente para sempre buscar os dados mais recentes
export const dynamic = 'force-dynamic';

async function getUsersData(): Promise<FullUserData[]> {
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = usersSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as FullUserData));

        const subscriptionsSnapshot = await db.collection('subscriptions').get();
        const subscriptions = subscriptionsSnapshot.docs.reduce((acc: any, doc: any) => {
            acc[doc.id] = doc.data() as SubscriptionData;
            return acc;
        }, {} as { [key: string]: SubscriptionData });

        return users.map((user: FullUserData) => ({
            ...user,
            subscription: subscriptions[user.id]
        }));
    } catch (error) {
        console.error("Failed to fetch users data:", error);
        // Retorna um array vazio em caso de erro para não quebrar a página
        return [];
    }
}

function getPlanStatus(user: FullUserData) {
    if (user.plan === 'pro') {
        return <Badge className="bg-amber-500 text-black">Pro</Badge>;
    }
    const used = user.used_count ?? 0;
    return <Badge variant="secondary">Trial ({used}/5)</Badge>;
}

function getSubscriptionStatus(user: FullUserData) {
    if (!user.subscription || user.subscription.status === 'canceled' || !user.subscription.status || user.subscription.status === 'none') {
        return <Badge variant="outline">Inativa</Badge>;
    }
    if (user.subscription.status === 'active') {
         if (user.subscription.provider === 'admin') {
            return <Badge variant="success" className="bg-blue-600 text-white">Ativa (Admin)</Badge>;
         }
         return <Badge variant="success" className="bg-green-600 text-white">Ativa</Badge>;
    }
    if (user.subscription.status === 'past_due') {
        return <Badge variant="destructive">Pendente</Badge>;
    }
    return <Badge variant="secondary">{user.subscription.status}</Badge>;
}

export default async function AdminDashboard() {
    const users = await getUsersData();

    // Verificação de segurança: Se o Admin SDK falhou, exibe uma mensagem
    if (!users) {
        return (
             <div className="container mx-auto p-4">
                <Card className="bg-destructive/10 border-destructive">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <Shield className="h-6 w-6" />
                            Funcionalidade de Admin Desativada
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-destructive">
                        <p>A configuração do servidor (Firebase Admin SDK) não foi concluída. A chave da conta de serviço (`FIREBASE_SERVICE_ACCOUNT_KEY`) precisa ser configurada nas variáveis de ambiente do projeto para que o painel de administração possa funcionar.</p>
                        <p className="mt-4 font-bold">Ação Necessária:</p>
                        <p>Para habilitar esta página, por favor, configure a variável de ambiente `FIREBASE_SERVICE_ACCOUNT_KEY` com o JSON da sua conta de serviço do Firebase.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Shield className="h-6 w-6" />
                        <CardTitle>Painel de Administração</CardTitle>
                    </div>
                    <CardDescription>
                        Gerencie os usuários e seus planos de assinatura. Atualmente, há {users.length} usuários registrados.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Plano Atual</TableHead>
                                <TableHead>Status Assinatura</TableHead>
                                <TableHead>Data de Criação</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        Nenhum usuário encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user: FullUserData) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.email}</TableCell>
                                        <TableCell>{getPlanStatus(user)}</TableCell>
                                        <TableCell>{getSubscriptionStatus(user)}</TableCell>
                                        <TableCell>
                                            {user.created_at ? new Date(user.created_at.seconds * 1000).toLocaleDateString('pt-BR') : 'N/A'}
                                        </TableCell>
                                        <TableCell className="flex justify-end">
                                           <AdminActions user={{ id: user.id, plan: user.plan }} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
