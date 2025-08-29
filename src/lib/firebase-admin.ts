
import admin from 'firebase-admin';
import { firestore } from 'firebase-admin';

let db: firestore.Firestore;
let auth: admin.auth.Auth;
let Timestamp: typeof firestore.Timestamp;

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
    }
}

// Verifica se o SDK foi inicializado com sucesso antes de exportar
if (admin.apps.length > 0) {
    db = admin.firestore();
    auth = admin.auth();
    Timestamp = admin.firestore.Timestamp;
} else {
    // Para evitar erros de "not defined" durante o build se a inicialização falhar.
    db = {} as firestore.Firestore;
    auth = {} as admin.auth.Auth;
    Timestamp = {} as typeof firestore.Timestamp;
}

export { db, auth, Timestamp };
