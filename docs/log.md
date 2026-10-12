# Registro de cambios

## 2026-10-12 — Refactorización del Design System

Refactor interna del frontend para unificar la UI sin cambiar el comportamiento de la aplicación.

### Nuevos

- `src/design-system/`: base del Design System.
  - `utils/cn.ts`: unión de clases condicionales.
  - `utils/variants.ts`: `createVariant`, equivalente mínimo de CVA sin dependencias.
  - `types.ts` + `index.ts`: tipos y API pública del DS.
- Primitivos de UI en `src/components/ui/`:
  - `Button` (variantes `primary` | `outline` | `destructive` | `link`; tamaños `sm` | `md` | `lg`; props `block`, `loading`, `to`, `href`).
  - `Input`, `Card` (`default` | `danger`, `interactive`, `as`), `Badge` (`soft` | `muted` + color `trail` | `route` | `ink` + `dot`), `Alert` (`error` | `success` con `role` ARIA automático), `Typography` (variantes de tipo + tono + `as`), `EmptyState`.
- Formularios en `src/components/forms/`: `PasswordInput` (compuesto sobre `Input`), `FormLabel`, `FormHelp`, `FormError`.
- Layout: `AppPage` (shell de página con header y tamaño de contenedor parametrizable) y `BrandLogo` (`full` | `simple`) en `components/common/`.
- Feature components: `AuthCard` (tarjeta de auth compartida), `RideCard`.
- Dominio de rutas: `src/features/rides/` con `types.ts`, `data/mockRides.ts` y `constants/rideLevels.ts` (colores por nivel).

### Cambios

- Todas las vistas reescritas sobre los primitivos; la lógica de negocio no cambia.
- `AppHeader` usa `Button` y `BrandLogo`.
- `RidgeStrip` y `ElevationSparkline` movidos a `components/common/` y `components/rides/`.
- `eslint.config.ts` reescrito para `@vue/eslint-config-typescript` v14 (el antiguo `defineConfigWithVueTs` descartaba la config y linteaba `dist/`).
- `authService.requestAccountDeletion` sin logs de debug ni código comentado; `EmailConfirmedView` sin `console.log` de debug.
- `EmailConfirmedView` migrado a tokens del DS (antes usaba `slate-*`, `green-*` y hex mágicos).

### Eliminados

- `src/features/auth/composables/useAuth.ts` (vacío).
- `src/views/private/AccountSettingsView.vue` (vacío, sin referencias).

### Decisiones

- Variantes de botón/tipo limitadas a las combinaciones realmente usadas; se extienden cuando aparezca un segundo uso.
- Unificación visual deliberada en `EmailConfirmedView` (colores off-token → tokens `trail`/`line`/`graphite`) y en botones outline del header (peso 500 → 600 para homogeneizar la variante `outline`).
- `createVariant` sin dependencias: no se instalaron librerías nuevas.

### Verificación

- `npm run type-check`, `npx eslint .`, `npx oxlint .`, `npx vitest run` (15/15), `npm run build`: en verde.
