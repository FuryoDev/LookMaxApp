<template>
  <q-page>
    <div class="q-pa-md">
      <h4>Test Firebase Configuration</h4>

      <div class="q-mb-md">
        <q-card>
          <q-card-section>
            <div class="text-h6">Variables d'environnement</div>
            <div class="q-mt-md">
              <div v-for="(value, key) in envVars" :key="key" class="q-mb-sm">
                <strong>{{ key }}:</strong>
                <span :class="value.startsWith('MISSING_') ? 'text-negative' : 'text-positive'">
                {{ value.startsWith('MISSING_') ? 'MANQUANT' : 'DÉFINI' }}
              </span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="q-mb-md">
        <q-btn
          @click="testFirebaseConnection"
          color="primary"
          :loading="loading"
          :disable="hasMissingVars"
          label="Test Firebase Connection"
        />
      </div>

      <div v-if="result" class="q-mt-md">
        <q-card :class="result.success ? 'bg-positive' : 'bg-negative'">
          <q-card-section class="text-white">
            <div class="text-h6">{{ result.success ? 'Succès' : 'Erreur' }}</div>
            <div>{{ result.message }}</div>
            <div v-if="result.details" class="q-mt-sm">
              <details>
                <summary>Détails</summary>
                <pre>{{ result.details }}</pre>
              </details>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>

</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { auth } from 'src/boot/firebase';

const loading = ref(false);
const result = ref<{ success: boolean, message: string, details?: string } | null>(null);

const envVars = computed(() => ({
  'VITE_FIREBASE_API_KEY': process.env.VITE_FIREBASE_API_KEY || 'MISSING_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN': process.env.VITE_FIREBASE_AUTH_DOMAIN || 'MISSING_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID': process.env.VITE_FIREBASE_PROJECT_ID || 'MISSING_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET': process.env.VITE_FIREBASE_STORAGE_BUCKET || 'MISSING_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID': process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'MISSING_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID': process.env.VITE_FIREBASE_APP_ID || 'MISSING_APP_ID'
}));

const hasMissingVars = computed(() => {
  return Object.values(envVars.value).some(value => value.startsWith('MISSING_'));
});

const testFirebaseConnection = async () => {
  loading.value = true;
  result.value = null;

  try {
    // Test simple de connexion Firebase
    if (auth) {
      await auth.authStateReady();
      result.value = {
        success: true,
        message: 'Firebase connecté avec succès!',
        details: `Project ID: ${auth.app.options.projectId}`
      };
    } else {
      throw new Error('Firebase auth not initialized');
    }
  } catch (error: any) {
    result.value = {
      success: false,
      message: 'Erreur de connexion Firebase',
      details: error.message || error.toString()
    };
  } finally {
    loading.value = false;
  }
};
</script>
