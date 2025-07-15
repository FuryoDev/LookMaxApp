// Remplacez temporairement UserPage.vue par ce code de diagnostic
<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">🔍 Diagnostic Réseau Backend</div>
            <div class="q-mt-md">
              <div><strong>Backend URL:</strong> {{ backendUrl }}</div>
              <div><strong>Status:</strong> {{ networkStatus }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

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
            label="🎯 Test Main Endpoint"
            class="full-width"
          />
        </div>
      </div>

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

const backendUrl = ref('http://localhost:8080');
const networkStatus = ref('Non testé');
const loading = ref(false);
const results = ref<Array<{
  test: string;
  success: boolean;
  message: string;
  data?: string;
  details?: string;
}>>([]);

const addResult = (test: string, success: boolean, message: string, data?: string, details?: string) => {
  results.value.unshift({
    test,
    success,
    message,
    data,
    details
  });

  // Garder seulement les 5 derniers résultats
  if (results.value.length > 5) {
    results.value = results.value.slice(0, 5);
  }
};

const testBackendConnection = async () => {
  loading.value = true;
  networkStatus.value = 'Test de connexion...';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes timeout

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
  } catch (error: any) {
    networkStatus.value = 'Backend inaccessible ❌';

    let errorMessage = 'Erreur inconnue';
    let errorDetails = '';

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
  } catch (error: any) {
    addResult(
      'Health Endpoint',
      false,
      'Endpoint /api/health échoue',
      undefined,
      error.toString()
    );
  } finally {
    loading.value = false;
  }
};

const testCorsEndpoint = async () => {
  loading.value = true;

  try {
    // Test preflight OPTIONS
    const response = await fetch(`${backendUrl.value}/api/cors-test`, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    addResult(
      'CORS Test',
      response.ok,
      `CORS preflight ${response.ok ? 'réussi' : 'échoué'}`,
      `Status: ${response.status}`,
      `Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`
    );
  } catch (error: any) {
    addResult(
      'CORS Test',
      false,
      'CORS preflight échoué',
      undefined,
      error.toString()
    );
  } finally {
    loading.value = false;
  }
};

const testMainEndpoint = async () => {
  loading.value = true;

  try {
    const response = await fetch(`${backendUrl.value}/api/main`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.text();
      addResult(
        'Main Endpoint',
        true,
        'Endpoint /api/main fonctionne',
        data
      );
    } else {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  } catch (error: any) {
    addResult(
      'Main Endpoint',
      false,
      'Endpoint /api/main échoue',
      undefined,
      error.toString()
    );
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  console.log('🔍 Diagnostic réseau prêt');
  console.log('Backend URL:', backendUrl.value);
  console.log('Frontend URL:', window.location.origin);
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
