# BikeMates

Aplicación web para ciclistas en España: descubre rutas, encuentra compañeros de pedaleo y organiza salidas en grupo.

BikeMates es una SPA **mobile-first** construida con Vue 3 y TypeScript estricto, con acceso a datos sobre **Supabase** (autenticación, base de datos y Edge Functions), SEO técnico en las páginas públicas y una interfaz clara y luminosa según el design system **Clean Alpine & Light** (fondo claro, acentos verde `trail` y naranja `route`, tipografía Inter).

## Funcionalidades

### Descubrimiento de rutas

- Listado de rutas con tarjeta por salida: localización, distancia, desnivel acumulado y nivel.
- Filtro por nivel: `Iniciación`, `Intermedio` y `Avanzado`.
- Detalle de ruta con perfil del recorrido (gráfico de desnivel), descripción y datos clave.
- Estado vacío y enlace de retorno cuando la ruta no existe.
- Los datos de rutas son de ejemplo (`src/features/rides/data/mockRides.ts`) hasta conectar con la base de datos.

### Cuenta de usuario

- **Registro** con validación de formulario: nombre (2–60 caracteres, sin HTML ni caracteres de control), email válido y contraseña de 8–128 caracteres con letra y número.
- **Inicio y cierre de sesión** con Supabase Auth; el header refleja el estado de sesión en tiempo real.
- **Confirmación de correo** en `/auth/confirm`.
- **Recuperación y restablecimiento de contraseña** (flujos `/forgot-password` y `/reset-password`, con detección de sesión de recuperación).
- **Perfil autenticado** con pestañas accesibles (detalles, rutas guardadas y publicadas), cierre de sesión y **borrado de cuenta** mediante Edge Function `delete-account`.

### Páginas y infraestructura

- Landing pública con CTA, **política de privacidad** y **404** con `noindex`.
- Header con navegación principal y footer global en todas las vistas con shell.
- Título y meta por ruta con `@unhead/vue`: ninguna página muestra el título por defecto de Vite, la ruta de detalle genera un título dinámico y el perfil es `noindex`.
- Favicon SVG propio (marca sin texto) en `public/favicon.svg`.

## Stack

| Capa     | Tecnología                                                                   |
| -------- | ---------------------------------------------------------------------------- |
| Frontend | Vue 3 (Composition API, `<script setup lang="ts">`), Vite, Vue Router, Pinia |
| Lenguaje | TypeScript estricto (sin `any`, `noUncheckedIndexedAccess`)                  |
| Estilos  | Tailwind CSS v4 (tokens en `src/assets/main.css` vía `@theme`)               |
| SEO      | `@unhead/vue`                                                                |
| Backend  | Supabase: Auth, PostgreSQL con RLS, Edge Functions                           |
| Tests    | Vitest + Vue Test Utils, Playwright                                          |
| Calidad  | ESLint, oxlint, Prettier                                                     |

## Requisitos

- Node.js `^22.18.0 || >=24.12.0` y npm.
- Un proyecto de Supabase con Auth habilitado y, para el borrado de cuenta, la Edge Function `delete-account`.

## Puesta en marcha

```bash
npm install
npm run dev
```

Copia las variables de entorno a `.env.local` (usa `.env.example` como plantilla):

| Variable                 | Descripción                                   |
| ------------------------ | --------------------------------------------- |
| `VITE_SUPABASE_URL`      | URL del proyecto Supabase                     |
| `VITE_SUPABASE_ANON_KEY` | Clave pública (anon/publishable) del proyecto |

La aplicación falla de forma explícita al arrancar si faltan estas variables. Nunca se debe usar la clave `service_role` en el navegador: se reserva para el servidor y las Edge Functions.

## Scripts

```bash
npm run dev        # servidor de desarrollo
npm run build      # type-check + build de producción
npm run preview    # previsualiza el build
npm run type-check # vue-tsc --build
npm run lint       # oxlint + eslint (con --fix)
npm run format     # prettier --write src/
npm run test:unit  # vitest
npm run test:e2e   # playwright
```

## Rutas

