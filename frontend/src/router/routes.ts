import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/auth'
  },
  {
    path: '/auth',
    component: () => import('pages/AuthPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/app',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/app/index'
      },
      {
        path: 'index',
        component: () => import('pages/IndexPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'user',
        component: () => import('pages/UserPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'firebase',
        component: () => import('pages/FirebaseTest.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'error',
        component: () => import('pages/ErrorNotFound.vue'),
        meta: { requiresAuth: false }
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
    meta: { requiresAuth: false }
  }
];

export default routes;
