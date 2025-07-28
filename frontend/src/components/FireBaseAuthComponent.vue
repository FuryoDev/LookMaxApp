<!-- FirebaseAuthComponent.vue - Version Quasar -->
<template>
  <q-card class="auth-card">
    <q-card-section class="text-center">
      <div class="text-h5 text-weight-bold q-mb-md">
        {{ isLogin ? 'Connexion' : 'Inscription' }}
      </div>
      <div class="text-body2 text-grey-7">
        {{ isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte LookMax' }}
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <!-- Formulaire email/password -->
      <q-form @submit.prevent="handleEmailAuth" class="q-gutter-md">
        <!-- Email -->
        <q-input
          v-model="form.email"
          type="email"
          label="Email"
          outlined
          required
          :disable="loading"
          :error="!!fieldErrors.email"
          :error-message="fieldErrors.email"
          @input="clearFieldError('email')"
        >
          <template v-slot:prepend>
            <q-icon name="mail" />
          </template>
        </q-input>

        <!-- Password -->
        <q-input
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          label="Mot de passe"
          outlined
          required
          :disable="loading"
          :error="!!fieldErrors.password"
          :error-message="fieldErrors.password"
          @input="clearFieldError('password')"
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <!-- Confirm Password (inscription uniquement) -->
        <q-input
          v-if="!isLogin"
          v-model="form.confirmPassword"
          type="password"
          label="Confirmer le mot de passe"
          outlined
          required
          :disable="loading"
          :error="!!fieldErrors.confirmPassword"
          :error-message="fieldErrors.confirmPassword"
          @input="clearFieldError('confirmPassword')"
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
        </q-input>

        <!-- Display Name (inscription uniquement) -->
        <q-input
          v-if="!isLogin"
          v-model="form.displayName"
          label="Nom d'affichage (optionnel)"
          outlined
          :disable="loading"
        >
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <!-- Messages d'erreur globaux -->
        <q-banner v-if="error" class="text-white bg-negative" rounded>
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          {{ error }}
        </q-banner>

        <!-- Messages de succès -->
        <q-banner v-if="success" class="text-white bg-positive" rounded>
          <template v-slot:avatar>
            <q-icon name="check_circle" />
          </template>
          {{ success }}
        </q-banner>

        <!-- Bouton principal -->
        <q-btn
          type="submit"
          :label="isLogin ? 'Se connecter' : 'S\'inscrire'"
          color="primary"
          unelevated
          no-caps
          class="full-width"
          :loading="loading"
          :disable="loading"
        >
          <template v-slot:loading>
            <q-spinner-hourglass class="on-left" />
            Chargement...
          </template>
        </q-btn>
      </q-form>

      <!-- Divider -->
      <div class="row items-center q-my-lg">
        <div class="col">
          <q-separator />
        </div>
        <div class="col-auto q-px-md text-grey-6 text-body2">
          ou
        </div>
        <div class="col">
          <q-separator />
        </div>
      </div>

      <!-- Boutons de connexion sociale -->
      <div class="q-gutter-sm">
        <q-btn
          @click="handleGoogleAuth"
          :disable="loading"
          color="white"
          text-color="black"
          unelevated
          no-caps
          class="full-width"
          :loading="loadingGoogle"
        >
          <q-icon name="fab fa-google" class="on-left" />
          {{ isLogin ? 'Se connecter' : 'S\'inscrire' }} avec Google
        </q-btn>

        <q-btn
          @click="handleFacebookAuth"
          :disable="loading"
          color="indigo-8"
          unelevated
          no-caps
          class="full-width"
          :loading="loadingFacebook"
        >
          <q-icon name="fab fa-facebook" class="on-left" />
          {{ isLogin ? 'Se connecter' : 'S\'inscrire' }} avec Facebook
        </q-btn>
      </div>
    </q-card-section>

    <q-separator />

    <!-- Toggle entre connexion et inscription -->
    <q-card-section class="text-center">
      <div class="text-body2 text-grey-7 q-mb-sm">
        {{ isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?' }}
      </div>
      <q-btn
        @click="toggleMode"
        flat
        no-caps
        color="primary"
        :disable="loading"
        :label="isLogin ? 'S\'inscrire' : 'Se connecter'"
      />

      <!-- Mot de passe oublié -->
      <div v-if="isLogin" class="q-mt-sm">
        <q-btn
          @click="handleForgotPassword"
          flat
          no-caps
          color="grey-7"
          size="sm"
          :disable="loading"
          label="Mot de passe oublié ?"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useQuasar } from 'quasar';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  type User
} from 'firebase/auth';
import { auth } from 'src/boot/firebase';

// Quasar
const $q = useQuasar();

// Props et émissions
const emit = defineEmits<{
  authSuccess: [user: User];
  authError: [error: string];
}>();

// État du composant
const isLogin = ref(true);
const loading = ref(false);
const loadingGoogle = ref(false);
const loadingFacebook = ref(false);
const showPassword = ref(false);
const error = ref('');
const success = ref('');

// Formulaire
const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  displayName: ''
});

