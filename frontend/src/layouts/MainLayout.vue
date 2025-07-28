<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <!-- Logo/Titre -->
        <q-toolbar-title class="flex items-center">
          <q-icon name="camera" size="sm" class="q-mr-sm" />
          LookMax App
        </q-toolbar-title>

        <!-- Informations utilisateur ou bouton de connexion -->
        <div class="flex items-center q-gutter-sm">
          <!-- Version Quasar -->
          <q-chip outline color="white" text-color="white" size="sm">
            Quasar v{{ $q.version }}
          </q-chip>

          <!-- Menu utilisateur si connecté -->
          <div v-if="isAuthenticated" class="flex items-center q-gutter-sm">
            <!-- Avatar et menu utilisateur -->
            <q-btn-dropdown
              flat
              round
              :icon="userProfile?.photoURL ? undefined : 'account_circle'"
              size="md"
            >
              <!-- Avatar personnalisé si disponible -->
              <template v-if="userProfile?.photoURL" v-slot:label>
                <q-avatar size="32px">
                  <img :src="userProfile.photoURL" :alt="userProfile.displayName || 'Avatar'">
                </q-avatar>
              </template>

              <!-- Menu déroulant -->
              <q-list>
                <q-item clickable v-close-popup @click="goToProfile">
                  <q-item-section avatar>
                    <q-icon name="person" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Mon profil</q-item-label>
                    <q-item-label caption>{{ userProfile?.email }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="goToSettings">
                  <q-item-section avatar>
                    <q-icon name="settings" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Paramètres</q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item clickable v-close-popup @click="handleLogout">
                  <q-item-section avatar>
                    <q-icon name="logout" color="negative" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-negative">Se déconnecter</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>

          <!-- Bouton de connexion si non connecté -->
          <q-btn
            v-else
            flat
            no-caps
            label="Se connecter"
            icon="login"
            @click="showAuthDialog = true"
            class="text-white"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Footer avec navigation -->
    <q-footer>
      <q-tabs
        v-model="activeTab"
        class="text-white bg-primary"
        active-color="white"
        indicator-color="white"
        align="justify"
      >
        <q-route-tab
          name="index"
          to="/index"
          icon="camera"
          label="Accueil"
        />

        <!-- Onglets protégés -->
        <q-route-tab
          v-if="isAuthenticated"
          name="user"
          to="/user"
          icon="person"
          label="Profile"
        />

        <q-route-tab
          name="firebase"
          to="/firebase"
          icon="whatshot"
          label="Firebase"
        />

        <!-- Onglet d'authentification si non connecté -->
        <q-tab
          v-if="!isAuthenticated"
          name="auth"
          icon="login"
          label="Connexion"
          @click="showAuthDialog = true"
        />

        <q-route-tab
          name="error"
          to="/error"
          icon="error"
          label="Test"
        />
      </q-tabs>
    </q-footer>

    <!-- Dialog d'authentification -->
    <q-dialog v-model="showAuthDialog" persistent>
      <div style="min-width: 350px;">
        <FirebaseAuthComponent
          @auth-success="handleAuthSuccess"
          @auth-error="handleAuthError"
        />

        <!-- Bouton pour fermer le dialog -->
        <div class="text-center q-pa-md">
          <q-btn
            flat
            label="Fermer"
            color="grey-7"
            @click="showAuthDialog = false"
          />
        </div>
      </div>
    </q-dialog>

    <!-- Dialog de confirmation de déconnexion -->
    <q-dialog v-model="showLogoutDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="logout" size="2em" color="primary" class="q-mr-md" />
          <div>
            <div class="text-h6">Confirmer la déconnexion</div>
            <div class="text-body2 text-grey-7">
              Êtes-vous sûr de vouloir vous déconnecter ?
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annuler" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Se déconnecter"
            color="negative"
            @click="confirmLogout"
            :loading="loggingOut"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import type { User } from 'firebase/auth';
import { useAuth } from 'stores/auth.store';
import FirebaseAuthComponent from 'src/components/FirebaseAuthComponent.vue';

// Composables
const route = useRoute();
const router = useRouter();
const $q = useQuasar();

// Store d'authentification
const {
  user,
  isAuthenticated,
  userProfile,
  logout,
  initializeAuth
} = useAuth();

// État local
const activeTab = ref('index');
const showAuthDialog = ref(false);
const showLogoutDialog = ref(false);
const loggingOut = ref(false);

// Computed
const displayName = computed(() => {
  return userProfile.value?.displayName || userProfile.value?.email?.split('@')[0] || 'Utilisateur';
});

// Méthodes
const updateActiveTab = () => {
  const path = route.path;

  if (path === '/' || path === '/index') {
    activeTab.value = 'index';
  } else if (path === '/user') {
    activeTab.value = 'user';
  } else if (path === '/firebase') {
    activeTab.value = 'firebase';
  } else if (path === '/error') {
    activeTab.value = 'error';
  }
};

const handleAuthSuccess = (authUser: User) => {
  console.log('✅ Connexion réussie dans MainLayout:', authUser.email);

  showAuthDialog.value = false;

  $q.notify({
    type: 'positive',
    message: `Bienvenue ${authUser.displayName || authUser.email} !`,
    position: 'top',
    timeout: 3000,
    actions: [{ icon: 'close', color: 'white' }]
  });

  // Rediriger vers le profil si c'est la première connexion
  if (route.path === '/' || route.path === '/index') {
    router.push('/user');
  }
};

const handleAuthError = (error: string) => {
  console.error('❌ Erreur d\'authentification dans MainLayout:', error);

  $q.notify({
    type: 'negative',
    message: `Erreur de connexion: ${error}`,
    position: 'top',
    timeout: 5000,
    actions: [{ icon: 'close', color: 'white' }]
  });
};

const handleLogout = () => {
  showLogoutDialog.value = true;
};

const confirmLogout = async () => {
  loggingOut.value = true;

  try {
    await logout();
    showLogoutDialog.value = false;

    $q.notify({
      type: 'info',
      message: 'Déconnexion réussie',
      position: 'top',
      timeout: 2000
    });

    // Rediriger vers l'accueil si on était sur une page protégée
    if (route.path === '/user') {
      router.push('/index');
    }
  } catch (error) {
    console.error('❌ Erreur de déconnexion:', error);

    $q.notify({
      type: 'negative',
      message: 'Erreur lors de la déconnexion',
      position: 'top',
      timeout: 3000
    });
  } finally {
    loggingOut.value = false;
  }
};

const goToProfile = () => {
  router.push('/user');
};

const goToSettings = () => {
  // TODO: Créer une page de paramètres
  $q.notify({
    type: 'info',
    message: 'Page de paramètres à venir...',
    position: 'top',
    timeout: 2000
  });
};

// Watchers
watch(() => route.path, updateActiveTab);

// Initialisation
updateActiveTab();

// Initialiser l'authentification au démarrage
initializeAuth().catch(error => {
  console.error('❌ Erreur d\'initialisation de l\'auth:', error);
});
</script>

<style scoped>
.q-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.q-toolbar {
  min-height: 56px;
}

/* Style pour l'avatar dans le menu */
.q-avatar img {
  object-fit: cover;
}

/* Animation pour les transitions */
.q-tab {
  transition: all 0.3s ease;
}

.q-tab:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .q-toolbar-title {
    font-size: 1.1rem;
  }

  .q-chip {
    display: none; /* Masquer la version Quasar sur mobile */
  }
}
</style>
