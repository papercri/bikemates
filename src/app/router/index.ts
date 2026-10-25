import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/authStore'
import HomeView from '@/views/public/HomeView.vue'
import RidesView from '@/views/public/RidesView.vue'
import RideDetailView from '@/views/public/RideDetailView.vue'
import RegisterView from '@/views/public/RegisterView.vue'
import ProfileView from '@/views/private/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // Cada navegación empieza arriba: sin esta función la posición de scroll se
  // arrastra desde la página anterior y enlaces como el CTA de la home caen al
  // final del destino. `behavior: 'auto'` pisa el scroll suave del CSS.
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition !== null) return savedPosition
    if (to.hash !== '') return { el: to.hash, behavior: 'auto' }
    return { top: 0, left: 0, behavior: 'auto' }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      // El header se superpone transparente sobre el hero a pantalla completa.
      meta: { overlayHeader: true },
    },
    {
      path: '/rides',
      name: 'rides',
      component: RidesView,
      meta: {
        breadcrumb: [{ label: 'Inicio', to: '/' }, { label: 'Explorar rutas' }],
      },
    },
    {
      path: '/rides/:id',
      name: 'ride-detail',
      component: RideDetailView,
      meta: {
        breadcrumb: [
          { label: 'Inicio', to: '/' },
          { label: 'Rutas', to: '/rides' },
          { label: 'Detalle de ruta' },
        ],
      },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: {
        breadcrumb: [{ label: 'Inicio', to: '/' }, { label: 'Crear cuenta' }],
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/public/LoginView.vue'),
      meta: {
        breadcrumb: [{ label: 'Inicio', to: '/' }, { label: 'Iniciar sesión' }],
      },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/public/ResetPasswordView.vue'),
      meta: {
        breadcrumb: [{ label: 'Inicio', to: '/' }, { label: 'Restablecer contraseña' }],
      },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/public/ForgotPasswordView.vue'),
      meta: {
        breadcrumb: [{ label: 'Inicio', to: '/' }, { label: 'Recuperar contraseña' }],
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: {
        requiresAuth: true,
        breadcrumb: [{ label: 'Inicio', to: '/' }, { label: 'Mi perfil' }],
      },
    },
    {
      path: '/auth/confirm',
      name: 'email-confirmed',
      component: () => import('@/views/public/EmailConfirmedView.vue'),
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/views/public/PrivacyView.vue'),
      meta: {
        breadcrumb: [{ label: 'Inicio', to: '/' }, { label: 'Privacidad' }],
      },
    },
    {
      path: '/community-rules',
      name: 'community-rules',
      component: () => import('@/views/public/CommunityRulesView.vue'),
      meta: {
        breadcrumb: [{ label: 'Inicio', to: '/' }, { label: 'Normas de la comunidad' }],
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/public/NotFoundView.vue'),
    },
    {
      path: '/rides/create',
      name: 'ride-create',
      component: () => import('@/views/private/CreateRideView.vue'),
      meta: {
        requiresAuth: true,
        breadcrumb: [
          { label: 'Inicio', to: '/' },
          { label: 'Rutas', to: '/rides' },
          { label: 'Publicar ruta' },
        ],
      },
    },
    {
      path: '/rides/:id/edit',
      name: 'ride-edit',
      component: () => import('@/views/private/EditRideView.vue'),
      meta: {
        requiresAuth: true,
        breadcrumb: [
          { label: 'Inicio', to: '/' },
          { label: 'Rutas', to: '/rides' },
          { label: 'Editar ruta' },
        ],
      },
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.isInitialized) {
    try {
      await authStore.initialize()
    } catch {
      if (to.meta.requiresAuth) {
        return {
          name: 'login',
          query: { redirect: to.fullPath },
        }
      }

      return true
    }
  }

  if (to.meta.requiresAuth && !authStore.user) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  return true
})

export default router
