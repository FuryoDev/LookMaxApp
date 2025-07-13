<template>
  <q-page class="index-page">
    <!-- Zone photo principale (60% de la hauteur) -->
    <div class="photo-zone">
      <div class="photo-container">
        <!-- Image sélectionnée -->
        <q-img
          v-if="selectedPhoto"
          :src="selectedPhoto"
          class="selected-image"
          spinner-color="primary"
          loading="lazy"
        >
          <!-- Bouton supprimer en overlay -->
          <div class="image-overlay">
            <q-btn
              @click="removePhoto"
              icon="close"
              round
              color="negative"
              size="sm"
              class="delete-btn"
            />
          </div>
        </q-img>

        <!-- Placeholder quand pas d'image -->
        <div v-else class="photo-placeholder">
          <q-icon name="photo_camera" size="4rem" color="grey-5" />
          <div class="placeholder-text">
            <p class="text-h6 text-grey-6">Aucune photo</p>
            <p class="text-body2 text-grey-5">Utilisez les boutons ci-dessous</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Zone boutons (40% restant) -->
    <div class="buttons-zone">
      <div class="buttons-container">
        <!-- Input file caché -->
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleGalleryImport"
          style="display: none"
        />

        <!-- Bouton Galerie -->
        <q-btn
          @click="importFromGallery"
          :loading="loading"
          class="action-btn gallery-btn"
          size="lg"
          no-caps
        >
          <div class="btn-content">
            <q-icon name="photo_library" size="2rem" />
            <span class="btn-text">Galerie</span>
          </div>
        </q-btn>

        <!-- Bouton Caméra -->
        <q-btn
          @click="takePhoto"
          :loading="loading"
          class="action-btn camera-btn"
          size="lg"
          no-caps
        >
          <div class="btn-content">
            <q-icon name="photo_camera" size="2rem" />
            <span class="btn-text">Caméra</span>
          </div>
        </q-btn>
      </div>

      <!-- Zone debug (optionnelle) -->
      <div v-if="debugInfo" class="debug-info">
        <p class="text-caption text-grey-6">{{ debugInfo }}</p>
      </div>
    </div>

    <!-- Dialog caméra web -->
    <q-dialog v-model="showCameraDialog" @hide="stopCamera">
      <q-card class="camera-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">Prendre une photo</div>
          <q-btn icon="close" flat round dense @click="showCameraDialog = false" />
        </q-card-section>

        <q-card-section class="camera-section">
          <video
            ref="videoElement"
            autoplay
            playsinline
            class="camera-video"
          ></video>
          <canvas ref="canvasElement" style="display: none;"></canvas>
        </q-card-section>

        <q-card-actions class="dialog-actions">
          <q-btn
            @click="capturePhoto"
            icon="photo_camera"
            label="Capturer"
            color="primary"
            :loading="capturing"
            size="lg"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog erreur -->
    <q-dialog v-model="showErrorDialog">
      <q-card class="error-dialog">
        <q-card-section class="row items-center">
          <q-icon name="error" color="negative" size="2rem" class="q-mr-sm" />
          <span class="text-h6">Erreur</span>
        </q-card-section>

        <q-card-section>
          {{ errorMessage }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" @click="showErrorDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';

// État du composant
const selectedPhoto = ref<string | null>(null);
const loading = ref(false);
const capturing = ref(false);
const showCameraDialog = ref(false);
const showErrorDialog = ref(false);
const errorMessage = ref('');
const debugInfo = ref('Mode navigateur - Prêt');

// Références aux éléments
const fileInput = ref<HTMLInputElement>();
const videoElement = ref<HTMLVideoElement>();
const canvasElement = ref<HTMLCanvasElement>();

// Stream de la caméra
let mediaStream: MediaStream | null = null;

// ===== FONCTIONS GALERIE =====

const importFromGallery = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleGalleryImport = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // Validation du fichier
  if (!file.type.startsWith('image/')) {
    showError('Veuillez sélectionner un fichier image valide.');
    return;
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB max
    showError('Le fichier est trop volumineux (max 10MB).');
    return;
  }

  loading.value = true;
  debugInfo.value = 'Chargement de l\'image...';

  const reader = new FileReader();

  reader.onload = (e) => {
    selectedPhoto.value = e.target?.result as string;
    debugInfo.value = `Image importée: ${file.name}`;
    loading.value = false;
  };

  reader.onerror = () => {
    showError('Erreur lors de la lecture du fichier.');
    loading.value = false;
  };

  reader.readAsDataURL(file);

  // Reset input
  target.value = '';
};

