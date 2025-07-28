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
    <template #default="{ user, profile }">
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
                  v-if="!profile?.emailVerified"
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
                <div class="text-h6 q-mb-md flex items-center">
                  <q-icon name="api" class="q-mr-sm" />
                  Endpoint Principal
                </div>

                <q-banner
                  v-if="apiError"
                  class="text-white bg-negative q-mb-md"
                  rounded
                >
                  <template v-slot:avatar>
                    <q-icon name="error" />
                  </template>
                  {{ apiError }}
                </q-banner>

                <q-banner
                  v-if="apiSuccess"
                  class="text-white bg-positive q-mb-md"
                  rounded
                >
                  <template v-slot:avatar>
                    <q-icon name="check_circle" />
                  </template>
                  {{ apiSuccess }}
                </q-banner>

                <div v-if="loadingMain" class="text-center q-py-lg">
                  <q-spinner-dots size="2em" color="primary" />
                  <div class="q-mt-sm text-grey-6">
                    Chargement des données principales...
                  </div>
                </div>

                <div v-else-if="mainData" class="data-display">
                  <q-expansion-item
                    icon="data_object"
                    label="Données JSON"
                    header-class="text-weight-medium"
                  >
                    <q-card>
                      <q-card-section>
                        <pre class="json-display">{{ JSON.stringify(mainData, null, 2) }}</pre>
                      </q-card-section>
                    </q-card>
                  </q-expansion-item>
                </div>

                <q-btn
                  @click="fetchMainData"
                  :loading="loadingMain"
                  color="primary"
                  unelevated
                  no-caps
                  class="full-width"
                  icon="download"
                  :label="loadingMain ? 'Chargement...' : 'Charger les données principales'"
                />
              </q-card-section>
            </q-card>
          </div>

          <!-- Données utilisateur -->
          <div class="col-12 col-md-6">
            <q-card class="data-card">
              <q-card-section>
                <div class="text-h6 q-mb-md flex items-center">
                  <q-icon name="person" class="q-mr-sm" />
                  Profil Utilisateur
                </div>

                <div v-if="loadingUser" class="text-center q-py-lg">
                  <q-spinner-cube size="2em" color="secondary" />
                  <div class="q-mt-sm text-grey-6">
                    Chargement du profil...
                  </div>
                </div>

                <div v-else-if="userData" class="data-display">
                  <q-expansion-item
                    icon="account_box"
                    label="Données utilisateur"
                    header-class="text-weight-medium"
                  >
                    <q-card>
                      <q-card-section>
                        <pre class="json-display">{{ JSON.stringify(userData, null, 2) }}</pre>
                      </q-card-section>
                    </q-card>
                  </q-expansion-item>
                </div>

                <q-btn
                  @click="fetchUserData"
                  :loading="loadingUser"
                  color="secondary"
                  unelevated
                  no-caps
                  class="full-width"
                  icon="person_search"
                  :label="loadingUser ? 'Chargement...' : 'Charger le profil utilisateur'"
                />
              </q-card-section>
            </q-card>
          </div>

          <!-- Informations du token -->
          <div class="col-12">
            <q-card class="data-card">
              <q-card-section>
                <div class="text-h6 q-mb-md flex items-center">
                  <q-icon name="security" class="q-mr-sm" />
                  Informations du Token Firebase
                </div>

                <div v-if="loadingToken" class="text-center q-py-lg">
                  <q-spinner-gears size="2em" color="accent" />
                  <div class="q-mt-sm text-grey-6">
                    Analyse du token...
                  </div>
                </div>

                <div v-else-if="tokenInfo" class="token-info">
                  <div class="row q-gutter-md">
                    <div class="col-12 col-sm-6">
                      <q-list bordered>
                        <q-item>
                          <q-item-section>
                            <q-item-label overline>UID</q-item-label>
                            <q-item-label class="text-weight-medium">
                              {{ tokenInfo.uid }}
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-item>
                          <q-item-section>
                            <q-item-label overline>Email</q-item-label>
                            <q-item-label class="text-weight-medium">
                              {{ tokenInfo.email }}
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-item>
                          <q-item-section>
                            <q-item-label overline>Vérifié</q-item-label>
                            <q-item-label class="text-weight-medium">
                              <q-chip
                                :color="tokenInfo.emailVerified ? 'positive' : 'negative'"
                                text-color="white"
                                size="sm"
                                :icon="tokenInfo.emailVerified ? 'check' : 'close'"
                              >
                                {{ tokenInfo.emailVerified ? 'Oui' : 'Non' }}
                              </q-chip>
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>

                    <div class="col-12 col-sm-6">
                      <q-list bordered>
                        <q-item>
                          <q-item-section>
                            <q-item-label overline>Émis le</q-item-label>
                            <q-item-label class="text-weight-medium">
                              {{ formatDate(tokenInfo.iat) }}
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-item>
                          <q-item-section>
                            <q-item-label overline>Expire le</q-item-label>
                            <q-item-label class="text-weight-medium">
                              {{ formatDate(tokenInfo.exp) }}
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-item>
                          <q-item-section>
                            <q-item-label overline>Provider</q-item-label>
                            <q-item-label class="text-weight-medium">
                              {{ getAuthProvider() }}
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                  </div>

                  <div v-if="tokenInfo.claims && Object.keys(tokenInfo.claims).length > 0" class="q-mt-md">
                    <q-expansion-item
                      icon="admin_panel_settings"
                      label="Claims personnalisés"
                      header-class="text-weight-medium"
                    >
                      <q-card>
                        <q-card-section>
                          <pre class="json-display">{{ JSON.stringify(tokenInfo.claims, null, 2) }}</pre>
                        </q-card-section>
                      </q-card>
                    </q-expansion-item>
                  </div>
                </div>

                <q-btn
                  @click="analyzeToken"
                  :loading="loadingToken"
                  color="accent"
                  unelevated
                  no-caps
                  class="full-width"
                  icon="analytics"
                  :label="loadingToken ? 'Analyse...' : 'Analyser le token'"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Actions rapides -->
        <q-card class="actions-card q-mt-lg" flat>
          <q-card-section>
            <div class="text-h6 q-mb-md text-center">
              Actions rapides
            </div>
            <div class="row q-gutter-sm">
              <div class="col-12 col-sm-4">
                <q-btn
                  @click="testAllEndpoints"
                  :loading="loading"
                  color="primary"
                  unelevated
                  no-caps
                  class="full-width"
                  icon="quiz"
                  label="Tester tous les endpoints"
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-btn
                  @click="clearAllData"
                  color="warning"
                  outline
                  no-caps
                  class="full-width"
                  icon="clear_all"
                  label="Effacer les données"
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-btn
                  @click="exportData"
                  :disable="!hasData"
                  color="positive"
                  outline
                  no-caps
                  class="full-width"
                  icon="file_download"
                  label="Exporter les données"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Statistiques de session -->
        <q-card class="stats-card q-mt-lg" flat>
          <q-card-section>
            <div class="text-h6 q-mb-md text-center">
              📊 Statistiques de session
            </div>
            <div class="row q-gutter-md text-center">
              <div class="col">
                <div class="text-h4 text-primary text-weight-bold">
                  {{ sessionDuration }}
                </div>
                <div class="text-body2 text-grey-6">
                  Temps connecté
                </div>
              </div>
              <div class="col">
                <div class="text-h4 text-secondary text-weight-bold">
                  {{ apiCallsCount }}
                </div>
                <div class="text-body2 text-grey-6">
                  Appels API
                </div>
              </div>
              <div class="col">
                <div class="text-h4 text-accent text-weight-bold">
                  {{ getAuthProvider() }}
                </div>
                <div class="text-body2 text-grey-6">
                  Provider
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-page>
    </template>

    <!-- Composant d'authentification personnalisé -->
    <template #auth-form="{ onAuthSuccess }">
      <FirebaseAuthComponent
        @auth-success="onAuthSuccess"
        @auth-error="handleAuthError"
      />
    </template>
  </AuthGuard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import type { User } from 'firebase/auth';
