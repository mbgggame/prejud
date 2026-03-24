import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

// Tentar carregar do arquivo JSON primeiro, depois das variáveis de ambiente
let firebaseAdminConfig;

try {
  // Tentar ler arquivo JSON da pasta docs (um nível acima do frontend)
  const serviceAccountPath = join(process.cwd(), '..', 'docs', 'prejud-saas-firebase-adminsdk-fbsvc-f07dcdb113.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  
  firebaseAdminConfig = {
    credential: cert(serviceAccount),
  };
  console.log('✅ Firebase Admin configurado via arquivo JSON');
} catch (error) {
  // Fallback para variáveis de ambiente
  console.log('⚠️ Firebase Admin via variáveis de ambiente');
  
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY 
    ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;
  
  firebaseAdminConfig = {
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  };
}

const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];
export const db = getFirestore(app);