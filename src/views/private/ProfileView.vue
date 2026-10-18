<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppPage from '@/components/layout/AppPage.vue'
import BrandLogo from '@/components/icons/BrandLogo.vue'
import RidgeStrip from '@/components/icons/RidgeStrip.vue'
import Card from '@/components/ui/Card.vue'
import Typography from '@/components/ui/Typography.vue'
import ProfileDetailsTab from '@/features/profile/components/ProfileDetailsTab.vue'
import ProfileMyRidesTab from '@/features/profile/components/ProfileMyRidesTab.vue'

useHead({
  title: 'Mi perfil | BikeMates',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

type ProfileTab = 'details' | 'my-rides'

/** El query es entrada no confiable: cualquier valor desconocido vuelve a "Mis datos". */
function tabFromQuery(value: unknown): ProfileTab {
  return value === 'my-rides' ? 'my-rides' : 'details'
}

const route = useRoute()
const router = useRouter()

const activeTab = ref<ProfileTab>(tabFromQuery(route.query.tab))

// La pestaña activa vive en la URL: al volver atrás desde una ruta se restaura "Mis rutas".
watch(activeTab, (tab) => {
  if (tab === tabFromQuery(route.query.tab)) return

  const query: Record<string, unknown> = { ...route.query }

  if (tab === 'details') {
    delete query.tab
  } else {
    query.tab = tab
  }

  void router.replace({ query })
})

// "Rutas guardadas" queda fuera de la navegación hasta que se implemente la función.
const tabs: { id: ProfileTab; label: string }[] = [
  { id: 'details', label: 'Mis datos' },
  { id: 'my-rides', label: 'Mis rutas' },
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
</script>

<template>
  <AppPage spacing="compact">
    <Card as="header" class="mb-8">
      <RidgeStrip />

      <div class="flex items-center gap-4 p-6 pt-4 sm:p-8 sm:pt-5">
        <div
          class="flex h-16 w-16 shrink-0 items-center justify-center rounded-card bg-level-easy/10 text-ink ring-1 ring-level-easy/25"
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
        class="shrink-0 border-b border-line-strong px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink"
        :class="
          activeTab === tab.id
            ? 'border-level-easy text-level-easy-ink'
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
      class="py-6 focus-visible:outline-2 focus-visible:outline-ink"
    >
      <template v-if="tab.id === 'details'">
        <ProfileDetailsTab />
      </template>

      <template v-else>
        <ProfileMyRidesTab />
      </template>
    </section>
  </AppPage>
</template>