import AuthGuard from 'src/components/AuthGuard.vue';
import FirebaseAuthComponent from 'src/components/FirebaseAuthComponent.vue';
import { useAuth } from 'src/stores/auth.store';
import ApiService from 'src/services/api.service';

// Quasar
const $q = useQuasar();

// Services
const { user, getIdToken, getUserClaims } = useAuth();
const apiService = new ApiService();

// État local
const loading = ref(false);
const loadingMain = ref(false);
const loadingUser = ref(false);
const loadingToken = ref(false);

const apiError = ref('');
const apiSuccess = ref('');

const mainData = ref(null);
const userData = ref(null);
const tokenInfo = ref<any>(null);

// Session tracking
const sessionStartTime = ref<Date | null>(null);
const apiCallsCount = ref(0);
const sessionTimer = ref<NodeJS.Timeout | null>(null);
const sessionDuration = ref('0m');

// Computed
const hasData = computed(() => {
  return mainData.value || userData.value || tokenInfo.value;
});

// Méthodes utilitaires
const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString('fr-FR');
};

const getAuthProvider = (): string => {
  if (!user.value) return 'Aucun';

  const providerData = user.value.providerData;
  if (providerData.length === 0) return 'Email';

  const providerId = providerData[0].providerId;
  const providerMap: Record<string, string> = {
    'google.com': 'Google',
    'facebook.com': 'Facebook',
    'password': 'Email',
    'phone': 'Téléphone'
  };

  return providerMap[providerId] || providerId;
};