// Erreurs par champ
const fieldErrors = reactive({
  email: '',
  password: '',
  confirmPassword: ''
});

// Providers d'authentification
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Fonctions utilitaires
const clearMessages = () => {
  error.value = '';
  success.value = '';
};

const clearFieldError = (field: keyof typeof fieldErrors) => {
  fieldErrors[field] = '';
};

const clearAllFieldErrors = () => {
  Object.keys(fieldErrors).forEach(key => {
    fieldErrors[key as keyof typeof fieldErrors] = '';
  });
};

const validateForm = (): boolean => {
  clearAllFieldErrors();
  let isValid = true;

  if (!form.email) {
    fieldErrors.email = 'Email requis';
    isValid = false;
  }

  if (!form.password) {
    fieldErrors.password = 'Mot de passe requis';
    isValid = false;
  } else if (form.password.length < 6) {
    fieldErrors.password = 'Minimum 6 caractères';
    isValid = false;
  }

  if (!isLogin.value && form.password !== form.confirmPassword) {
    fieldErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    isValid = false;
  }

  return isValid;
};

const showSuccessNotify = (message: string) => {
  $q.notify({
    type: 'positive',
    message,
    position: 'top',
    timeout: 3000,
    actions: [{ icon: 'close', color: 'white' }]
  });
};

const showErrorNotify = (message: string) => {
  $q.notify({
    type: 'negative',
    message,
    position: 'top',
    timeout: 5000,
    actions: [{ icon: 'close', color: 'white' }]
  });
};

const handleAuthSuccess = async (user: User) => {
  console.log('✅ Authentification réussie:', user.email);

  try {
    const token = await user.getIdToken();
    console.log('🔑 Token Firebase récupéré');

    const welcomeMessage = `Bienvenue ${user.displayName || user.email} !`;
    success.value = welcomeMessage;
    showSuccessNotify(welcomeMessage);

    emit('authSuccess', user);
  } catch (tokenError) {
    console.error('❌ Erreur lors de la récupération du token:', tokenError);
    const errorMsg = 'Erreur lors de la récupération des informations utilisateur';
    error.value = errorMsg;
    showErrorNotify(errorMsg);
  }
};

const handleAuthError = (err: any) => {
  console.error('❌ Erreur d\'authentification:', err);

  const errorMessages: Record<string, string> = {
    'auth/user-not-found': 'Aucun compte trouvé avec cet email',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/email-already-in-use': 'Cet email est déjà utilisé',
    'auth/weak-password': 'Le mot de passe est trop faible',
    'auth/invalid-email': 'Format d\'email invalide',
    'auth/user-disabled': 'Ce compte a été désactivé',
    'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard',
    'auth/popup-closed-by-user': 'Fenêtre de connexion fermée',
    'auth/cancelled-popup-request': 'Demande de connexion annulée',
    'auth/account-exists-with-different-credential': 'Un compte existe déjà avec un autre mode de connexion'
  };

  const errorMsg = errorMessages[err.code] || err.message || 'Une erreur est survenue';
  error.value = errorMsg;
  showErrorNotify(errorMsg);
  emit('authError', errorMsg);
};

// Gestionnaires d'authentification
const handleEmailAuth = async () => {
  if (!validateForm()) return;

  loading.value = true;
  clearMessages();

  try {
    let userCredential;

    if (isLogin.value) {
      userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
    } else {
      userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      if (form.displayName && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: form.displayName
        });
      }
    }

    await handleAuthSuccess(userCredential.user);
  } catch (err: any) {
    handleAuthError(err);
  } finally {
    loading.value = false;
  }
};

const handleGoogleAuth = async () => {
  loadingGoogle.value = true;
  clearMessages();

  try {
    const result = await signInWithPopup(auth, googleProvider);
    await handleAuthSuccess(result.user);
  } catch (err: any) {
    handleAuthError(err);
  } finally {
    loadingGoogle.value = false;
  }
};

const handleFacebookAuth = async () => {
  loadingFacebook.value = true;
  clearMessages();

  try {
    const result = await signInWithPopup(auth, facebookProvider);
    await handleAuthSuccess(result.user);
  } catch (err: any) {
    handleAuthError(err);
  } finally {
    loadingFacebook.value = false;
  }
};

const handleForgotPassword = async () => {
  if (!form.email) {
    fieldErrors.email = 'Veuillez saisir votre email pour réinitialiser le mot de passe';
    return;
  }

  loading.value = true;
  clearMessages();

  try {
    await sendPasswordResetEmail(auth, form.email);
    const successMsg = 'Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.';
    success.value = successMsg;
    showSuccessNotify(successMsg);
  } catch (err: any) {
    handleAuthError(err);
  } finally {
    loading.value = false;
  }
};

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  clearMessages();
  clearAllFieldErrors();

  // Reset du formulaire
  form.confirmPassword = '';
  form.displayName = '';
};
</script>

<style scoped>
.auth-card {
  min-width: 350px;
  max-width: 400px;
}
</style>
