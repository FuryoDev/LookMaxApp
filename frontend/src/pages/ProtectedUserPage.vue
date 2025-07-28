<!-- ProtectedUserPage.vue - Page utilisateur protégée avec Quasar -->
<template>
  <AuthGuard
    :require-auth="true"
    custom-title="Accès au Dashboard LookMax"
    custom-message="Connectez-vous pour accéder à votre espace personnel."
    @auth-success="handleAuthSuccess"
    @auth-error="handleAuthError"
  >
    <!-- Contenu protégé -->
    <template #default="{ profile }">
      <q-page class="protected-user-page">
        <!-- Header utilisateur -->
        <q-card class="user-header-card q-mb-lg" flat>
          <q-card-section>
            <div class="row items-center">
              <div class="col-auto q-mr-md">
                <q-avatar size="80px">
                  <img
                    v-if="profile?.photoURL"
                    :src="profile.photoURL"
                    :alt="profile.displayName || 'Avatar'"
                  />
                  <q-icon
                    v-else
                    name="account_circle"
                    size="80px"
                    color="primary"
                  />
                </q-avatar>
              </div>

              <div class="col">
                <div class="text-h4 text-weight-bold">
                  Bienvenue {{ profile?.displayName || 'Utilisateur' }} !
                </div>
                <div class="text-subtitle1 text-grey-7">
                  {{ profile?.email }}
                </div>
                <q-chip
                  v-if="profile && !profile.emailVerified"
                  color="warning"
                  text-color="white"
                  size="sm"
                  icon="warning"
                >
                  Email non vérifié
                </q-chip>
              </div>

              <div class="col-auto">
                <q-btn
                  @click="refreshData"
                  :loading="loading"
                  color="primary"
                  outline
                  no-caps
                  icon="refresh"
                  label="Actualiser"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Grille de données API -->
        <div class="row q-gutter-lg">
          <!-- Données principales -->
          <div class="col-12 col-md-6">
            <q-card class="data-card">
              <q-card-section>
                <div class="text-h6 q-mb-md">
                  <q-icon name="api" class="q-mr-sm" />
                  Données API principales
                </div>

                <div v-if="mainData" class="data-content">
                  <pre>{{ JSON.stringify(mainData, null, 2) }}</pre>
                </div>
                <div v-else class="text-center q-pa-md text-grey-6">
                  <q-spinner-dots size="40px" />
                  <div class="q-mt-sm">Chargement des données...</div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Données utilisateur -->
          <div class="col-12 col-md-6">
            <q-card class="data-card">
              <q-card-section>
                <div class="text-h6 q-mb-md">
                  <q-icon name="person" class="q-mr-sm" />
                  Profil utilisateur
                </div>

                <div v-if="userData" class="data-content">
                  <q-list>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>UID</q-item-label>
                        <q-item-label>{{ userData.uid }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Email</q-item-label>
                        <q-item-label>{{ userData.email }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Nom</q-item-label>
                        <q-item-label>{{ userData.name || 'Non défini' }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Rôles</q-item-label>
                        <q-item-label>
                          <q-chip
                            v-for="(auth, index) in userData.authorities"
                            :key="index"
                            size="sm"
                            color="primary"
                          >
                            {{ auth.authority }}
                          </q-chip>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
                <div v-else class="text-center q-pa-md">
                  <q-btn
                    @click="fetchUserData"
                    color="primary"
                    icon="download"
                    label="Charger le profil"
                    no-caps
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Informations du token -->
          <div class="col-12">
            <q-card class="data-card">
              <q-card-section>
                <div class="text-h6 q-mb-md">
                  <q-icon name="key" class="q-mr-sm" />
                  Informations du token JWT
                </div>

                <div v-if="tokenInfo" class="data-content">
                  <pre>{{ JSON.stringify(tokenInfo, null, 2) }}</pre>
                </div>
                <div v-else class="text-center q-pa-md">
                  <q-btn
                    @click="analyzeToken"
                    color="secondary"
                    icon="visibility"
                    label="Analyser le token"
                    no-caps
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Actions de test -->
          <div class="col-12">
            <q-card class="action-card">
              <q-card-section>
                <div class="text-h6 q-mb-md">
                  <q-icon name="science" class="q-mr-sm" />
                  Actions de test
                </div>

                <div class="row q-gutter-sm">
                  <q-btn
                    @click="testAllEndpoints"
                    color="positive"
                    icon="play_arrow"
                    label="Tester tous les endpoints"
                    no-caps
                  />

                  <q-btn
                    @click="clearData"
                    color="negative"
                    icon="clear"
                    label="Effacer les données"
                    no-caps
                    outline
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Statistiques de session -->
        <q-page-sticky position="bottom-right" :offset="[18, 18]">
          <q-card class="session-stats">
            <q-card-section class="q-pa-sm">
              <div class="text-caption text-grey-7">Session active</div>
              <div class="text-subtitle2">{{ sessionDuration }}</div>
              <q-linear-progress
                :value="apiCallsCount / 10"
                color="primary"
                class="q-mt-sm"
              />
              <div class="text-caption text-grey-6 q-mt-xs">
                {{ apiCallsCount }} appels API
              </div>
            </q-card-section>
          </q-card>
        </q-page-sticky>
      </q-page>
    </template>
  </AuthGuard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import type { User } from 'firebase/auth';
import { useAuth } from 'stores/auth.store';
import { apiService } from 'src/services/api.service';
import AuthGuard from 'src/components/AuthGuard.vue';

// Types
interface MainData {
  message: string;
  timestamp: number;
}

interface UserData {
  uid: string;
  email: string;
  name: string;
  authorities: Array<{ authority: string }>;
}

interface TokenInfo {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  claims: Record<string, unknown>;
  provider: string;
  expiresAt: string;
}

// Composables
const $q = useQuasar();

// Services
const { getIdToken } = useAuth();

// État local
const loading = ref(false);
const mainData = ref<MainData | null>(null);
const userData = ref<UserData | null>(null);
const tokenInfo = ref<TokenInfo | null>(null);

// Session tracking
const sessionStartTime = ref<Date | null>(null);
const sessionTimer = ref<NodeJS.Timeout | null>(null);
const sessionDuration = ref('00:00');
const apiCallsCount = ref(0);

// Computed
const currentUser = computed(() => {
  const auth = useAuth();
  return auth.user;
});

const getAuthProvider = (): string => {
  if (!currentUser.value) return 'Aucun';

  const user = currentUser.value as User;
  const providerData = user.providerData;
  if (providerData.length === 0) return 'Email';

  const providerId = providerData[0].providerId;

  switch (providerId) {
    case 'google.com': return 'Google';
    case 'facebook.com': return 'Facebook';
    case 'password': return 'Email/Password';
    default: return providerId;
  }
};

// Méthodes
const showError = (message: string) => {
  $q.notify({
    type: 'negative',
    message,
    position: 'top',
    timeout: 5000
  });
};

const showSuccess = (message: string) => {
  $q.notify({
    type: 'positive',
    message,
    position: 'top',
    timeout: 3000
  });
};

const startSessionTimer = () => {
  sessionStartTime.value = new Date();

  sessionTimer.value = setInterval(() => {
    if (sessionStartTime.value) {
      const now = new Date();
      const diff = now.getTime() - sessionStartTime.value.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      sessionDuration.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }, 1000);
};

const refreshData = () => {
  clearData();
  void fetchMainData();
  apiCallsCount.value = 0;
};

const fetchMainData = async () => {
  loading.value = true;

  try {
    console.log('📡 Récupération des données principales...');
    mainData.value = await apiService.getMainData();
    console.log('✅ Données principales récupérées:', mainData.value);
    showSuccess('Données principales chargées avec succès');
    apiCallsCount.value++;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des données principales:', error);
    showError(`Erreur API: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  } finally {
    loading.value = false;
  }
};

const fetchUserData = async () => {
  loading.value = true;

  try {
    console.log('👤 Récupération du profil utilisateur...');
    userData.value = await apiService.getUserProfile();
    console.log('✅ Profil utilisateur récupéré:', userData.value);
    showSuccess('Profil utilisateur chargé avec succès');
    apiCallsCount.value++;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des données utilisateur:', error);
    showError(`Erreur API: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  } finally {
    loading.value = false;
  }
};

const analyzeToken = async () => {
  loading.value = true;

  try {
    console.log('🔍 Analyse du token JWT...');
    const token = await getIdToken();

    if (!token) {
      throw new Error('Aucun token disponible');
    }

    // Décoder le token JWT (partie payload)
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Token JWT invalide');
    }

    const payload = JSON.parse(atob(parts[1]));

    tokenInfo.value = {
      header: JSON.parse(atob(parts[0])),
      payload,
      claims: payload,
      provider: getAuthProvider(),
      expiresAt: new Date(payload.exp * 1000).toLocaleString()
    };

    console.log('✅ Token analysé:', tokenInfo.value);
    showSuccess('Token analysé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse du token:', error);
    showError(`Erreur token: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  } finally {
    loading.value = false;
  }
};

const testAllEndpoints = async () => {
  loading.value = true;

  try {
    $q.loading.show({
      message: 'Test de tous les endpoints en cours...',
      spinner: $q.spinners.cube,
      spinnerColor: 'primary'
    });

    await fetchMainData();
    await fetchUserData();
    await analyzeToken();

    // Test de l'endpoint test-auth
    const authTest = await apiService.testAuth();
    console.log('✅ Test auth:', authTest);

    showSuccess('Tous les tests terminés avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    showError(`Erreur lors des tests: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  } finally {
    loading.value = false;
    $q.loading.hide();
  }
};

const clearData = () => {
  mainData.value = null;
  userData.value = null;
  tokenInfo.value = null;
};

const handleAuthSuccess = (user: User) => {
  console.log('✅ Authentification réussie dans ProtectedUserPage:', user.email);
  startSessionTimer();
  void refreshData();
};

const handleAuthError = (error: string) => {
  console.error('❌ Erreur d\'authentification dans ProtectedUserPage:', error);
  showError(`Erreur d\'authentification: ${error}`);
};

// Lifecycle
onMounted(() => {
  console.log('🚀 ProtectedUserPage montée');

  // Intercepter les appels fetch pour compter les requêtes API
  const originalFetch = window.fetch;
  window.fetch = (...args) => {
    const url = args[0] as string;
    if (url.includes('/api/') && currentUser.value) {
      // Increment seulement si c'est un vrai appel API utilisateur
      setTimeout(() => {
        apiCallsCount.value++;
      }, 100);
    }
    return originalFetch(...args);
  };

  // Si déjà connecté, démarrer le timer
  if (currentUser.value) {
    startSessionTimer();
  }
});

onUnmounted(() => {
  if (sessionTimer.value) {
    clearInterval(sessionTimer.value);
  }
});
</script>

<style lang="scss" scoped>
.protected-user-page {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.user-header-card {
  background: linear-gradient(135deg, $primary 0%, $secondary 100%);
  color: white;

  .q-avatar {
    border: 3px solid white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
}

.data-card,
.action-card {
  height: 100%;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .data-content {
    max-height: 300px;
    overflow-y: auto;

    pre {
      background: rgba(0, 0, 0, 0.05);
      padding: 1rem;
      border-radius: 4px;
      font-size: 0.85em;
      margin: 0;
    }
  }
}

.session-stats {
  min-width: 180px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

// Dark mode adjustments
.body--dark {
  .user-header-card {
    background: linear-gradient(135deg, darken($primary, 20%) 0%, darken($secondary, 20%) 100%);
  }

  .data-card,
  .action-card {
    background: $dark;

    .data-content pre {
      background: rgba(255, 255, 255, 0.05);
    }
  }

  .session-stats {
    background: rgba(18, 18, 18, 0.95);
  }
}
</style>
