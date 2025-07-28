// src/stores/auth.store.ts
import { ref, computed, readonly } from 'vue';
import { defineStore } from 'pinia';
import {
  onAuthStateChanged,
  signOut,
  type User
} from 'firebase/auth';
import { auth } from 'src/boot/firebase';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export const useAuthStore = defineStore('auth', () => {
  // État
  const user = ref<User | null>(null);
  const loading = ref(true);
  const initialized = ref(false);

  // Getters computed
  const isAuthenticated = computed(() => !!user.value);
  const userProfile = computed((): UserProfile | null => {
    if (!user.value) return null;

    return {
      uid: user.value.uid,
      email: user.value.email,
      displayName: user.value.displayName,
      photoURL: user.value.photoURL,
      emailVerified: user.value.emailVerified
    };
  });

  // Actions
  const initializeAuth = () => {
    return new Promise<void>((resolve) => {
      if (initialized.value) {
        resolve();
        return;
      }

      console.log('🔄 Initialisation de l\'authentification...');

      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        console.log('🔐 État d\'authentification changé:', firebaseUser?.email || 'Non connecté');

        user.value = firebaseUser;
        loading.value = false;

        if (!initialized.value) {
          initialized.value = true;
          resolve();
        }
      });

      // Nettoyer l'écouteur si nécessaire (optionnel dans un store)
      // return unsubscribe;
    });
  };

  const logout = async (): Promise<void> => {
    try {
      loading.value = true;
      await signOut(auth);
      user.value = null;
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!user.value) {
      console.warn('⚠️ Aucun utilisateur connecté pour récupérer le token');
      return null;
    }

    try {
      const token = await user.value.getIdToken();
      console.log('🔑 Token Firebase récupéré');
      return token;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du token:', error);
      return null;
    }
  };

  const refreshToken = async (): Promise<string | null> => {
    if (!user.value) {
      console.warn('⚠️ Aucun utilisateur connecté pour rafraîchir le token');
      return null;
    }

    try {
      const token = await user.value.getIdToken(true); // Force refresh
      console.log('🔄 Token Firebase rafraîchi');
      return token;
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement du token:', error);
      return null;
    }
  };

  // Méthode pour vérifier si l'utilisateur a un rôle spécifique
  const hasRole = async (role: string): Promise<boolean> => {
    if (!user.value) return false;

    try {
      const tokenResult = await user.value.getIdTokenResult();
      return tokenResult.claims[role] === true;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du rôle:', error);
      return false;
    }
  };

  // Méthode pour obtenir tous les claims personnalisés
  const getUserClaims = async (): Promise<Record<string, any> | null> => {
    if (!user.value) return null;

    try {
      const tokenResult = await user.value.getIdTokenResult();
      return tokenResult.claims;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des claims:', error);
      return null;
    }
  };

  return {
    // État
    user: readonly(user),
    loading: readonly(loading),
    initialized: readonly(initialized),

    // Getters
    isAuthenticated,
    userProfile,

    // Actions
    initializeAuth,
    logout,
    getIdToken,
    refreshToken,
    hasRole,
    getUserClaims
  };
});

// Composable pour utiliser facilement l'auth dans les composants
export const useAuth = () => {
  const authStore = useAuthStore();

  return {
    ...authStore,
    // Raccourcis pratiques
    user: computed(() => authStore.user),
    isLoggedIn: computed(() => authStore.isAuthenticated),
    profile: computed(() => authStore.userProfile)
  };
};
