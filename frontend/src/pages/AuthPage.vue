<!-- AuthPage.vue - Page dédiée à l'authentification -->
<template>
  <q-page class="auth-page">
    <div class="auth-container">
      <!-- Header de la page -->
      <div class="auth-page-header text-center q-mb-xl">
        <q-icon name="security" size="4em" color="primary" />
        <div class="text-h3 text-weight-bold q-mt-md">
          Bienvenue sur LookMax
        </div>
        <div class="text-h6 text-grey-7 q-mt-sm">
          Connectez-vous pour accéder à toutes les fonctionnalités
        </div>
      </div>

      <!-- Composant d'authentification -->
      <div class="auth-form-container">
        <FirebaseAuthComponent
          @auth-success="handleAuthSuccess"
          @auth-error="handleAuthError"
        />
      </div>

      <!-- Fonctionnalités après connexion -->
      <q-card class="features-card q-mt-xl" flat bordered>
        <q-card-section>
          <div class="text-h6 text-center q-mb-md text-weight-medium">
            🚀 Que pouvez-vous faire après connexion ?
          </div>

          <q-list>
            <q-item>
              <q-item-section avatar>
                <q-icon name="camera_alt" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">Photo Analysis</q-item-label>
                <q-item-label caption>
                  Analysez vos photos avec notre IA avancée
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="person" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">Profil personnalisé</q-item-label>
                <q-item-label caption>
                  Gérez vos préférences et historique
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="sync" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">Synchronisation cloud</q-item-label>
                <q-item-label caption>
                  Vos données accessibles partout
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="security" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">Sécurité renforcée</q-item-label>
                <q-item-label caption>
                  Protection de vos données personnelles
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Informations techniques -->
      <q-card class="tech-info-card q-mt-lg" flat>
        <q-card-section>
          <div class="text-center">
            <div class="text-subtitle2 text-grey-6 q-mb-sm">
              Sécurisé par Firebase Authentication
            </div>
            <div class="tech-badges">
              <q-chip
                v-for="tech in techStack"
                :key="tech.name"
                :color="tech.color"
                text-color="white"
                size="sm"
                :icon="tech.icon"
              >
                {{ tech.name }}
              </q-chip>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import type { User } from 'firebase/auth';
import FirebaseAuthComponent from 'src/components/FirebaseAuthComponent.vue';

// Composables
const router = useRouter();
const $q = useQuasar();

// Données
const techStack = ref([
  { name: 'Vue.js 3', color: 'green', icon: 'code' },
  { name: 'Quasar', color: 'blue', icon: 'dashboard' },
  { name: 'Firebase', color: 'orange', icon: 'whatshot' },
  { name: 'Spring Boot', color: 'green-8', icon: 'settings' },
  { name: 'JWT', color: 'purple', icon: 'security' }
]);

// Méthodes
const handleAuthSuccess = (user: User) => {
  console.log('✅ Authentification réussie sur AuthPage:', user.email);

  // Notification de succès
  $q.notify({
    type: 'positive',
    message: `Bienvenue ${user.displayName || user.email} !`,
    position: 'top',
    timeout: 3000,
    actions: [{ icon: 'close', color: 'white' }]
  });

  // Animation de succès
  $q.loading.show({
    message: 'Connexion en cours...',
    spinner: $q.iconSet.type.positive,
    spinnerColor: 'positive'
  });

  // Redirection après un court délai
  setTimeout(() => {
    $q.loading.hide();
    router.push('/user'); // Rediriger vers le profil utilisateur
  }, 1500);
};

const handleAuthError = (error: string) => {
  console.error('❌ Erreur d\'authentification sur AuthPage:', error);

  $q.notify({
    type: 'negative',
    message: `Erreur de connexion: ${error}`,
    position: 'top',
    timeout: 5000,
    actions: [{ icon: 'close', color: 'white' }]
  });
};
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.auth-container {
  width: 100%;
  max-width: 500px;
}

.auth-page-header {
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.auth-form-container {
  display: flex;
  justify-content: center;
}

.features-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tech-info-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.tech-badges {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

// Responsive design
@media (max-width: 600px) {
  .auth-page {
    padding: 1rem 0.5rem;
  }

  .auth-container {
    max-width: 100%;
  }

  .auth-page-header {
    .text-h3 {
      font-size: 2rem;
    }

    .text-h6 {
      font-size: 1.1rem;
    }
  }

  .tech-badges {
    justify-content: center;
  }
}

@media (max-height: 700px) {
  .auth-page-header {
    margin-bottom: 2rem !important;
  }

  .features-card,
  .tech-info-card {
    margin-top: 1rem !important;
  }
}
</style>
