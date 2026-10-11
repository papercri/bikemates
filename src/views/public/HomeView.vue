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
  <div class="min-h-screen bg-snow text-ink">
    <AppHeader />

    <main>
      <section class="relative overflow-hidden" aria-labelledby="hero-title">
        <svg
          class="pointer-events-none absolute inset-0 h-full w-full opacity-70"
          aria-hidden="true"
          focusable="false"
          preserveAspectRatio="none"
          viewBox="0 0 1440 520"
        >
          <g fill="none" stroke="var(--color-line)" stroke-width="1.2">
            <path d="M-40 90 C 200 30, 420 140, 700 80 S 1180 20, 1480 100" />
            <path d="M-40 150 C 220 90, 460 190, 740 130 S 1200 80, 1480 160" />
            <path d="M-40 420 C 260 360, 500 470, 780 400 S 1220 350, 1480 430" />
            <path d="M-40 470 C 280 410, 520 510, 800 450 S 1240 400, 1480 480" />
          </g>
        </svg>

        <div
          class="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8"
        >
          <div class="max-w-xl">
            <p class="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-trail-ink">
              Tu próxima aventura empieza aquí
            </p>

            <h1
              id="hero-title"
              class="text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
            >
              Encuentra tu grupeta.
              <span class="text-trail-ink">Comparte la ruta.</span>
            </h1>

            <p class="mt-6 max-w-2xl text-lg leading-8 text-graphite">
              Conecta con ciclistas cerca de ti, organiza salidas y descubre nuevas rutas para
              disfrutar de la bici en compañía.
            </p>

            <div class="mt-9 flex flex-col gap-3 sm:flex-row">
              <RouterLink
                to="/rides"
                class="rounded-btn bg-trail px-6 py-3 text-center font-semibold text-ink transition-colors hover:bg-trail-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                Explorar rutas
              </RouterLink>

              <RouterLink
                to="/register"
                class="rounded-btn border border-line bg-canvas px-6 py-3 text-center font-semibold text-ink transition-colors hover:border-trail hover:text-trail-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-trail"
              >
                Únete a BikeMates
              </RouterLink>
            </div>
          </div>

          <div class="relative mx-auto w-full max-w-lg lg:max-w-none">
            <svg
              viewBox="0 0 480 340"
              class="w-full drop-shadow-sm"
              role="img"
              aria-label="Ilustración de un ciclista pedaleando por una cordillera alpina"
            >
              <circle cx="372" cy="64" r="34" fill="var(--color-route)" />
              <circle
                cx="372"
                cy="64"
                r="48"
                fill="none"
                stroke="var(--color-route)"
                stroke-opacity="0.3"
                stroke-width="2"
              />
              <g fill="none" stroke="var(--color-line)" stroke-width="1.2" opacity="0.9">
                <path d="M20 70 C 90 40, 170 95, 250 60 S 400 30, 470 75" />
                <path d="M20 105 C 100 75, 180 125, 260 95 S 410 65, 470 110" />
              </g>

              <path
                d="M0 250 L70 170 L130 225 L210 130 L290 220 L360 160 L480 250 V340 H0 Z"
                fill="var(--color-surface)"
              />
              <path
                d="M0 250 L70 170 L130 225 L210 130 L290 220 L360 160 L480 250"
                fill="none"
                stroke="var(--color-line)"
                stroke-width="2"
                stroke-linejoin="round"
              />

              <path
                d="M0 300 L90 245 L170 285 L260 230 L340 285 L420 250 L480 290 V340 H0 Z"
                fill="var(--color-canvas)"
                stroke="var(--color-line)"
                stroke-width="2"
                stroke-linejoin="round"
              />

              <g fill="var(--color-ink)" opacity="0.14">
                <path d="M52 248 l7 0 l-3.5 -16 z" />
                <path d="M62 252 l9 0 l-4.5 -20 z" />
                <path d="M318 282 l7 0 l-3.5 -16 z" />
                <path d="M329 286 l9 0 l-4.5 -20 z" />
                <path d="M196 236 l6 0 l-3 -13 z" />
              </g>

              <path
                d="M30 312 C 120 292, 200 322, 290 300 S 420 286, 458 302"
                fill="none"
                stroke="var(--color-trail)"
                stroke-width="3"
                stroke-dasharray="7 9"
                stroke-linecap="round"
                class="motion-safe:animate-trail-dash"
              />

              <g
                transform="translate(376 268) scale(1.15)"
                stroke="var(--color-ink)"
                fill="none"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="5" cy="13" r="4.2" />
                <circle cx="21" cy="13" r="4.2" />
                <path d="M5 13 L10 13 L13 5.5 L17.5 5.5 L21 13" />
                <path d="M10 13 L13 5.5" />
                <circle cx="10" cy="13" r="1.4" fill="var(--color-trail)" stroke="none" />
                <path
                  d="M12 5 L15 2.2 L17.2 1.2"
                  stroke="var(--color-ink)"
                />
                <circle cx="18.8" cy="0.8" r="1.9" fill="var(--color-ink)" stroke="none" />
                <path d="M14.6 3 L17 6.2 L16.2 9.5 L13.2 12.5" />
                <path d="M12.4 5.4 L14.8 8.8 L11.6 12.2" />
              </g>
            </svg>
          </div>
        </div>

        <div class="relative -mb-px" aria-hidden="true">
          <svg
            viewBox="0 0 1440 64"
            preserveAspectRatio="none"
            class="h-10 w-full sm:h-14"
            focusable="false"
          >
            <path
              d="M0 64 V34 L140 12 L280 38 L430 8 L580 40 L720 18 L870 44 L1020 10 L1170 36 L1310 16 L1440 38 V64 Z"
              fill="var(--color-surface)"
            />
            <path
              d="M0 34 L140 12 L280 38 L430 8 L580 40 L720 18 L870 44 L1020 10 L1170 36 L1310 16 L1440 38"
              fill="none"
              stroke="var(--color-line)"
              stroke-width="2"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </section>

      <section class="bg-surface" aria-labelledby="features-title">
        <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 id="features-title" class="text-2xl font-bold sm:text-3xl">
            Todo empieza con una ruta
          </h2>

          <p class="mt-3 max-w-2xl text-graphite">
            Encuentra personas con tus mismos intereses y convierte cada salida en una oportunidad
            para descubrir nuevos caminos.
          </p>

          <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <article class="rounded-card border border-line bg-canvas p-6 shadow-card">
              <svg
                viewBox="0 0 32 32"
                class="mb-4 h-8 w-8 text-trail-ink"
                aria-hidden="true"
                focusable="false"
              >
                <circle cx="10" cy="22" r="6" fill="none" stroke="currentColor" stroke-width="2" />
                <circle cx="24" cy="22" r="6" fill="none" stroke="currentColor" stroke-width="2" />
                <path
                  d="M10 22 L16 22 L19 12 L23 12 M16 22 L19 12"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M4 10 L10 5 L14 9"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  opacity="0.5"
                />
              </svg>
              <h3 class="text-lg font-semibold">Descubre rutas</h3>
              <p class="mt-3 leading-7 text-graphite">
                Encuentra próximas salidas y explora nuevos recorridos por tu zona.
              </p>
            </article>

            <article class="rounded-card border border-line bg-canvas p-6 shadow-card">
              <svg
                viewBox="0 0 32 32"
                class="mb-4 h-8 w-8 text-trail-ink"
                aria-hidden="true"
                focusable="false"
              >
                <circle cx="11" cy="11" r="4.5" fill="none" stroke="currentColor" stroke-width="2" />
                <circle cx="22" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="2" />
                <path
                  d="M3 27 C 3 21, 7 18, 11 18 C 15 18, 19 21, 19 27"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <path
                  d="M19 22 C 20 19.5, 21 19, 23 19 C 26.5 19, 29 22, 29 26.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              <h3 class="text-lg font-semibold">Conoce ciclistas</h3>
              <p class="mt-3 leading-7 text-graphite">
                Conecta con personas que comparten tu pasión por el ciclismo.
              </p>
            </article>

            <article class="rounded-card border border-line bg-canvas p-6 shadow-card">
              <svg
                viewBox="0 0 32 32"
                class="mb-4 h-8 w-8 text-trail-ink"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M4 26 L12 12 L17 20 L22 8 L28 26 Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linejoin="round"
                />
                <circle cx="22" cy="8" r="2.5" fill="var(--color-route)" />
              </svg>
              <h3 class="text-lg font-semibold">Organiza quedadas</h3>
              <p class="mt-3 leading-7 text-graphite">
                Propón una salida, define el recorrido y pedalea en compañía.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
