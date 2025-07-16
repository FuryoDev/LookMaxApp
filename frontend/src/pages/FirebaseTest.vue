<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <!-- Section d'authentification -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">🔐 Authentification Firebase</div>
            <div class="q-mt-md">
              <div v-if="!user">
                <q-input
                  v-model="email"
                  label="Email"
                  type="email"
                  outlined
                  dense
                  class="q-mb-md"
                />
                <q-input
                  v-model="password"
                  label="Mot de passe"
                  type="password"
                  outlined
                  dense
                  class="q-mb-md"
                />
                <q-btn
                  @click="signIn"
                  color="primary"
                  :loading="authLoading"
                  label="🔑 Se connecter"
                  class="q-mr-sm"
                />
                <q-btn
                  @click="signUp"
                  color="secondary"
                  :loading="authLoading"
                  label="📝 S'inscrire"
                  outline
                />
              </div>
              <div v-else>
                <div class="text-positive">
                  <q-icon name="check_circle" class="q-mr-sm" />
                  Connecté en tant que: {{ user.email }}
                </div>
                <q-btn
                  @click="signOut"
                  color="negative"
                  :loading="authLoading"
                  label="🚪 Se déconnecter"
                  class="q-mt-sm"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Section de diagnostic réseau -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">🔍 Diagnostic Réseau Backend</div>
            <div class="q-mt-md">
              <div><strong>Backend URL:</strong> {{ backendUrl }}</div>
              <div><strong>Status:</strong> {{ networkStatus }}</div>
              <div><strong>Utilisateur:</strong> {{ user ? user.email : 'Non connecté' }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Boutons de test -->
      <div class="col-12">
        <div class="q-gutter-sm">
          <q-btn
            @click="testBackendConnection"
            color="primary"
            :loading="loading"
            label="🔍 Test Connexion Backend"
            class="full-width"
          />
          <q-btn
            @click="testHealthEndpoint"
            color="secondary"
            :loading="loading"
            label="🏥 Test Health Endpoint"
            class="full-width"
          />
          <q-btn
            @click="testCorsEndpoint"
            color="orange"
            :loading="loading"
            label="🌍 Test CORS"
            class="full-width"
          />
          <q-btn
            @click="testMainEndpoint"
            color="green"
            :loading="loading"
            label="🎯 Test Main Endpoint (Authentifié)"
            class="full-width"
            :disable="!user"
          />
        </div>
      </div>

      <!-- Résultats -->
      <div class="col-12" v-if="results.length > 0">
        <q-card>
          <q-card-section>
            <div class="text-h6">📋 Résultats des Tests</div>
            <div class="q-mt-md">
              <div v-for="(result, index) in results" :key="index" class="q-mb-md">
                <q-card :class="result.success ? 'bg-positive' : 'bg-negative'" class="text-white">
                  <q-card-section>
                    <div class="text-h6">{{ result.success ? '✅' : '❌' }} {{ result.test }}</div>
                    <div>{{ result.message }}</div>
                    <div v-if="result.data" class="q-mt-sm">
                      <strong>Données:</strong> {{ result.data }}
                    </div>
                    <details v-if="result.details" class="q-mt-sm">
                      <summary>Détails techniques</summary>
                      <pre>{{ result.details }}</pre>
                    </details>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { AuthService, type AuthUser } from 'src/services/auth.service';

// Types
interface TestResult {
  test: string;
  success: boolean;
  message: string;
  data?: string | undefined;
  details?: string | undefined;
}

// Reactive data
const backendUrl = ref(import.meta.env.VITE_SPRING_BOOT_API_URL || 'http://localhost:8080');
const networkStatus = ref('Non testé');
const loading = ref(false);
const authLoading = ref(false);
const results = ref<TestResult[]>([]);

// Auth data
const user = ref<AuthUser | null>(null);
const email = ref('test@gmail.com');
const password = ref('mdp1234');

// Méthodes d'authentification
const signIn = async () => {
  authLoading.value = true;
  try {
    await AuthService.signIn(email.value, password.value);
    console.log('✅ Connexion réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    addResult(
      'Connexion',
      false,
      'Erreur de connexion',
      undefined,
      String(error)
    );
  } finally {
    authLoading.value = false;
  }
};

const signUp = async () => {
  authLoading.value = true;
  try {
    await AuthService.signUp(email.value, password.value);
    console.log('✅ Inscription réussie');
  } catch (error) {
    console.error('❌ Erreur d\'inscription:', error);
    addResult(
      'Inscription',
      false,
      'Erreur d\'inscription',
      undefined,
      String(error)
    );
  } finally {
    authLoading.value = false;
  }
};

const signOut = async () => {
  authLoading.value = true;
  try {
    await AuthService.signOut();
    console.log('✅ Déconnexion réussie');
  } catch (error) {
    console.error('❌ Erreur de déconnexion:', error);
  } finally {
    authLoading.value = false;
  }
};

// Méthode pour ajouter un résultat
const addResult = (test: string, success: boolean, message: string, data?: string, details?: string) => {
  const result: TestResult = {
    test,
    success,
    message,
    data: data ?? undefined,
    details: details ?? undefined
  };

  results.value.unshift(result);

  // Garder seulement les 5 derniers résultats
  if (results.value.length > 5) {
    results.value = results.value.slice(0, 5);
  }
};

// Méthodes de test
const testBackendConnection = async () => {
  loading.value = true;
  networkStatus.value = 'Test de connexion...';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${backendUrl.value}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      networkStatus.value = 'Backend accessible ✅';
      addResult(
        'Connexion Backend',
        true,
        'Backend accessible et répond correctement',
        JSON.stringify(data, null, 2)
      );
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    networkStatus.value = 'Backend inaccessible ❌';

    let errorMessage = 'Erreur inconnue';
    let errorDetails = '';

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Timeout - Backend ne répond pas dans les 5 secondes';
        errorDetails = 'Le backend n\'est probablement pas démarré ou bloqué';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Erreur réseau - Backend inaccessible';
        errorDetails = 'Vérifiez que le backend est démarré sur le port 8080';
      } else {
        errorMessage = error.message;
        errorDetails = error.toString();
      }
    }

    addResult(
      'Connexion Backend',
      false,
      errorMessage,
      undefined,
      errorDetails
    );
  } finally {
    loading.value = false;
  }
};

