import type { RouteLocationRaw } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** Migas de pan estáticas de la ruta; la última entrada es la página actual. */
    breadcrumb?: { label: string; to?: RouteLocationRaw }[]
  }
}
