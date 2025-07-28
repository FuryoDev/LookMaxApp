<!-- AuthGuard.vue - Version Quasar -->
<template>
  <div>
    <!-- Écran de chargement pendant l'initialisation -->
    <div v-if="loading" class="full-screen-loading">
      <div class="text-center">
        <q-spinner-grid
          color="primary"
          size="3em"
        />
        <div class="q-mt-md text-h6 text-grey-7">
          Vérification de l'authentification...
        </div>
      </div>
    </div>

    <!-- Contenu protégé si authentifié -->
    <div v-else-if="isAuthenticated && accessGranted">
      <slot :user="user" :profile="userProfile" />
    </div>

    <!-- Accès refusé -->
    <div v-else-if="isAuthenticated && !accessGranted" class="access-denied">
      <q-card class="access-denied-card">
        <q-card-section class="text-center">
          <q-icon name="block" size="4em" color="negative" />
          <div class="text-h5 q-mt-md text-weight-bold">
            Accès refusé
          </div>
          <div class="text-body1 text-grey-7 q-mt-sm">
            {{ accessError }}
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            flat
            color="primary"
            label="Retour"
            @click="$router.go(-1)"
          />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Composant d'authentification si non authentifié -->
    <div v-else class="auth-required">
      <q-page class="flex flex-center">
        <div class="auth-container">
          <!-- Message personnalisé -->
          <q-card v-if="showCustomMessage" class="q-mb-lg access-message-card">
            <q-card-section class="text-center">
              <q-icon name="security" size="3em" color="primary" />
              <div class="text-h5 q-mt-md text-weight-bold">
                {{ customTitle || 'Authentification requise' }}
              </div>
              <div class="text-body1 text-grey-7 q-mt-sm">
                {{ customMessage || 'Vous devez être connecté pour accéder à cette page.' }}
              </div>
            </q-card-section>
          </q-card>

          <!-- Slot pour un composant d'auth personnalisé -->
          <slot name="auth-form" :on-auth-success="handleAuthSuccess">
            <!-- Composant d'auth par défaut -->
            <FirebaseAuthComponent
              @auth-success="handleAuthSuccess"
              @auth-error="handleAuthError"
            />
          </slot>
        </div>
      </q-page>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import type { User } from 'firebase/auth';
import { useAuth } from 'src/stores/auth.store';
import FirebaseAuthComponent from './FirebaseAuthComponent.vue';

// Quasar et Router
const $q = useQuasar();
const router = useRouter();

// Props
interface Props {
  requireAuth?: boolean;
  customTitle?: string;
  customMessage?: string;
  showCustomMessage?: boolean;
  redirectOnAuth?: string;
  requiredRole?: string;
}

const props = withDefaults(defineProps<Props>(), {
  requireAuth: true,
  showCustomMessage: true
});

// Émissions
const emit = defineEmits<{
  authSuccess: [user: User];
  authError: [error: string];
  accessDenied: [reason: string];
}>();

// Utilisation du store d'authentification
const {
  user,
  loading,
  isAuthenticated,
  userProfile,
  initializeAuth,
  hasRole
} = useAuth();

// État local
const accessGranted = ref(true);
const accessError = ref('');

// Méthodes
const checkAccess = async () => {
  if (!props.requireAuth || !isAuthenticated.value) {
    return;
  }

  // Vérification du rôle si requis
  if (props.requiredRole) {
    try {
      const hasRequiredRole = await hasRole(props.requiredRole);
      if (!hasRequiredRole) {
        accessGranted.value = false;
        accessError.value = `Accès refusé : rôle '${props.requiredRole}' requis`;
        emit('accessDenied', accessError.value);

        $q.notify({
          type: 'negative',
          message: accessError.value,
          position: 'top',
          timeout: 5000
        });
        return;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du rôle:', error);
      accessGranted.value = false;
      accessError.value = 'Erreur lors de la vérification des permissions';
      emit('accessDenied', accessError.value);
      return;
    }
  }

  accessGranted.value = true;
};

const handleAuthSuccess = async (user: User) => {
  console.log('✅ Authentification réussie dans AuthGuard:', user.email);

  // Vérifier l'accès après authentification
  await checkAccess();

  // Redirection si spécifiée et accès accordé
  if (props.redirectOnAuth && accessGranted.value) {
    try {
      await router.push(props.redirectOnAuth);
    } catch (error) {
      console.error('❌ Erreur de redirection:', error);
    }
  }

  // Notification de succès
  $q.notify({
    type: 'positive',
    message: `Bienvenue ${user.displayName || user.email} !`,
    position: 'top',
    timeout: 3000,
    actions: [{ icon: 'close', color: 'white' }]
  });

  emit('authSuccess', user);
};

const handleAuthError = (error: string) => {
  console.error('❌ Erreur d\'authentification dans AuthGuard:', error);

  $q.notify({
    type: 'negative',
    message: `Erreur d'authentification: ${error}`,
    position: 'top',
    timeout: 5000,
    actions: [{ icon: 'close', color: 'white' }]
  });

  emit('authError', error);
};

// Lifecycle
onMounted(async () => {
  try {
    await initializeAuth();
    await checkAccess();
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    $q.notify({
      type: 'negative',
      message: 'Erreur lors de l\'initialisation de l\'authentification',
      position: 'top',
      timeout: 5000
    });
  }
});
</script>

<style scoped>
.full-screen-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 9999;
}

.auth-required {
  min-height: 100vh;
}

.auth-container {
  width: 100%;
  max-width: 500px;
  padding: 1rem;
}

.access-message-card {
  max-width: 100%;
}

.access-denied {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.access-denied-card {
  max-width: 400px;
  width: 100%;
}
</style>
