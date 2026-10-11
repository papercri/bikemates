<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import RidgeStrip from '@/components/ui/RidgeStrip.vue'
import { useAuthStore } from '@/features/auth/stores/authStore'

type ProfileTab = 'details' | 'saved-rides' | 'published-rides'

const activeTab = ref<ProfileTab>('details')
const isDeletingAccount = ref(false)
const deleteAccountError = ref('')

const authStore = useAuthStore()
const router = useRouter()

const tabs: { id: ProfileTab; label: string }[] = [
  { id: 'details', label: 'Mis datos' },
  { id: 'saved-rides', label: 'Rutas guardadas' },
  { id: 'published-rides', label: 'Rutas publicadas' },
]

async function handleDeleteAccount(): Promise<void> {
  const confirmed = window.confirm(
    '¿Estás segura de que quieres eliminar tu cuenta de BikeMates? Esta acción es irreversible.',
  )

  if (!confirmed) return

  isDeletingAccount.value = true
  deleteAccountError.value = ''

  try {
    await authStore.deleteAccount()
    await router.replace({ name: 'home' })
  } catch {
    deleteAccountError.value = 'No se ha podido eliminar la cuenta. Inténtalo de nuevo más tarde.'
  } finally {
    isDeletingAccount.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-snow text-ink">
    <AppHeader />

    <main class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-8 overflow-hidden rounded-card border border-line bg-canvas shadow-card">
        <RidgeStrip />

        <div class="flex items-center gap-4 p-6 pt-4 sm:p-8 sm:pt-5">
          <div
            class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-trail text-ink"
          >
            <svg viewBox="0 0 44 28" class="h-9 w-12" aria-hidden="true" focusable="false">
              <g
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="8" cy="20" r="5.5" />
                <circle cx="30" cy="20" r="5.5" />
                <path d="M8 20 L15 20 L18 10 L25 10 L30 20" />
                <path d="M15 20 L18 10" />
              </g>
            </svg>
          </div>

          <div>
            <p class="text-sm font-medium text-trail-ink">BIKEMATES</p>
            <h1 class="mt-1 text-3xl font-bold tracking-tight">Mi perfil</h1>
            <p class="mt-1 text-graphite">Gestiona tus datos y tu actividad ciclista.</p>
          </div>
        </div>
      </header>

      <div
        class="flex gap-2 overflow-x-auto border-b border-line"
        role="tablist"
        aria-label="Secciones del perfil"
      >
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :id="`tab-${tab.id}`"
          type="button"
          role="tab"
          :aria-selected="activeTab === tab.id"
          :aria-controls="`panel-${tab.id}`"
          :tabindex="activeTab === tab.id ? 0 : -1"
          class="shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-trail"
          :class="
            activeTab === tab.id
              ? 'border-trail text-trail-ink'
              : 'border-transparent text-graphite hover:text-ink'
          "
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <section
        v-for="tab in tabs"
        v-show="activeTab === tab.id"
        :id="`panel-${tab.id}`"
        :key="tab.id"
        role="tabpanel"
        :aria-labelledby="`tab-${tab.id}`"
        tabindex="0"
        class="py-6 focus-visible:outline-2 focus-visible:outline-trail"
      >
        <template v-if="tab.id === 'details'">
          <h2 class="text-xl font-semibold">Mis datos</h2>
          <p class="mt-2 text-graphite">Aquí mostraremos y editaremos tu información personal.</p>
        </template>

        <template v-else-if="tab.id === 'saved-rides'">
          <h2 class="text-xl font-semibold">Rutas guardadas</h2>
          <p class="mt-2 text-graphite">Aquí aparecerán las rutas que hayas guardado.</p>
        </template>

        <template v-else>
          <h2 class="text-xl font-semibold">Rutas publicadas</h2>
          <p class="mt-2 text-graphite">Aquí aparecerán las rutas que hayas publicado.</p>
        </template>
      </section>

      <section
        aria-labelledby="danger-zone-title"
        class="mt-8 rounded-card border border-red-200 bg-red-50 p-5 sm:p-6"
      >
        <h2 id="danger-zone-title" class="text-lg font-semibold text-red-700">Zona de peligro</h2>

        <p class="mt-2 max-w-2xl text-sm leading-6 text-graphite">
          Eliminar tu cuenta es una acción irreversible. Esta operación eliminará tu cuenta si el
          servidor autoriza la solicitud.
        </p>

        <button
          type="button"
          :disabled="isDeletingAccount"
          class="mt-5 rounded-btn border border-red-300 bg-canvas px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          @click="handleDeleteAccount"
        >
          {{ isDeletingAccount ? 'Eliminando cuenta…' : 'Eliminar mi cuenta' }}
        </button>

        <p v-if="deleteAccountError" role="alert" class="mt-3 text-sm text-red-600">
          {{ deleteAccountError }}
        </p>
      </section>
    </main>
  </div>
</template>
