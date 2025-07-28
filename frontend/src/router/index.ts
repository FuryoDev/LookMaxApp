import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalized
} from 'vue-router';
import routes from './routes';
import { useAuth } from 'src/stores/auth.store';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Navigation guard pour vérifier l'authentification
  Router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const auth = useAuth();

    // Mode développeur - bypass l'authentification si activé
    const devMode = localStorage.getItem('DEV_MODE_AUTH') === 'true';

    // Attendre l'initialisation de l'auth
    if (!auth.initialized) {
      await auth.initializeAuth();
    }

    // Si la route nécessite l'authentification
    if (to.meta.requiresAuth) {
      if (auth.isAuthenticated || devMode) {
        // L'utilisateur est authentifié ou en mode dev
        next();
      } else {
        // Rediriger vers la page d'authentification
        console.log('🔒 Route protégée, redirection vers /auth');
        next('/auth');
      }
    } else {
      // Si l'utilisateur est déjà authentifié et essaie d'accéder à /auth
      if (to.path === '/auth' && (auth.isAuthenticated || devMode)) {
        console.log('✅ Déjà authentifié, redirection vers /app');
        next('/app');
      } else {
        next();
      }
    }
  });

  return Router;
});
