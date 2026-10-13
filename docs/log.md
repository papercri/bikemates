# Registro de cambios

## 2026-10-13 — SVGs extraídos a componentes (`src/components/svg/`)

Sin cambios de comportamiento: el marcado SVG pasa de vistas/componentes a componentes propios.

- Nueva carpeta `src/components/svg/` con todos los SVG de la aplicación:
  - `CyclistScene` (ilustración del hero), `HeroBackdrop` (líneas de fondo del hero) y `RidgeDivider` (crestas al pie del hero), extraídos de `HomeView`.
  - `IconRoutes`, `IconCyclists`, `IconMeetup` (tarjetas de features del hero), `IconDistance`, `IconElevation`, `IconLevel` (datos de `RideDetailView`).
  - `IconArrow` (`direction: 'left' | 'right'`, paths compartidos) usado por el enlace "Volver a las rutas" y por `RideCard`.
  - `IconEye` (`hidden: boolean`) usado por `PasswordInput` para el toggle de visibilidad.
- `BrandLogo` y `RidgeStrip` movidos de `src/components/common/` (carpeta eliminada) a `src/components/svg/`; solo cambian las rutas de import en `AppHeader`, `AuthCard` y `ProfileView`.
- Los iconos fijan su tamaño por defecto (`h-8 w-8`, `h-4 w-4`, `h-3.5 w-3.5`, `h-5 w-5`) y `aria-hidden`/`focusable`; el caller aporta color, margen y transiciones (las clases se fusionan por fallthrough).
- Animación del sendero del hero: el `<style scoped>` de `HomeView` (que pisaba `motion-safe:animate-trail-dash` con `!important`) pasa a `CyclistScene` como clase propia `.trail-animated` dentro de `@media (prefers-reduced-motion: no-preference)`. Mismo resultado visual y ahora también se respeta `prefers-reduced-motion` (antes la animación seguía activa con movimiento reducido).
- `README.md`: estructura y design system actualizados (carpeta `svg/`).
- Nuevos tests: `src/components/svg/__tests__/IconArrow.spec.ts` y `IconEye.spec.ts`.

### Verificación

- `npm run type-check`, `npx vitest run` (110/110), `npm run lint` (oxlint + eslint), `npm run build` y `prettier --check`: en verde.
- Render montado en jsdom para confirmar que las clases del caller se fusionan con las del icono (fallthrough) y que `CyclistScene` mantiene la clase de animación.

## 2026-10-12 — Favicon, títulos por página y README

- `public/favicon.svg`: icono nuevo con la marca del logo (montaña + bicicleta + punto verde), sin texto y en colores fijos de tokens (`#1a1d20`, `#22c55e`, borde `#e9ecef`).
- `index.html`: `lang="es"`, `<title>BikeMates</title>` (se elimina el título por defecto `Vite App`), favicon SVG en lugar del `/favicon.ico` inexistente y meta description de respaldo.
- Títulos con `useHead` en todas las vistas que no tenían: `LoginView` (`Iniciar sesión | BikeMates`), `RegisterView` (`Crear cuenta | BikeMates`), `ForgotPasswordView`, `ResetPasswordView`, `EmailConfirmedView`, `RidesView` (`Explorar rutas | BikeMates`, con description) y `ProfileView` (`Mi perfil | BikeMates`).
- `RideDetailView`: título dinámico con el nombre de la ruta y fallback `Ruta no encontrada | BikeMates`.
- `ProfileView`: meta `robots: noindex, nofollow` (ruta privada).
- `README.md` reescrito: descripción del proyecto, funcionalidades, stack, requisitos, setup, variables de entorno, scripts, rutas, arquitectura, design system, seguridad, tests y documentación.
- Nuevo `.env.example` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (placeholders seguros).

### Verificación

- `npm run test:unit -- --run` (106/106), `npm run type-check`, `npx eslint .`, `npx oxlint .`, Prettier check y `npm run build`: en verde. `dist/index.html` ya no contiene "Vite App" y sí `favicon.svg`.

## 2026-10-12 — Ampliación de tests unitarios

Sin cambios de comportamiento: solo tests.

- Nuevos:
  - `src/design-system/utils/cn.spec.ts`: unión de clases y descarte de valores falsy.
  - `src/design-system/utils/variants.spec.ts`: `createVariant` (base, variantes por defecto, selección parcial, compound variants, entradas `undefined` y clases falsy).
  - `src/features/rides/constants/rideLevels.spec.ts`: niveles, colores de badge y clases de punto, con cobertura exacta del dominio `RideLevel`.
  - `src/features/auth/services/authService.spec.ts`: `registerUser`, `loginUser`, `requestPasswordReset`, `updatePassword` y `requestAccountDeletion` con Supabase mockeado (trim de credenciales, correo ya registrado, propagación de errores).
  - `src/components/ui/__tests__/`: `Alert` (roles ARIA), `Badge` (combinaciones variant/color + dot), `Button` (type, loading/disabled, block, variante `link` sin padding, `to`/`href`), `Card` (elemento, superficie `danger`, `interactive`), `Input` (v-model, atributos de validación, `trailing`), `Typography` (elemento, variant, tone).
  - `src/components/forms/__tests__/PasswordInput.spec.ts`: tipo por defecto, toggle accesible (`aria-label`/`aria-pressed`), sincronía del modelo.
  - `src/components/rides/__tests__/ElevationSparkline.spec.ts`: viewBox por variante, `aria-hidden`, polilínea y path de área deterministas.
  - `src/components/rides/__tests__/RideCard.spec.ts`: título, localización, cifras, badge por nivel y enlace a `ride-detail`.
- Ampliado `src/utils/validators/registerValidator.spec.ts`: ramas no cubiertas (vacío/espacios, caracteres de control, límites de longitud, todos los errores a la vez, trim del nombre). Reformatado con Prettier.

### Verificación

- `npm run test:unit -- --run` (106/106), `npm run type-check`, `npx eslint .`, `npx oxlint .`, Prettier check: en verde.

## 2026-10-12 — Footer global, página de privacidad y 404

- Nuevo `AppFooter` (`src/components/layout/AppFooter.vue`): copyright centrado con año dinámico y texto `xs` (`© {year} BikeMates · Comparte rutas. Comparte kilómetros. · by Cristiana Sollini`, con "Cristiana Sollini" enlazado a https://frontend-ux.website/ en `_blank` + `rel="noopener noreferrer"`) y enlace a "Política de privacidad" en línea propia.
- `AppPage` incluye el footer: todas las vistas con shell lo heredan.
- `EmailConfirmedView` ahora muestra `AppHeader` y `AppFooter` (era la única vista sin header).
- Nueva ruta `/privacy` (`PrivacyView`) con contenido de compromiso de privacidad, `useHead` (título + descripción) y contacto por `mailto`. Contenedor `detail` (max-w-4xl) y texto `body-sm`, enlaces en gris.
- Nueva ruta catch-all `/:pathMatch(.*)*` → `NotFoundView` (404) con `EmptyState` centrado, CTAs al inicio y a rutas, y meta `robots: noindex`.
- Test unitario de `AppFooter` (año dinámico + enlace de privacidad).
- `AppPage` con sticky footer (`flex min-h-screen flex-col` + `main` con `flex-1`).
- Footer centrado, texto `xs`, "Cristiana Sollini" enlazado a https://frontend-ux.website/ (`_blank` + `rel="noopener noreferrer"`) en gris.
- Header sin el enlace "Comunidad" (ruta inexistente).

### Verificación

- `npm run type-check`, `npx eslint .`, `npx oxlint .`, `npx vitest run` (16/16), `npm run build`: en verde.

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
