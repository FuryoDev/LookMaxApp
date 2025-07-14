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

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY as string,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.VITE_FIREBASE_APP_ID as string
};

const app : FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);

export default defineBoot(() => {
  console.log('Firebase initialized successfully');
});

