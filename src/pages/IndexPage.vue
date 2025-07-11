<template>
  <q-page class="row items-center justify-evenly">
    <div class="q-mb-md" v-if="photo">
      <q-img :src="photo" ratio="4/3" class="rounded-borders" />
    </div>

    <q-btn
      label="Importer photo"
      icon="photo_library"
      @click="importFromGallery"
      color="secondary"
      class="col"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const photo = ref<string | null>(null);

const importFromGallery = async () => {
  try {
    const result = await Camera.getPhoto({
      quality: 100,
      resultType: CameraResultType.DataUrl,
      allowEditing: false,
      source: CameraSource.Photos
    });
    photo.value = result.dataUrl ?? null;
  } catch (error) {
    console.log(error);
  }
};
</script>
