import { defineBoot } from '#q-app/wrappers';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Configuration Firebase avec les valeurs du .env
const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'MISSING_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'MISSING_AUTH_DOMAIN',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'MISSING_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'MISSING_STORAGE_BUCKET',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'MISSING_MESSAGING_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'MISSING_APP_ID'
};

// Initialisation Firebase
let app: FirebaseApp;
let auth: Auth;
let storage: FirebaseStorage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  storage = getStorage(app);
  console.log('✅ Firebase initialisé avec succès');
} catch (error) {
  console.error('❌ Erreur lors de l\'initialisation Firebase:', error);
  throw error;
}

export default defineBoot(() => {
  console.log('🔥 Firebase boot plugin chargé');
});

export { app, auth, storage };
