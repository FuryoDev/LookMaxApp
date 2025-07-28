<!-- FirebaseAuthComponent.vue - Composant d'authentification Firebase avec Quasar -->
<template>
  <q-card class="auth-card" flat bordered>
    <q-card-section>
      <div class="text-h5 text-center q-mb-md">
        {{ isSignUp ? 'Créer un compte' : 'Se connecter' }}
      </div>

      <!-- Messages d'erreur et de succès -->
      <q-banner
        v-if="error"
        class="text-negative q-mb-md"
        dense
        rounded
      >
        <template v-slot:avatar>
          <q-icon name="error" color="negative" />
        </template>
        {{ error }}
      </q-banner>

      <q-banner
        v-if="success"
        class="text-positive q-mb-md"
        dense
        rounded
      >
        <template v-slot:avatar>
          <q-icon name="check_circle" color="positive" />
        </template>
        {{ success }}
      </q-banner>

      <!-- Formulaire email/password -->
      <q-form @submit="handleSubmit" class="q-gutter-md">
        <q-input
          v-model="email"
          type="email"
          label="Email"
          outlined
          :rules="[
            val => !!val || 'Email requis',
            val => /.+@.+\..+/.test(val) || 'Email invalide'
          ]"
          lazy-rules
          :disable="loading"
        >
          <template v-slot:prepend>
            <q-icon name="email" />
          </template>
        </q-input>

        <q-input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          label="Mot de passe"
          outlined
          :rules="[
            val => !!val || 'Mot de passe requis',
            val => val.length >= 6 || 'Minimum 6 caractères'
          ]"
          lazy-rules
          :disable="loading"
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

        <!-- Options supplémentaires pour l'inscription -->
        <div v-if="isSignUp" class="q-mb-md">
          <q-checkbox
            v-model="acceptTerms"
            label="J'accepte les conditions d'utilisation"
            :disable="loading"
          />
        </div>

        <!-- Bouton de soumission -->
        <q-btn
          type="submit"
          :label="isSignUp ? 'S\'inscrire' : 'Se connecter'"
          color="primary"
          class="full-width"
          :loading="loading"
          :disable="loading || (isSignUp && !acceptTerms)"
          no-caps
          size="lg"
        />
      </q-form>

      <!-- Lien pour basculer entre connexion et inscription -->
      <div class="text-center q-mt-md">
        <q-btn
          flat
          :label="isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'"
          color="primary"
          @click="toggleMode"
          :disable="loading"
          no-caps
        />
      </div>

      <!-- Séparateur -->
      <div class="row items-center q-my-md">
        <div class="col">
          <q-separator />
        </div>
        <div class="col-auto q-px-md text-grey-6">OU</div>
        <div class="col">
          <q-separator />
        </div>
      </div>

      <!-- Boutons de connexion sociale -->
      <div class="q-gutter-sm">
        <q-btn
          @click="signInWithGoogle"
          color="white"
          text-color="black"
          class="full-width"
          :loading="loadingGoogle"
          :disable="loading || loadingGoogle || loadingFacebook"
          no-caps
          size="md"
        >
          <q-icon name="img:https://www.google.com/favicon.ico" class="q-mr-sm" />
          Continuer avec Google
        </q-btn>

        <q-btn
          @click="signInWithFacebook"
          color="blue-8"
          class="full-width"
          :loading="loadingFacebook"
          :disable="loading || loadingGoogle || loadingFacebook"
          no-caps
          size="md"
        >
          <q-icon name="fab fa-facebook" class="q-mr-sm" />
          Continuer avec Facebook
        </q-btn>
      </div>

      <!-- Lien mot de passe oublié -->
      <div class="text-center q-mt-md">
        <q-btn
          flat
          label="Mot de passe oublié ?"
          color="grey-7"
          @click="showResetDialog = true"
          :disable="loading"
          no-caps
          size="sm"
        />
      </div>
    </q-card-section>
  </q-card>

  <!-- Dialog de réinitialisation du mot de passe -->
  <q-dialog v-model="showResetDialog">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Réinitialiser le mot de passe</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          v-model="resetEmail"
          type="email"
          label="Email"
          outlined
          :rules="[
            val => !!val || 'Email requis',
            val => /.+@.+\..+/.test(val) || 'Email invalide'
          ]"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Annuler" color="grey-7" v-close-popup />
        <q-btn
          flat
          label="Envoyer"
          color="primary"
          @click="resetPassword"
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  sendPasswordResetEmail,
  type User,
  type UserCredential,
  type AuthError
} from 'firebase/auth';
import { auth } from 'boot/firebase';

// Composables
const $q = useQuasar();

// Props et émissions
const emit = defineEmits<{
  'auth-success': [user: User];
  'auth-error': [error: string];
}>();

// État
const email = ref('');
const password = ref('');
const resetEmail = ref('');
const isSignUp = ref(false);
const showPassword = ref(false);
const acceptTerms = ref(false);
const showResetDialog = ref(false);