| Ruta               | Vista                       | Acceso      |
| ------------------ | --------------------------- | ----------- |
| `/`                | HomeView                    | público     |
| `/rides`           | RidesView                   | público     |
| `/rides/:id`       | RideDetailView              | público     |
| `/register`        | RegisterView                | público     |
| `/login`           | LoginView                   | público     |
| `/forgot-password` | ForgotPasswordView          | público     |
| `/reset-password`  | ResetPasswordView           | público     |
| `/auth/confirm`    | EmailConfirmedView          | público     |
| `/privacy`         | PrivacyView                 | público     |
| `/profile`         | ProfileView                 | autenticado |
| cualquier otra     | NotFoundView (404, noindex) | público     |

El guard de router resuelve la sesión antes de navegar y redirige a `/login?redirect=…` cuando la ruta exige autenticación. **El guard no es un límite de seguridad**: la autorización real la aplican las políticas de RLS de PostgreSQL.

## Arquitectura

```text
src/
  assets/main.css          # tokens del Design System (@theme) y estilos globales
  design-system/           # cn(), createVariant (equivalente mínimo de CVA) y tipos
  app/router/              # rutas y guards
  components/
    ui/                    # primitivos: Button, Input, Textarea, Card, Badge, Alert,
                           # Typography, EmptyState, FormLabel, FormError, FormHelp,
                           # FormSelect, PasswordInput
    layout/                # AppHeader, AppFooter, AppPage (shell de página)
    icons/                 # BrandLogo, RidgeStrip, CyclistScene, RidgeDivider,
                           # HeroBackdrop, Icon*
  features/
    auth/                  # components (AuthCard), composables (useAuthForm),
                           # services (Supabase Auth), stores (authStore),
                           # utils (emailLinkParams), validators
    rides/                 # types, components, composables (useRideImagePicker,
                           # usePlaceSearch, useRideDetail, useRideList),
                           # constants, data, services, utils, validators
  services/                # cliente Supabase (único punto de acceso)
  utils/                   # utilidades puras (dates, validators…)
  views/                   # public/ y private/
e2e/                       # tests Playwright
docs/log.md                # registro de cambios
```

Separación de responsabilidades: las vistas orquestan, los componentes presentan, los servicios acceden a datos y los UI primitivos no conocen Supabase.

## Design System

- Los componentes visuales viven en `src/components/` y no contienen lógica de negocio.
- Los SVG decorativos e iconográficos viven en `src/components/icons/` como componentes propios (`CyclistScene`, `RidgeDivider`, `HeroBackdrop`, `Icon*`); las vistas y componentes solo los componen.
- Los tokens (colores, radios, sombras, tipografías) se definen una sola vez en `src/assets/main.css`.
- Los primitivos exponen variantes homogéneas (`variant`, `size`, `tone`, `loading`, `block`, `dot`…) construidas con `createVariant`, sin dependencias externas.
- Los componentes de UI reciben datos por props y emiten eventos; el estado compartido vive en Pinia (`authStore`).

## Seguridad

- Cliente Supabase único en `src/services/supabase.ts` con la clave pública; RLS como frontera de autorización.
- Entradas no confiables validadas en los límites (registro, query params de rutas, respuestas externas).
- Sin `v-html`, sin dependencias nuevas de validación, sin tokens persistidos a mano.
- Campos privilegiados y operaciones sensibles (borrado de cuenta) resueltos en el servidor.

## Calidad y tests

- **Unit**: `npm run test:unit` — 110 tests en 19 archivos (design system, validadores, servicio de autenticación, store de sesión, primitivos de UI e iconos SVG).
- **E2E**: `npm run test:e2e` — Playwright (configurado en `playwright.config.ts`).
- Gates antes de dar por completa una tarea: `npm run test:unit -- --run`, `npm run type-check`, `npx eslint .`, `npx oxlint .`, Prettier y, cuando toca, `npm run build`.

## Documentación

- `docs/log.md`: historial de cambios fechado.
- `AGENTS.md`: convenciones de código, seguridad, accesibilidad y flujo de trabajo del proyecto.
