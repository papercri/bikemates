# bikemates

Aplicación web para ciclistas en España: descubre rutas, encuentra compañeros y organiza salidas en grupo.

## Stack

- Vue 3 (Composition API, `<script setup lang="ts">`) + Vite
- TypeScript estricto
- Tailwind CSS v4 (tokens en `src/assets/main.css` vía `@theme`)
- Supabase (auth, base de datos, Edge Functions)
- Pinia, Vue Router, `@unhead/vue`
- Vitest + Playwright, ESLint (oxlint) y Prettier

## Scripts

```bash
npm run dev        # servidor de desarrollo
npm run build      # type-check + build de producción
npm run type-check # vue-tsc
npm run lint       # oxlint + eslint (con --fix)
npm run format     # prettier --write src/
npm run test:unit  # vitest
npm run test:e2e   # playwright
```

## Design System

Los componentes visuales viven en `src/components/` y no contienen lógica de negocio:

```text
src/
  design-system/          # cn(), createVariant (CVA equivalente) y tipos del DS
  components/
    ui/                   # primitivos: Button, Input, Card, Badge, Alert, Typography, EmptyState
    forms/                # PasswordInput, FormLabel, FormHelp, FormError
    layout/               # AppHeader, AppPage (shell de página)
    common/               # BrandLogo, RidgeStrip
    features/             # AuthCard
    rides/                # RideCard, ElevationSparkline
```

- Los tokens (colores, radios, sombras, fuentes) se definen una sola vez en `src/assets/main.css` (`@theme`).
- Los componentes UI reciben datos por props y exponen variantes homogéneas (`variant`, `size`, `tone`, `loading`, `block`…).
- Las vistas (`src/views/`) componen primitivos y concentran la orquestación; el acceso a datos está en `src/features/*/services` y `src/services/`.

Ver `docs/log.md` para el historial de cambios.
