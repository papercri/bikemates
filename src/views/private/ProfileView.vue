<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppPage from '@/components/layout/AppPage.vue'
import BrandLogo from '@/components/icons/BrandLogo.vue'
import RidgeStrip from '@/components/icons/RidgeStrip.vue'
import Alert from '@/components/ui/Alert.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Typography from '@/components/ui/Typography.vue'
import { useAuthStore } from '@/features/auth/stores/authStore'

useHead({
  title: 'Mi perfil | BikeMates',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

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

function handleTabKeydown(event: KeyboardEvent, index: number): void {
  const lastIndex = tabs.length - 1
  let nextIndex = index

  if (event.key === 'ArrowRight') {
    nextIndex = index === lastIndex ? 0 : index + 1
  } else if (event.key === 'ArrowLeft') {
    nextIndex = index === 0 ? lastIndex : index - 1
  } else if (event.key === 'Home') {
    nextIndex = 0
  } else if (event.key === 'End') {
    nextIndex = lastIndex
  } else {
    return
  }

  event.preventDefault()
  const nextTab = tabs[nextIndex]
  if (!nextTab) return
  activeTab.value = nextTab.id
  document.getElementById(`tab-${nextTab.id}`)?.focus()
}

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
  <AppPage size="profile" spacing="compact">
    <Card as="header" class="mb-8">
      <RidgeStrip />

      <div class="flex items-center gap-4 p-6 pt-4 sm:p-8 sm:pt-5">
        <div
          class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface text-ink ring-1 ring-line-strong"
        >
          <BrandLogo variant="simple" />
        </div>

        <div>
          <Typography as="p" variant="body-sm" tone="accent" class="font-medium">
            BIKEMATES
          </Typography>
          <Typography as="h1" variant="heading-lg" class="mt-1 tracking-tight">
            Mi perfil
          </Typography>
          <Typography class="mt-1" tone="muted">
            Gestiona tus datos y tu actividad ciclista.
          </Typography>
        </div>
      </div>
    </Card>

    <div
      class="flex gap-2 overflow-x-auto border-b border-line"
      role="tablist"
      aria-label="Secciones del perfil"
    >
      <button
        v-for="(tab, index) in tabs"
        :key="tab.id"
        :id="`tab-${tab.id}`"
        type="button"
        role="tab"
        :aria-selected="activeTab === tab.id"
        :aria-controls="`panel-${tab.id}`"
        :tabindex="activeTab === tab.id ? 0 : -1"
        class="shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-trail"
        :class="
          activeTab === tab.id
            ? 'border-trail text-trail-ink'
            : 'border-transparent text-graphite hover:text-ink'
        "
        @click="activeTab = tab.id"
        @keydown="handleTabKeydown($event, index)"
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
        <Typography as="h2" variant="heading-sm">Mis datos</Typography>
        <Typography class="mt-2" tone="muted">
          La edición de tus datos personales estará disponible en una próxima versión.
        </Typography>
      </template>

      <template v-else-if="tab.id === 'saved-rides'">
        <Typography as="h2" variant="heading-sm">Rutas guardadas</Typography>
        <Typography class="mt-2" tone="muted">
          Todavía no hay rutas guardadas. Aquí aparecerán las que marques desde Explorar rutas.
        </Typography>
      </template>

      <template v-else>
        <Typography as="h2" variant="heading-sm">Rutas publicadas</Typography>
        <Typography class="mt-2" tone="muted">
          Todavía no has publicado rutas. Aquí aparecerán las que crees desde BikeMates.
        </Typography>
      </template>
    </section>

    <section aria-labelledby="danger-zone-title">
      <Card variant="danger" class="mt-8 p-5 sm:p-6">
        <Typography id="danger-zone-title" as="h2" variant="heading-xs" class="text-red-700">
          Zona de peligro
        </Typography>

        <Typography variant="body-sm" tone="muted" class="mt-2 max-w-2xl leading-6">
          Eliminar tu cuenta es una acción irreversible. Esta operación eliminará tu cuenta si el
          servidor autoriza la solicitud.
        </Typography>

        <Button
          variant="destructive"
          size="sm"
          class="mt-5"
          :loading="isDeletingAccount"
          @click="handleDeleteAccount"
        >
          {{ isDeletingAccount ? 'Eliminando cuenta…' : 'Eliminar mi cuenta' }}
        </Button>

        <Alert v-if="deleteAccountError" class="mt-3">
          {{ deleteAccountError }}
        </Alert>
      </Card>
    </section>
  </AppPage>
</template>
