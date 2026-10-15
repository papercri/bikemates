
import { createApp } from 'vue'
import { createHead } from '@unhead/vue/client'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './app/router'
import { useAuthStore } from '@/features/auth/stores/authStore'
import './assets/main.css'

async function bootstrap(): Promise<void> {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(createHead())

  const authStore = useAuthStore(pinia)

  try {
    await authStore.initialize()
  } catch (error: unknown) {
    console.error('No se pudo inicializar la autenticación.', error)
  }

  app.use(router)
  await router.isReady()

  app.mount('#app')
}

void bootstrap()