// ===== FONCTIONS CAMÉRA =====

const takePhoto = async () => {
  // Vérifier si la caméra est supportée
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showError('Votre navigateur ne supporte pas l\'accès à la caméra.');
    return;
  }

  showCameraDialog.value = true;

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'environment' // Caméra arrière si disponible
      }
    });

    if (videoElement.value) {
      videoElement.value.srcObject = mediaStream;
    }

    debugInfo.value = 'Caméra activée';

  } catch (error: unknown) {
    showCameraDialog.value = false;

    let message = 'Impossible d\'accéder à la caméra.';
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        message = 'Permission refusée. Autorisez l\'accès à la caméra.';
      } else if (error.name === 'NotFoundError') {
        message = 'Aucune caméra trouvée.';
      }
    }

    showError(message);
  }
};

const capturePhoto = () => {
  if (!videoElement.value || !canvasElement.value) return;

  capturing.value = true;

  const video = videoElement.value;
  const canvas = canvasElement.value;
  const context = canvas.getContext('2d');

  if (!context) {
    showError('Erreur lors de la capture.');
    capturing.value = false;
    return;
  }

  // Configurer le canvas
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Capturer l'image
  context.drawImage(video, 0, 0);

  // Convertir en data URL
  selectedPhoto.value = canvas.toDataURL('image/jpeg', 0.9);
  debugInfo.value = 'Photo capturée avec succès';

  capturing.value = false;
  showCameraDialog.value = false;
};

const stopCamera = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
};

// ===== FONCTIONS UTILITAIRES =====

const removePhoto = () => {
  selectedPhoto.value = null;
  debugInfo.value = 'Photo supprimée';
};

const showError = (message: string) => {
  errorMessage.value = message;
  showErrorDialog.value = true;
  debugInfo.value = `Erreur: ${message}`;
};

// Nettoyage au démontage
onUnmounted(() => {
  stopCamera();
});
</script>

<style lang="scss" scoped>
.index-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// ===== ZONE PHOTO (60%) =====
.photo-zone {
  flex: 0 0 60vh; // 60% de la hauteur viewport
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

  .photo-container {
    width: 100%;
    max-width: 400px;
    height: 100%;
    max-height: 50vh;
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .selected-image {
    width: 100%;
    height: 100%;
    object-fit: cover;

    .image-overlay {
      position: absolute;
      top: 12px;
      right: 12px;

      .delete-btn {
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
      }
    }
  }

  .photo-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: 2px dashed #e0e0e0;
    border-radius: 16px;

    .placeholder-text {
      text-align: center;
      margin-top: 1rem;

      p {
        margin: 0.25rem 0;
      }
    }
  }
}

// ===== ZONE BOUTONS (40%) =====
.buttons-zone {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem 1rem 1rem;
  background: #ffffff;

  .buttons-container {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 1rem;

    .action-btn {
      flex: 1;
      max-width: 160px;
      height: 80px;
      border-radius: 16px;
      transition: all 0.3s ease;

      .btn-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;

        .btn-text {
          font-size: 1rem;
          font-weight: 500;
        }
      }

      &.gallery-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
      }

      &.camera-btn {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(245, 87, 108, 0.4);
        }
      }
    }
  }

  .debug-info {
    text-align: center;
    margin-top: 1rem;
  }
}

// ===== DIALOGS =====
.camera-dialog {
  min-width: 300px;
  max-width: 90vw;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0;
  }

  .camera-section {
    display: flex;
    justify-content: center;

    .camera-video {
      width: 100%;
      max-width: 400px;
      border-radius: 8px;
    }
  }

  .dialog-actions {
    justify-content: center;
  }
}

.error-dialog {
  min-width: 300px;
}

// ===== RESPONSIVE =====
@media (max-width: 600px) {
  .photo-zone {
    flex: 0 0 55vh; // Légèrement moins sur mobile
    padding: 0.5rem;

    .photo-container {
      max-height: 45vh;
    }
  }

  .buttons-zone {
    padding: 1.5rem 1rem 1rem;

    .buttons-container {
      .action-btn {
        height: 70px;
        max-width: 140px;

        .btn-content {
          .btn-text {
            font-size: 0.9rem;
          }
        }
      }
    }
  }
}

@media (max-width: 400px) {
  .buttons-zone {
    .buttons-container {
      flex-direction: column;
      align-items: center;

      .action-btn {
        width: 100%;
        max-width: 200px;
      }
    }
  }
}

// ===== RESPONSIVE HEIGHT =====
@media (max-height: 600px) {
  .photo-zone {
    flex: 0 0 50vh;
  }
}
</style>
