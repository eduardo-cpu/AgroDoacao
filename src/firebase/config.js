// Configuração do Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, FacebookAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Verificar se as variáveis de ambiente estão carregadas corretamente
// e usar valores de fallback quando necessário
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCrfU0yKnScQTN76QhZUO3xRk8EWHRZjrs",
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "agrodoacao.firebaseapp.com",
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "agrodoacao",
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "agrodoacao.firebasestorage.app",
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "1020927272918",
    appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:1020927272918:web:937a6c091f0c494afb6677",
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-10SXPKTEJS"
};

// Verifica se a configuração do Firebase está completa
console.log("Firebase config status:", {
    apiKey: !!firebaseConfig.apiKey,
    authDomain: !!firebaseConfig.authDomain,
    projectId: !!firebaseConfig.projectId
});

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços necessários
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;