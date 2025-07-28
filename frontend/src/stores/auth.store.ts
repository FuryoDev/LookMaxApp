import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from 'firebase/auth';
import { AuthService } from 'src/services/auth.service';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
  phoneNumber?: string | null;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

export const useAuth = defineStore('auth', () => {
  // État
  const user = ref<User | null>(null);
  const userProfile = ref<UserProfile | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const initialized = ref(false);

  // Getters
  const isAuthenticated = computed(() => {
    // Vérifier aussi le mode dev
    const devMode = localStorage.getItem('DEV_MODE_AUTH') === 'true';
    return !!user.value || devMode;
  });

  const userId = computed(() => user.value?.uid || null);

  // Actions
  const initializeAuth = async () => {
    console.log('🔄 Initialisation de l\'authentification...');
    loading.value = true;
    error.value = null;

    try {
      // Vérifier le mode dev
      const devMode = localStorage.getItem('DEV_MODE_AUTH') === 'true';

      if (devMode) {
        console.log('🛠️ Mode développeur activé');
        // Créer un profil mock pour le mode dev
        userProfile.value = {
          uid: 'dev-user-123',
          email: 'dev@lookmax.com',
          displayName: 'Développeur',
          emailVerified: true
        };
        initialized.value = true;
        loading.value = false;
        return;
      }

      // Observer les changements d'état d'authentification
      const unsubscribe = AuthService.onAuthStateChanged((authUser) => {
        if (authUser) {
          console.log('✅ Utilisateur authentifié:', authUser.email);
          user.value = authUser as unknown as User;

          // Créer le profil utilisateur
          userProfile.value = {
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            photoURL: (authUser as any).photoURL || null,
            emailVerified: (authUser as any).emailVerified || false,
            phoneNumber: (authUser as any).phoneNumber || null,
            metadata: {
              creationTime: (authUser as any).metadata?.creationTime,
              lastSignInTime: (authUser as any).metadata?.lastSignInTime
            }
          };
        } else {
          console.log('❌ Aucun utilisateur authentifié');
          user.value = null;
          userProfile.value = null;
        }

        initialized.value = true;
        loading.value = false;
      });

      // Nettoyer l'observer lors de la destruction du store
      return unsubscribe;
    } catch (err) {
      console.error('❌ Erreur d\'initialisation:', err);
      error.value = err instanceof Error ? err.message : 'Erreur inconnue';
      loading.value = false;
      initialized.value = true;
    }
  };

  const login = async (email: string, password: string) => {
    console.log('🔐 Tentative de connexion...');
    loading.value = true;
    error.value = null;

    try {
      const authUser = await AuthService.signIn(email, password);
      console.log('✅ Connexion réussie:', authUser.email);
      return authUser;
    } catch (err) {
      console.error('❌ Erreur de connexion:', err);
      error.value = err instanceof Error ? err.message : 'Erreur de connexion';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const register = async (email: string, password: string) => {
    console.log('📝 Tentative d\'inscription...');
    loading.value = true;
    error.value = null;

    try {
      const authUser = await AuthService.signUp(email, password);
      console.log('✅ Inscription réussie:', authUser.email);
      return authUser;
    } catch (err) {
      console.error('❌ Erreur d\'inscription:', err);
      error.value = err instanceof Error ? err.message : 'Erreur d\'inscription';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    console.log('🚪 Déconnexion...');
    loading.value = true;
    error.value = null;

    try {
      // Vérifier si on est en mode dev
      const devMode = localStorage.getItem('DEV_MODE_AUTH') === 'true';

      if (devMode) {
        // En mode dev, juste réinitialiser les données
        user.value = null;
        userProfile.value = null;
        console.log('✅ Déconnexion réussie (mode dev)');
      } else {
        await AuthService.signOut();
        console.log('✅ Déconnexion réussie');
      }
    } catch (err) {
      console.error('❌ Erreur de déconnexion:', err);
      error.value = err instanceof Error ? err.message : 'Erreur de déconnexion';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    try {
      // En mode dev, retourner un token mock
      const devMode = localStorage.getItem('DEV_MODE_AUTH') === 'true';
      if (devMode) {
        return 'dev-token-123456789';
      }

      return await AuthService.getIdToken();
    } catch (err) {
      console.error('❌ Erreur récupération token:', err);
      return null;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user.value && !localStorage.getItem('DEV_MODE_AUTH')) {
      throw new Error('Aucun utilisateur connecté');
    }

    loading.value = true;
    error.value = null;

    try {
      // TODO: Implémenter la mise à jour du profil Firebase
      console.log('📝 Mise à jour du profil:', updates);

      // Mettre à jour le profil local
      if (userProfile.value) {
        userProfile.value = {
          ...userProfile.value,
          ...updates
        };
      }
    } catch (err) {
      console.error('❌ Erreur mise à jour profil:', err);
      error.value = err instanceof Error ? err.message : 'Erreur de mise à jour';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const hasRole = async (role: string): Promise<boolean> => {
    try {
      const token = await getIdToken();
      if (!token) return false;

      // En mode dev, toujours autoriser
      if (token === 'dev-token-123456789') {
        return true;
      }

      // TODO: Implémenter la vérification des rôles via les custom claims Firebase
      console.log('🔍 Vérification du rôle:', role);
      return false;
    } catch (err) {
      console.error('❌ Erreur vérification rôle:', err);
      return false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // État
    user,
    userProfile,
    loading,
    error,
    initialized,

    // Getters
    isAuthenticated,
    userId,

    // Actions
    initializeAuth,
    login,
    register,
    logout,
    getIdToken,
    updateProfile,
    hasRole,
    clearError
  };
});
