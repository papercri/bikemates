import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/public/HomeView.vue'
import RidesView from '@/views/public/RidesView.vue'
import RideDetailView from '@/views/public/RideDetailView.vue'
import RegisterView from '@/views/public/RegisterView.vue'
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
  ],
})

export default router
