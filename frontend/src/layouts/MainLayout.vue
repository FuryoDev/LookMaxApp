<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          LookMax
          <q-chip dense size="sm" color="secondary" text-color="white">
            Quasar v{{ $q.version }}
          </q-chip>
        </q-toolbar-title>

        <div class="q-gutter-sm row items-center no-wrap">
          <!-- Menu utilisateur si connecté -->
          <q-btn-dropdown
            v-if="isAuthenticated"
            flat
            no-caps
            dense
            class="user-menu"
          >
            <template v-slot:label>
              <div class="row items-center no-wrap">
                <q-avatar size="32px" class="q-mr-sm">
                  <img
                    v-if="userProfile?.photoURL"
                    :src="userProfile.photoURL"
                    alt="Avatar"
                  />
                  <q-icon
                    v-else
                    name="account_circle"
                    size="32px"
                  />
                </q-avatar>
                <div class="text-weight-medium">{{ displayName }}</div>
              </div>
            </template>

            <q-list>
              <q-item
                clickable
                v-close-popup
                @click="goToProfile"
              >
                <q-item-section avatar>
                  <q-icon name="person" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Mon profil</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                clickable
                v-close-popup
                @click="goToSettings"
              >
                <q-item-section avatar>
                  <q-icon name="settings" color="grey-7" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Paramètres</q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item
                clickable
                v-close-popup
                @click="handleLogout"
              >
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-negative">Se déconnecter</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <!-- Indicateur mode dev si activé -->
          <q-chip
            v-if="devMode"
            color="orange"
            text-color="white"
            icon="code"
            size="sm"
          >
            DEV MODE
          </q-chip>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Navigation
        </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

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
          to="/app/index"
          icon="camera"
          label="Accueil"
        />

        <q-route-tab
          name="user"
          to="/app/user"
          icon="person"
          label="Profil"
        />

        <q-route-tab
          name="firebase"
          to="/app/firebase"
          icon="whatshot"
          label="Firebase"
        />

        <q-route-tab
          name="error"
          to="/app/error"
          icon="error"
          label="Test"
        />
      </q-tabs>
    </q-footer>

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
import { ref, watch, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuth } from 'stores/auth.store';
import EssentialLink from 'components/EssentialLink.vue';

const linksList = [
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev'
  },
  {
    title: 'Github',
    caption: 'github.com/quasarframework',
    icon: 'code',
    link: 'https://github.com/quasarframework'
  },
  {
    title: 'Discord Chat Channel',
    caption: 'chat.quasar.dev',
    icon: 'chat',
    link: 'https://chat.quasar.dev'
  },
  {
    title: 'Forum',
    caption: 'forum.quasar.dev',
    icon: 'record_voice_over',
    link: 'https://forum.quasar.dev'
  },
  {
    title: 'Twitter',
    caption: '@quasarframework',
    icon: 'rss_feed',
    link: 'https://twitter.quasar.dev'
  },
  {
    title: 'Facebook',
    caption: '@QuasarFramework',
    icon: 'public',
    link: 'https://facebook.quasar.dev'
  },
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev'
  }
];

// Composables
const route = useRoute();
const router = useRouter();
const $q = useQuasar();

// Store d'authentification
const {
  user,
  isAuthenticated,
  userProfile,
  logout
} = useAuth();

// État local
const leftDrawerOpen = ref(false);
const activeTab = ref('index');
const showLogoutDialog = ref(false);
const loggingOut = ref(false);
const essentialLinks = ref(linksList);
const devMode = ref(false);

// Computed
const displayName = computed(() => {
  return userProfile.value?.displayName || userProfile.value?.email?.split('@')[0] || 'Utilisateur';
});

// Méthodes
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const updateActiveTab = () => {
  const path = route.path;

  if (path.includes('/index')) {
    activeTab.value = 'index';
  } else if (path.includes('/user')) {
    activeTab.value = 'user';
  } else if (path.includes('/firebase')) {
    activeTab.value = 'firebase';
  } else if (path.includes('/error')) {
    activeTab.value = 'error';
  }
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
    router.push('/auth');
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
  router.push('/app/user');
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

// Lifecycle
onMounted(() => {
  updateActiveTab();
  // Vérifier si le mode dev est activé
  devMode.value = localStorage.getItem('DEV_MODE_AUTH') === 'true';
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
    font-size: 0.7rem;
  }
}

.user-menu {
  min-width: 200px;
}
</style>
