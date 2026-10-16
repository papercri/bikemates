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
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Typography from '@/components/ui/Typography.vue'
import { useAuthStore } from '@/features/auth/stores/authStore'

useHead({
  title: 'Mi perfil | BikeMates',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

type ProfileTab = 'details' | 'saved-rides' | 'published-rides'

const activeTab = ref<ProfileTab>('details')
const isDeletingAccount = ref(false)
const isDeleteDialogOpen = ref(false)
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

function requestAccountDeletion(): void {
  if (isDeletingAccount.value) return
  deleteAccountError.value = ''
  isDeleteDialogOpen.value = true
}

function cancelAccountDeletion(): void {
  if (isDeletingAccount.value) return
  isDeleteDialogOpen.value = false
}

async function confirmAccountDeletion(): Promise<void> {
  isDeletingAccount.value = true
  deleteAccountError.value = ''

  try {
    await authStore.deleteAccount()
    isDeleteDialogOpen.value = false
    await router.replace({ name: 'home' })
  } catch {
    deleteAccountError.value = 'No se ha podido eliminar la cuenta. Inténtalo de nuevo más tarde.'
    isDeleteDialogOpen.value = false
  } finally {
    isDeletingAccount.value = false
  }
}
</script>

<template>
  <AppPage spacing="compact">
    <Card as="header" class="mb-8">
      <RidgeStrip />

      <div class="flex items-center gap-4 p-6 pt-4 sm:p-8 sm:pt-5">
        <div
          class="flex h-16 w-16 shrink-0 items-center justify-center bg-surface text-ink ring-1 ring-line-strong"
        >
          <BrandLogo variant="simple" />
        </div>

        <div>
          <Typography as="h1" variant="heading-lg" class="tracking-tight"> Mi perfil </Typography>
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
        <Typography class="mt-2 max-w-2xl leading-7" tone="muted">
          La edición de tus datos personales estará disponible en una próxima versión.
        </Typography>

        <div class="mt-10 border-t border-line pt-5">
          <Typography variant="body-sm" tone="muted" class="max-w-2xl leading-6">
            Eliminar tu cuenta borra de forma permanente tu perfil y tus datos asociados. Esta
            acción es irreversible.
          </Typography>

          <div class="mt-3 flex flex-wrap items-center gap-4">
            <Button
              variant="quiet-destructive"
              size="sm"
              :loading="isDeletingAccount"
              :disabled="isDeletingAccount"
              @click="requestAccountDeletion"
            >
              {{ isDeletingAccount ? 'Eliminando cuenta…' : 'Eliminar mi cuenta' }}
            </Button>

            <Alert v-if="deleteAccountError">
              {{ deleteAccountError }}
            </Alert>
          </div>
        </div>
      </template>

      <template v-else-if="tab.id === 'saved-rides'">
        <EmptyState
          title="Rutas guardadas"
          description="Todavía no has guardado ninguna ruta. Las que marques desde Explorar rutas aparecerán aquí."
        >
          <Button to="/rides" variant="outline">Explorar rutas</Button>
        </EmptyState>
      </template>

      <template v-else>
        <EmptyState
          title="Rutas publicadas"
          description="Todavía no has publicado ninguna ruta. Crea la primera y aparecerá aquí."
        >
          <Button to="/rides/create">Publicar ruta</Button>
        </EmptyState>
      </template>
    </section>

    <ConfirmDialog
      :open="isDeleteDialogOpen"
      tone="danger"
      title="¿Eliminar tu cuenta?"
      description="Tu cuenta y tus datos asociados se eliminarán de forma permanente. Esta acción es irreversible."
      confirm-label="Eliminar mi cuenta"
      cancel-label="Cancelar"
      :is-busy="isDeletingAccount"
      @confirm="confirmAccountDeletion"
      @cancel="cancelAccountDeletion"
    />
  </AppPage>
</template>
