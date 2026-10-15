import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/authStore'
import HomeView from '@/views/public/HomeView.vue'
import RidesView from '@/views/public/RidesView.vue'
import RideDetailView from '@/views/public/RideDetailView.vue'
import RegisterView from '@/views/public/RegisterView.vue'
import ProfileView from '@/views/private/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/rides',
      name: 'rides',
      component: RidesView,
    },
    {
      path: '/rides/:id',
      name: 'ride-detail',
      component: RideDetailView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/public/LoginView.vue'),
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/public/ResetPasswordView.vue'),
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/public/ForgotPasswordView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
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
      meta: { requiresAuth: true },
    },
    {
      path: '/rides/:id/edit',
      name: 'ride-edit',
      component: () => import('@/views/private/EditRideView.vue'),
      meta: { requiresAuth: true },
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
