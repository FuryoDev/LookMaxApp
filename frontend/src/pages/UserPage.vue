<template>
  <q-page>
    <h3>{{ message }}</h3>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { backendAPI } from 'boot/axios';

const message = ref('');

onMounted(async () => {
  try {
    const response = await backendAPI.get('/api/main');
    message.value = response.data;
  } catch (error) {
    message.value = 'Erreur lors de l’appel API';
    console.error(error);
  }
});
</script>


<style scoped>

</style>
