import { defineBoot } from '#q-app/wrappers';
import axios, { AxiosError, type AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { AuthService } from 'src/services/auth.service';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const backendAPI: AxiosInstance = axios.create({baseURL: process.env.VUE_APP_BACKEND_API || 'http://localhost:8080'});

// Intercepteur pour ajouter automatiquement le token Firebase
backendAPI.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AuthService.getIdToken();
    if(token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(token);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
)


// Interepteur de réponse pour gérer les erreurs d'authetification
backendAPI.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.status === 401) {
      await AuthService.signOut();
      window.location.reload();
    }
    return Promise.reject(error);
  }
)


export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = backendAPI;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

  export { backendAPI };