// État de chargement
const loading = ref(false);
const loadingGoogle = ref(false);
const loadingFacebook = ref(false);

// Messages
const error = ref('');
const success = ref('');

// Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Méthodes utilitaires
const clearMessages = () => {
  error.value = '';
  success.value = '';
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

const showSuccessNotify = (message: string) => {
  $q.notify({
    type: 'positive',
    message,
    position: 'top',
    timeout: 3000,
    actions: [{ icon: 'close', color: 'white' }]
  });
};

// Gestionnaire de succès d'authentification
const handleAuthSuccess = async (user: User) => {
  console.log('✅ Authentification réussie:', user.email);

  try {
    await user.getIdToken();
    console.log('🔑 Token Firebase récupéré');

    const welcomeMessage = `Bienvenue ${user.displayName || user.email} !`;
    success.value = welcomeMessage;
    showSuccessNotify(welcomeMessage);

    // Émettre l'événement de succès
    emit('auth-success', user);

    // Réinitialiser le formulaire
    email.value = '';
    password.value = '';
    acceptTerms.value = false;
  } catch (err) {
    console.error('❌ Erreur lors de la récupération du token:', err);
  }
};

const handleAuthError = (err: AuthError | Error) => {
  console.error('❌ Erreur d\'authentification:', err);

  const errorMessages: Record<string, string> = {
    'auth/user-not-found': 'Aucun compte trouvé avec cet email',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/email-already-in-use': 'Un compte existe déjà avec cet email',
    'auth/weak-password': 'Le mot de passe est trop faible',
    'auth/invalid-email': 'Email invalide',
    'auth/account-exists-with-different-credential': 'Un compte existe déjà avec cet email',
    'auth/popup-closed-by-user': 'Connexion annulée',
    'auth/network-request-failed': 'Erreur réseau, vérifiez votre connexion',
    'auth/too-many-requests': 'Trop de tentatives, réessayez plus tard'
  };

  const errorCode = 'code' in err ? err.code : '';
  const message = errorCode && errorMessages[errorCode]
    ? errorMessages[errorCode]
    : 'Une erreur est survenue lors de l\'authentification';

  error.value = message;
  showErrorNotify(message);
  emit('auth-error', message);
};

// Méthodes d'authentification
const handleSubmit = async () => {
  clearMessages();
  loading.value = true;

  try {
    let userCredential: UserCredential;

    if (isSignUp.value) {
      console.log('📝 Tentative d\'inscription...');
      userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);

      // Envoyer un email de vérification
      try {
        await userCredential.user.sendEmailVerification();
        showSuccessNotify('Email de vérification envoyé');
      } catch (verifyError) {
        console.warn('Impossible d\'envoyer l\'email de vérification:', verifyError);
      }
    } else {
      console.log('🔐 Tentative de connexion...');
      userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    }

    await handleAuthSuccess(userCredential.user);
  } catch (err: unknown) {
    handleAuthError(err as AuthError);
  } finally {
    loading.value = false;
  }
};

const signInWithGoogle = async () => {
  clearMessages();
  loadingGoogle.value = true;

  try {
    console.log('🔐 Connexion avec Google...');
    const result = await signInWithPopup(auth, googleProvider);
    await handleAuthSuccess(result.user);
  } catch (err: unknown) {
    handleAuthError(err as AuthError);
  } finally {
    loadingGoogle.value = false;
  }
};

const signInWithFacebook = async () => {
  clearMessages();
  loadingFacebook.value = true;

  try {
    console.log('🔐 Connexion avec Facebook...');
    const result = await signInWithPopup(auth, facebookProvider);
    await handleAuthSuccess(result.user);
  } catch (err: unknown) {
    handleAuthError(err as AuthError);
  } finally {
    loadingFacebook.value = false;
  }
};

const resetPassword = async () => {
  if (!resetEmail.value) {
    showErrorNotify('Veuillez entrer votre email');
    return;
  }

  clearMessages();
  loading.value = true;

  try {
    await sendPasswordResetEmail(auth, resetEmail.value);
    const successMsg = 'Email de réinitialisation envoyé !';
    success.value = successMsg;
    showSuccessNotify(successMsg);
  } catch (err: unknown) {
    handleAuthError(err as AuthError);
  } finally {
    loading.value = false;
    showResetDialog.value = false;
    resetEmail.value = '';
  }
};

const toggleMode = () => {
  isSignUp.value = !isSignUp.value;
  clearMessages();
  // Réinitialiser le formulaire
  email.value = '';
  password.value = '';
  acceptTerms.value = false;
};
</script>

<style lang="scss" scoped>
.auth-card {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;

  @media (max-width: 600px) {
    max-width: 100%;
  }
}

.q-banner {
  font-size: 0.875rem;
}

// Dark mode adjustments
.body--dark {
  .auth-card {
    background: $dark;
  }
}
</style>
