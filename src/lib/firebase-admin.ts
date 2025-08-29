
import admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (!serviceAccountString) {
            throw new Error("A variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY não está definida.");
        }
        const serviceAccount = JSON.parse(serviceAccountString);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: 'calculadora-de-ouro',
        });
    } catch (error) {
        console.error("Falha ao inicializar o Firebase Admin SDK:", error);
        // Não relançar o erro permite que o build continue,
        // mas as funcionalidades de admin não funcionarão.
    }
}

// Verifica se o SDK foi inicializado com sucesso antes de exportar
const isInitialized = admin.apps.length > 0;

export const db = isInitialized ? admin.firestore() : ({} as any);
export const auth = isInitialized ? admin.auth() : ({} as any);
export const Timestamp = isInitialized ? admin.firestore.Timestamp : ({} as any);
