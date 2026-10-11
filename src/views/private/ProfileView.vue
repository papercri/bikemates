
<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'

type ProfileTab = 'details' | 'saved-rides' | 'published-rides'

const activeTab = ref<ProfileTab>('details')

const tabs: { id: ProfileTab; label: string }[] = [
  { id: 'details', label: 'Mis datos' },
  { id: 'saved-rides', label: 'Rutas guardadas' },
  { id: 'published-rides', label: 'Rutas publicadas' },
]
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <AppHeader />

    <main class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-8">
        <p class="text-sm font-medium text-cyan-400">BIKEMATES</p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight">Mi perfil</h1>
        <p class="mt-2 text-slate-400">
          Gestiona tus datos y tu actividad ciclista.
        </p>
      </header>

      <div
        class="flex gap-2 overflow-x-auto border-b border-slate-800"
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
          class="shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-cyan-400"
          :class="
            activeTab === tab.id
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-white'
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
        class="py-6 focus-visible:outline-2 focus-visible:outline-cyan-400"
      >
        <template v-if="tab.id === 'details'">
          <h2 class="text-xl font-semibold">Mis datos</h2>
          <p class="mt-2 text-slate-400">
            Aquí mostraremos y editaremos tu información personal.
          </p>
        </template>

        <template v-else-if="tab.id === 'saved-rides'">
          <h2 class="text-xl font-semibold">Rutas guardadas</h2>
          <p class="mt-2 text-slate-400">
            Aquí aparecerán las rutas que hayas guardado.
          </p>
        </template>

        <template v-else>
          <h2 class="text-xl font-semibold">Rutas publicadas</h2>
          <p class="mt-2 text-slate-400">
            Aquí aparecerán las rutas que hayas publicado.
          </p>
        </template>
      </section>
    </main>
  </div>
</template>
