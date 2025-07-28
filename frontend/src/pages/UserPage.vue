<template>
  <q-page class="user-page q-pa-md">
    <div class="row q-gutter-lg">
      <!-- Carte de profil principal -->
      <div class="col-12 col-md-4">
        <q-card class="profile-card">
          <q-card-section class="text-center">
            <!-- Avatar -->
            <q-avatar size="120px" class="q-mb-md">
              <img
                v-if="userProfile?.photoURL"
                :src="userProfile.photoURL"
                alt="Avatar"
              />
              <q-icon
                v-else
                name="account_circle"
                size="120px"
                color="primary"
              />
            </q-avatar>

            <!-- Nom et email -->
            <div class="text-h5 text-weight-bold q-mb-sm">
              {{ userProfile?.displayName || 'Utilisateur' }}
            </div>
            <div class="text-body1 text-grey-7">
              {{ userProfile?.email }}
            </div>

            <!-- Badges -->
            <div class="q-mt-md">
              <q-chip
                v-if="userProfile?.emailVerified"
                color="positive"
                text-color="white"
                icon="verified"
                size="sm"
              >
                Email vérifié
              </q-chip>
              <q-chip
                v-else
                color="warning"
                text-color="white"
                icon="warning"
                size="sm"
              >
                Email non vérifié
              </q-chip>

              <q-chip
                v-if="devMode"
                color="orange"
                text-color="white"
                icon="code"
                size="sm"
              >
                Mode Dev
              </q-chip>
            </div>

            <!-- Actions principales -->
            <div class="q-mt-lg q-gutter-sm">
              <q-btn
                @click="showEditProfile = true"
                color="primary"
                icon="edit"
                label="Modifier le profil"
                no-caps
                class="full-width"
              />

              <q-btn
                @click="handleLogout"
                color="negative"
                icon="logout"
                label="Se déconnecter"
                no-caps
                outline
                class="full-width"
                :loading="loggingOut"
              />
            </div>
          </q-card-section>
        </q-card>

        <!-- Informations du compte -->
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="info" class="q-mr-sm" />
              Informations du compte
            </div>

            <q-list>
              <q-item>
                <q-item-section>
                  <q-item-label caption>UID</q-item-label>
                  <q-item-label class="text-mono">
                    {{ userProfile?.uid }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="userProfile?.metadata?.creationTime">
                <q-item-section>
                  <q-item-label caption>Membre depuis</q-item-label>
                  <q-item-label>
                    {{ formatDate(userProfile.metadata.creationTime) }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="userProfile?.metadata?.lastSignInTime">
                <q-item-section>
                  <q-item-label caption>Dernière connexion</q-item-label>
                  <q-item-label>
                    {{ formatDate(userProfile.metadata.lastSignInTime) }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="userProfile?.phoneNumber">
                <q-item-section>
                  <q-item-label caption>Téléphone</q-item-label>
                  <q-item-label>
                    {{ userProfile.phoneNumber }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Contenu principal -->
      <div class="col-12 col-md-8">
        <!-- Statistiques -->
        <q-card class="stats-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="bar_chart" class="q-mr-sm" />
              Statistiques
            </div>

            <div class="row q-gutter-md">
              <div class="col">
                <q-card flat bordered>
                  <q-card-section class="text-center">
                    <div class="text-h4 text-primary">0</div>
                    <div class="text-caption">Photos analysées</div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col">
                <q-card flat bordered>
                  <q-card-section class="text-center">
                    <div class="text-h4 text-secondary">0</div>
                    <div class="text-caption">Analyses cette semaine</div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col">
                <q-card flat bordered>
                  <q-card-section class="text-center">
                    <div class="text-h4 text-positive">0</div>
                    <div class="text-caption">Score moyen</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Activité récente -->
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="history" class="q-mr-sm" />
              Activité récente
            </div>

            <div class="text-center q-pa-lg text-grey-6">
              <q-icon name="hourglass_empty" size="4em" />
              <div class="q-mt-md">Aucune activité récente</div>
              <q-btn
                @click="$router.push('/app/index')"
                color="primary"
                label="Commencer une analyse"
                no-caps
                class="q-mt-md"
              />
            </div>
          </q-card-section>
        </q-card>

        <!-- Paramètres rapides -->
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="settings" class="q-mr-sm" />
              Paramètres rapides
            </div>

            <q-list>
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>Notifications par email</q-item-label>
                  <q-item-label caption>
                    Recevoir des mises à jour sur vos analyses
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="emailNotifications" />
                </q-item-section>
              </q-item>

              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>Mode sombre</q-item-label>
                  <q-item-label caption>
                    Activer le thème sombre
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="darkMode" @update:model-value="toggleDarkMode" />
                </q-item-section>
              </q-item>

              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>Historique des analyses</q-item-label>
                  <q-item-label caption>
                    Conserver l'historique de vos analyses
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="keepHistory" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dialog de modification du profil -->
    <q-dialog v-model="showEditProfile">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Modifier le profil</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="editForm.displayName"
            label="Nom d'affichage"
            outlined
            dense
            class="q-mb-md"
          />

          <q-input
            v-model="editForm.phoneNumber"
            label="Téléphone"
            outlined
            dense
            mask="+## ### ### ####"
            hint="Format: +33 6XX XXX XXX"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annuler" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Enregistrer"
            color="primary"
            @click="saveProfile"
            :loading="savingProfile"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de confirmation de déconnexion -->
    <q-dialog v-model="showLogoutDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="logout" size="2em" color="negative" class="q-mr-md" />
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
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuth } from 'stores/auth.store';

// Composables
const router = useRouter();
const $q = useQuasar();
const { userProfile, logout, updateProfile } = useAuth();

// État
const showEditProfile = ref(false);
const showLogoutDialog = ref(false);
const loggingOut = ref(false);
const savingProfile = ref(false);
const devMode = ref(false);

// Paramètres
const emailNotifications = ref(true);
const darkMode = ref($q.dark.isActive);
const keepHistory = ref(true);

// Formulaire d'édition
const editForm = ref({
  displayName: '',
  phoneNumber: ''
});

// Méthodes
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
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

    // Rediriger vers la page d'authentification
    await router.push('/auth');
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

const toggleDarkMode = (value: boolean) => {
  $q.dark.set(value);
  localStorage.setItem('darkMode', value.toString());
};

const saveProfile = async () => {
  savingProfile.value = true;

  try {
    await updateProfile({
      displayName: editForm.value.displayName,
      phoneNumber: editForm.value.phoneNumber
    });

    showEditProfile.value = false;

    $q.notify({
      type: 'positive',
      message: 'Profil mis à jour avec succès',
      position: 'top',
      timeout: 3000
    });
  } catch (error) {
    console.error('❌ Erreur de mise à jour:', error);

    $q.notify({
      type: 'negative',
      message: 'Erreur lors de la mise à jour du profil',
      position: 'top',
      timeout: 3000
    });
  } finally {
    savingProfile.value = false;
  }
};

// Lifecycle
onMounted(() => {
  // Vérifier le mode dev
  devMode.value = localStorage.getItem('DEV_MODE_AUTH') === 'true';

  // Initialiser le formulaire d'édition
  if (userProfile && userProfile.value) {
    editForm.value = {
      displayName: userProfile.value.displayName || '',
      phoneNumber: userProfile.value.phoneNumber || ''
    };
  }

  // Charger les préférences
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode !== null) {
    darkMode.value = savedDarkMode === 'true';
    $q.dark.set(darkMode.value);
  }
});
</script>

<style lang="scss" scoped>
.user-page {
  max-width: 1200px;
  margin: 0 auto;
}

.profile-card {
  position: sticky;
  top: 20px;
}

.q-avatar {
  border: 3px solid $primary;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.text-mono {
  font-family: 'Courier New', monospace;
  font-size: 0.85em;
}

.stats-card {
  .q-card {
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-2px);
    }
  }
}

// Dark mode adjustments
.body--dark {
  .profile-card,
  .stats-card .q-card {
    background: $dark;
  }
}

@media (max-width: 768px) {
  .profile-card {
    position: relative;
  }
}
</style>
