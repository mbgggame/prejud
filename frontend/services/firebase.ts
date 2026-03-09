// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDNzOpeSwFgLlmR3GIhm7PhIzXWVkMHuDY",
  authDomain: "prejud-saas.firebaseapp.com",
  projectId: "prejud-saas",
  storageBucket: "prejud-saas.firebasestorage.app",
  messagingSenderId: "219757717057",
  appId: "1:219757717057:web:8af904697fcae64ba148c0"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
