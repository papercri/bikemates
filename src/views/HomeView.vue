<script setup lang="ts">
import { useHead } from '@unhead/vue'
import AppHeader from '@/components/layout/AppHeader.vue'

useHead({
  title: 'BikeMates | Encuentra ciclistas y rutas',
  meta: [
    {
      name: 'description',
      content:
        'Encuentra ciclistas cerca de ti, descubre rutas y organiza salidas en grupo por España.',
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <AppHeader />

    <main>
      <section
        class="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
        aria-labelledby="hero-title"
      >
        <div class="max-w-3xl">
          <p class="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Tu próxima aventura empieza aquí
          </p>

          <h1 id="hero-title" class="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Encuentra tu grupeta.
            <span class="text-cyan-400">Comparte la ruta.</span>
          </h1>

          <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Conecta con ciclistas cerca de ti, organiza salidas y descubre nuevas rutas para
            disfrutar de la bici en compañía.
          </p>

          <div class="mt-9 flex flex-col gap-3 sm:flex-row">
            <RouterLink
              to="/rides"
              class="rounded-lg bg-cyan-400 px-6 py-3 text-center font-semibold text-slate-950 transition-colors hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Explorar rutas
            </RouterLink>

            <RouterLink
              to="/register"
              class="rounded-lg border border-slate-700 px-6 py-3 text-center font-semibold text-white transition-colors hover:border-cyan-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Únete a BikeMates
            </RouterLink>
          </div>
        </div>
      </section>

      <section class="border-t border-slate-800 bg-slate-900/50" aria-labelledby="features-title">
        <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 id="features-title" class="text-2xl font-bold sm:text-3xl">
            Todo empieza con una ruta
          </h2>

          <p class="mt-3 max-w-2xl text-slate-400">
            Encuentra personas con tus mismos intereses y convierte cada salida en una oportunidad
            para descubrir nuevos caminos.
          </p>

          <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <article class="rounded-xl border border-slate-800 bg-slate-950 p-6">
              <h3 class="text-lg font-semibold">Descubre rutas</h3>
              <p class="mt-3 leading-7 text-slate-400">
                Encuentra próximas salidas y explora nuevos recorridos por tu zona.
              </p>
            </article>

            <article class="rounded-xl border border-slate-800 bg-slate-950 p-6">
              <h3 class="text-lg font-semibold">Conoce ciclistas</h3>
              <p class="mt-3 leading-7 text-slate-400">
                Conecta con personas que comparten tu pasión por el ciclismo.
              </p>
            </article>

            <article class="rounded-xl border border-slate-800 bg-slate-950 p-6">
              <h3 class="text-lg font-semibold">Organiza quedadas</h3>
              <p class="mt-3 leading-7 text-slate-400">
                Propón una salida, define el recorrido y pedalea en compañía.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
