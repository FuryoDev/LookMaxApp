<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          LookMax App
        </q-toolbar-title>
        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer>
      <q-tabs
        v-model="activeTab"
        class="text-white bg-primary"
        active-color="white"
        indicator-color="white"
        align="justify"
      >
        <q-route-tab
          name="user"
          to="/user"
          icon="person"
          label="Profile"
        />
        <q-route-tab
          name="index"
          to="/index"
          icon="camera"
          label="Accueil"
        />
        <q-route-tab
          name="error"
          to="/error"
          icon="error"
          label="Erreur"
        />
        <q-route-tab
          name="firebase"
          to="/firebase"
          icon="fire"
          label="Firebase"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const activeTab = ref('home');

// Mettre à jour l'onglet actif en fonction de la route
const updateActiveTab = () => {
  const path = route.path;

  if (path === '/') {
    activeTab.value = 'home';
  } else if (path === '/user') {
    activeTab.value = 'user';
  } else if (path === '/error') {
    activeTab.value = 'error';
  }
};

// Initialiser et observer les changements de route
updateActiveTab();
watch(() => route.path, updateActiveTab);
</script>

<style scoped>
.q-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}
</style>
