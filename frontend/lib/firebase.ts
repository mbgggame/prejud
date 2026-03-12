// Firebase Client SDK Configuration
// Versão: Firebase v12.10.0
// Projeto: prejud-saas
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDNzOpeSwFgLlmR3GIhm7PhIzXWVkMHuDY",
  authDomain: "prejud-saas.firebaseapp.com",
  projectId: "prejud-saas",
  storageBucket: "prejud-saas.firebasestorage.app",
  messagingSenderId: "219757717057",
  appId: "1:219757717057:web:8af904697fcae64ba148c0"
};

// Inicializar app (evitar dupla inicialização no Next.js)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Exportar instâncias
export const db = getFirestore(app);
export const auth = getAuth(app);

// Conectar emuladores em desenvolvimento (opcional)
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}

export default app;
