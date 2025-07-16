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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "MISSING_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "MISSING_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "MISSING_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "MISSING_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "MISSING_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "MISSING_APP_ID"
};

// Diagnostic console
console.log('🔍 DIAGNOSTIC FIREBASE CONFIG:');
console.log('API Key:', firebaseConfig.apiKey?.substring(0, 20) + '...' || 'UNDEFINED');
console.log('Auth Domain:', firebaseConfig.authDomain || 'UNDEFINED');
console.log('Project ID:', firebaseConfig.projectId || 'UNDEFINED');
console.log('Storage Bucket:', firebaseConfig.storageBucket || 'UNDEFINED');
console.log('Messaging Sender ID:', firebaseConfig.messagingSenderId || 'UNDEFINED');
console.log('App ID:', firebaseConfig.appId?.substring(0, 20) + '...' || 'UNDEFINED');

// Vérification des variables manquantes
const missingVars = Object.entries(firebaseConfig)
  .filter(([, value]) => !value || value.startsWith('MISSING_'))
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ VARIABLES MANQUANTES:', missingVars);
  console.error('Vérifiez votre fichier frontend/.env avec ces variables:');
  console.error(`
VITE_FIREBASE_API_KEY=AIzaSyAo52cMzGLxe33sr-2eFlZ64bVvx3l57Vw
VITE_FIREBASE_AUTH_DOMAIN=lookmax-99771.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lookmax-99771
VITE_FIREBASE_STORAGE_BUCKET=lookmax-99771.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=592723842935
VITE_FIREBASE_APP_ID=1:592723842935:web:5d150e71b347ee1a407372
  `);
}

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