const updateSessionDuration = () => {
  if (!sessionStartTime.value) return;

  const now = new Date();
  const diff = now.getTime() - sessionStartTime.value.getTime();
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  if (minutes > 0) {
    sessionDuration.value = `${minutes}m ${seconds}s`;
  } else {
    sessionDuration.value = `${seconds}s`;
  }
};

const startSessionTimer = () => {
  sessionStartTime.value = new Date();
  sessionTimer.value = setInterval(updateSessionDuration, 1000);
};

const stopSessionTimer = () => {
  if (sessionTimer.value) {
    clearInterval(sessionTimer.value);
    sessionTimer.value = null;
  }
  sessionStartTime.value = null;
  sessionDuration.value = '0m';
};

const clearMessages = () => {
  apiError.value = '';
  apiSuccess.value = '';
};

const showSuccess = (message: string) => {
  clearMessages();
  apiSuccess.value = message;

  $q.notify({
    type: 'positive',
    message,
    position: 'top',
    timeout: 3000,
    actions: [{ icon: 'close', color: 'white' }]
  });

  setTimeout(() => {
    apiSuccess.value = '';
  }, 3000);
};

const showError = (error: string) => {
  clearMessages();
  apiError.value = error;

  $q.notify({
    type: 'negative',
    message: `Erreur: ${error}`,
    position: 'top',
    timeout: 5000,
    actions: [{ icon: 'close', color: 'white' }]
  });
};

// Gestionnaires d'authentification
const handleAuthSuccess = (user: User) => {
  console.log('🎉 Utilisateur authentifié dans la page protégée:', user.email);
  showSuccess(`Bienvenue ${user.displayName || user.email} !`);
  startSessionTimer();

  // Charger les données initiales
  fetchMainData();
  apiCallsCount.value = 0;
};

const handleAuthError = (error: string) => {
  console.error('❌ Erreur d\'authentification:', error);
  showError(error);
};

// Méthodes API
const fetchMainData = async () => {
  loadingMain.value = true;
  clearMessages();

  try {
    const data = await apiService.get('/api/main');
    mainData.value = data;
    console.log('✅ Données principales récupérées:', data);
    showSuccess('Données principales chargées avec succès');
    apiCallsCount.value++;
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des données principales:', error);
    showError(`Erreur API: ${error.message}`);
  } finally {
    loadingMain.value = false;
  }
};

const fetchUserData = async () => {
  loadingUser.value = true;
  clearMessages();

  try {
    const data = await apiService.get('/api/user/profile');
    userData.value = data;
    console.log('✅ Données utilisateur récupérées:', data);
    showSuccess('Profil utilisateur chargé avec succès');
    apiCallsCount.value++;
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des données utilisateur:', error);
    showError(`Erreur API: ${error.message}`);
  } finally {
    loadingUser.value = false;
  }
};

