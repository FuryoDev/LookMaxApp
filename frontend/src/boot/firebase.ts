// 1. Remplacez temporairement firebase.ts par ce code pour diagnostiquer
// frontend/src/boot/firebase.ts
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

// Configuration avec des valeurs par défaut pour diagnostiquer
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "MISSING_API_KEY",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "MISSING_AUTH_DOMAIN",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "MISSING_PROJECT_ID",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "MISSING_STORAGE_BUCKET",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "MISSING_MESSAGING_SENDER_ID",
  appId: process.env.VITE_FIREBASE_APP_ID || "MISSING_APP_ID"
};

// Diagnostic console - TRÈS IMPORTANT
console.log('🔍 DIAGNOSTIC FIREBASE CONFIG:');
console.log('API Key:', firebaseConfig.apiKey?.substring(0, 20) + '...' || 'UNDEFINED');
console.log('Auth Domain:', firebaseConfig.authDomain || 'UNDEFINED');
console.log('Project ID:', firebaseConfig.projectId || 'UNDEFINED');
console.log('Storage Bucket:', firebaseConfig.storageBucket || 'UNDEFINED');
console.log('Messaging Sender ID:', firebaseConfig.messagingSenderId || 'UNDEFINED');
console.log('App ID:', firebaseConfig.appId?.substring(0, 20) + '...' || 'UNDEFINED');

// Vérification des variables manquantes
const missingVars = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value || value.startsWith('MISSING_'))
  .map(([key, _]) => key);

if (missingVars.length > 0) {
  console.error('❌ VARIABLES MANQUANTES:', missingVars);
  console.error('Créez le fichier frontend/.env avec ces variables:');
  console.error(`
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=lookmax-99771.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lookmax-99771
VITE_FIREBASE_STORAGE_BUCKET=lookmax-99771.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_messaging_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
  `);
}

let app: FirebaseApp;
let auth: Auth;
let storage: FirebaseStorage;

try {
  if (missingVars.length === 0) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    storage = getStorage(app);
    console.log('✅ Firebase initialized successfully');
  } else {
    console.error('❌ Firebase NOT initialized - missing configuration');
    throw new Error('Firebase configuration incomplete');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw error;
}

export { auth, storage };

export default defineBoot(() => {
  if (missingVars.length === 0) {
    console.log('✅ Firebase boot completed successfully');
  } else {
    console.error('❌ Firebase boot failed - check configuration');
  }
});