const testHealthEndpoint = async () => {
  loading.value = true;

  try {
    const response = await fetch(`${backendUrl.value}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      addResult(
        'Health Endpoint',
        true,
        'Endpoint /api/health fonctionne',
        JSON.stringify(data, null, 2)
      );
    } else {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  } catch (error) {
    addResult(
      'Health Endpoint',
      false,
      'Endpoint /api/health échoue',
      undefined,
      String(error)
    );
  } finally {
    loading.value = false;
  }
};

const testCorsEndpoint = async () => {
  loading.value = true;

  try {
    console.log('🌍 Testing CORS endpoint...');

    const response = await fetch(`${backendUrl.value}/api/cors-test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);

    if (response.ok) {
      // Vérifier d'abord si la réponse a du contenu
      const contentType = response.headers.get('Content-Type');
      console.log('📡 Content-Type:', contentType);

      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        console.log('📡 Raw response:', text);

        if (text.trim() === '') {
          throw new Error('Empty response body');
        }

        try {
          const data = JSON.parse(text);
          addResult(
            'CORS Test',
            true,
            'CORS test réussi',
            JSON.stringify(data, null, 2),
            `Status: ${response.status}\nContent-Type: ${contentType}`
          );
        } catch (parseError) {
          // ✅ CORRECTION - Gestion sécurisée du type unknown
          const errorMessage = getErrorMessage(parseError);
          throw new Error(`JSON parse error: ${errorMessage}\nRaw response: ${text}`);
        }
      } else {
        // Si ce n'est pas du JSON, lire comme texte
        const text = await response.text();
        addResult(
          'CORS Test',
          true,
          'CORS test réussi (non-JSON)',
          text,
          `Status: ${response.status}\nContent-Type: ${contentType}`
        );
      }
    } else {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error('❌ CORS Test Error:', error);
    addResult(
      'CORS Test',
      false,
      'CORS test échoué',
      undefined,
      getErrorMessage(error) // ✅ Utilisation de la fonction helper
    );
  } finally {
    loading.value = false;
  }
};

const testMainEndpoint = async () => {
  loading.value = true;

  try {
    // Récupérer le token Firebase
    const token = await AuthService.getIdToken();
    if (!token) {
      throw new Error('Pas de token Firebase disponible');
    }

    const response = await fetch(`${backendUrl.value}/api/main`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      addResult(
        'Main Endpoint',
        true,
        'Endpoint /api/main fonctionne avec authentification',
        JSON.stringify(data, null, 2)
      );
    } else {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  } catch (error) {
    addResult(
      'Main Endpoint',
      false,
      'Endpoint /api/main échoue',
      undefined,
      String(error)
    );
  } finally {
    loading.value = false;
  }
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as Error).message);
  }
  return 'Unknown error occurred';
};

// Lifecycle
onMounted(() => {
  console.log('🔍 Diagnostic réseau prêt');
  console.log('Backend URL:', backendUrl.value);
  console.log('Frontend URL:', window.location.origin);

  // Écouter les changements d'authentification
  AuthService.onAuthStateChanged((authUser) => {
    user.value = authUser;
    console.log('🔐 Auth state changed:', authUser ? authUser.email : 'Non connecté');
  });
});
</script>

<style scoped>
pre {
  background-color: rgba(0,0,0,0.2);
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 11px;
  max-height: 150px;
  overflow-y: auto;
}

details {
  margin-top: 8px;
}

summary {
  cursor: pointer;
  font-weight: bold;
}
</style>