const analyzeToken = async () => {
  loadingToken.value = true;
  clearMessages();

  try {
    const token = await getIdToken();
    if (!token) {
      throw new Error('Aucun token disponible');
    }

    // Décoder le token JWT (partie payload)
    const payload = JSON.parse(atob(token.split('.')[1]));

    // Récupérer les claims personnalisés
    const claims = await getUserClaims();

    tokenInfo.value = {
      uid: payload.user_id,
      email: payload.email,
      emailVerified: payload.email_verified,
      iat: payload.iat,
      exp: payload.exp,
      claims: claims ? Object.fromEntries(
        Object.entries(claims).filter(([key]) =>
          !['iss', 'aud', 'auth_time', 'user_id', 'sub', 'iat', 'exp', 'email', 'email_verified', 'firebase'].includes(key)
        )
      ) : {}
    };

    console.log('✅ Token analysé:', tokenInfo.value);
    showSuccess('Token analysé avec succès');
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'analyse du token:', error);
    showError(`Erreur token: ${error.message}`);
  } finally {
    loadingToken.value = false;
  }
};

const testAllEndpoints = async () => {
  loading.value = true;
  clearMessages();

  try {
    $q.loading.show({
      message: 'Test de tous les endpoints en cours...',
      spinner: 'cube',
      spinnerColor: 'primary'
    });

    console.log('🔄 Test de tous les endpoints...');

    // Test séquentiel de tous les endpoints
    await fetchMainData();
    await fetchUserData();
    await analyzeToken();

    showSuccess('Tous les tests terminés avec succès !');
  } catch (error: any) {
    console.error('❌ Erreur lors des tests:', error);
    showError(`Erreur lors des tests: ${error.message}`);
  } finally {
    loading.value = false;
    $q.loading.hide();
  }
};

const refreshData = async () => {
  await testAllEndpoints();
};

const clearAllData = () => {
  $q.dialog({
    title: 'Confirmer la suppression',
    message: 'Êtes-vous sûr de vouloir effacer toutes les données ?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    mainData.value = null;
    userData.value = null;
    tokenInfo.value = null;
    clearMessages();

    $q.notify({
      type: 'info',
      message: 'Toutes les données ont été effacées',
      position: 'top',
      timeout: 2000
    });

    console.log('🗑️ Toutes les données effacées');
  });
};

const exportData = () => {
  const data = {
    timestamp: new Date().toISOString(),
    session: {
      duration: sessionDuration.value,
      apiCalls: apiCallsCount.value,
      provider: getAuthProvider()
    },
    mainData: mainData.value,
    userData: userData.value,
    tokenInfo: tokenInfo.value
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lookmax-data-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  $q.notify({
    type: 'positive',
    message: 'Données exportées avec succès',
    position: 'top',
    timeout: 2000,
    actions: [{ icon: 'close', color: 'white' }]
  });
};

// Monitoring des appels API
const originalFetch = window.fetch;
window.fetch = (...args) => {
  const url = args[0] as string;
  if (url.includes('/api/') && user.value) {
    // Increment seulement si c'est un vrai appel API utilisateur
    setTimeout(() => {
      apiCallsCount.value++;
    }, 100);
  }
  return originalFetch(...args);
};

// Lifecycle
onMounted(() => {
  console.log('🔍 Page protégée utilisateur montée');

  // Si déjà connecté, démarrer le timer
  if (user.value) {
    startSessionTimer();
  }
});

onUnmounted(() => {
  stopSessionTimer();
  // Restaurer le fetch original
  window.fetch = originalFetch;
});
</script>

<style lang="scss" scoped>
.protected-user-page {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.user-header-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  .q-avatar {
    border: 3px solid rgba(255, 255, 255, 0.3);
  }
}

.data-card {
  height: 100%;

  .json-display {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
    font-size: 0.75rem;
    line-height: 1.4;
    color: #374151;
    max-height: 200px;
    overflow-y: auto;
    margin: 0;
  }
}

.actions-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;

  .text-h6 {
    color: white;
  }
}

.stats-card {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;

  .text-h6 {
    color: white;
  }

  .text-h4 {
    color: white !important;
  }
}

.token-info {
  .q-list {
    border-radius: 8px;
  }

  .q-item {
    min-height: 60px;
  }
}

// Responsive design
@media (max-width: 1024px) {
  .protected-user-page {
    padding: 0.5rem;
  }
}

@media (max-width: 600px) {
  .user-header-card {
    .row {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }

    .q-avatar {
      margin: 0 auto;
    }
  }

  .stats-card {
    .row {
      flex-direction: column;
      gap: 1rem;
    }
  }
}
</style>
