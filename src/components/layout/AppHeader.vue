<script setup lang="ts"></script>

<template>
  <header class="border-b border-slate-800 bg-slate-950 text-white">
    <div
      class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
    >
      <RouterLink
        to="/"
        class="shrink-0 text-xl font-bold tracking-tight text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400"
        aria-label="BikeMates, página de inicio"
      >
        Bike<span class="text-cyan-400">Mates</span>
      </RouterLink>

      <nav aria-label="Navegación principal" class="hidden items-center gap-6 sm:flex">
        <RouterLink to="/rides" class="text-sm text-slate-300 transition-colors hover:text-white">
          Explorar rutas
        </RouterLink>

        <RouterLink
          to="/community"
          class="text-sm text-slate-300 transition-colors hover:text-white"
        >
          Comunidad
        </RouterLink>
      </nav>

      <RouterLink
        to="/login"
        class="shrink-0 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-cyan-400 hover:text-cyan-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400"
      >
        Iniciar sesión
      </RouterLink>
    </div>
  </header>
</template>
