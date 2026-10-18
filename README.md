# BikeMates

Aplicación web para ciclistas en España: descubre rutas, encuentra compañeros de pedaleo y organiza salidas en grupo.

BikeMates es una SPA **mobile-first** construida con Vue 3 y TypeScript estricto, con acceso a datos sobre **Supabase** (autenticación, base de datos y Edge Functions), SEO técnico en las páginas públicas y una interfaz editorial minimalista.

## Funcionalidades

### Descubrimiento de rutas

- Listado de rutas con tarjeta por salida: localización, distancia, desnivel acumulado y nivel.
- Filtros compactos con etiquetas solo para lectores de pantalla: búsqueda por título (sin
  distinguir mayúsculas ni tildes), nivel, público y orden (`Por fecha`, `Por distancia`,
  `Por desnivel`).
- Dos páginas en el listado: `Próximas` y `Pasadas`, con sus recuentos; las pasadas salen
  ordenadas de la más reciente a la más antigua y atenuadas en la tarjeta.
- Detalle de ruta con perfil del recorrido (gráfico de desnivel), descripción y datos clave.
- Estado vacío y enlace de retorno cuando la ruta no existe.
- Los datos de rutas son de ejemplo (`src/features/rides/data/mockRides.ts`) hasta conectar con la base de datos.

### Cuenta de usuario

- **Registro** con validación de formulario: nombre (2–60 caracteres, sin HTML ni caracteres de control), email válido y contraseña de 8–128 caracteres con letra y número.
- **Inicio y cierre de sesión** con Supabase Auth; el header refleja el estado de sesión en tiempo real.
- **Confirmación de correo** en `/auth/confirm`.
- **Recuperación y restablecimiento de contraseña** (flujos `/forgot-password` y `/reset-password`, con detección de sesión de recuperación).
- **Perfil autenticado** con dos pestañas sincronizadas con la URL (`/profile` y
  `/profile?tab=my-rides`): **Mis datos** (avatar, nombre, email en solo lectura,
  cambio de contraseña y **borrado de cuenta** mediante Edge Function `delete-account`)
  y **Mis rutas** (buscador sin mayúsculas ni tildes, orden por fecha/distancia/desnivel,
  rejilla con tarjetas y acciones **Modificar**/**Eliminar** integradas en cada tarjeta,
  con confirmación modal antes de borrar).

### Páginas y infraestructura

- Landing pública con hero a pantalla completa (zoom de entrada y parallax al scroll), header transparente superpuesto, CTA, **política de privacidad** y **404** con `noindex`.
- Header con navegación principal y footer global en todas las vistas con shell.
- Navegación auxiliar: **breadcrumb** (`AppBreadcrumb`, alimentado por `meta.breadcrumb`
  del router, con la pestaña activa del perfil reflejada en la URL) y **barra de volver**
  (`AppBackBar`, historial del navegador con salida de respaldo) en las vistas
  internas; preloader gráfico compartido (`BikeLoader`, bici animada con rastro)
  para los estados de carga de rutas y perfil.
- Título y meta por ruta con `@unhead/vue`: la ruta de detalle genera un título dinámico y el perfil es `noindex`.
- Favicon SVG propio (marca sin texto) en `public/favicon.svg`.

## Stack

| Capa        | Tecnología                                                                                    |
| ----------- | --------------------------------------------------------------------------------------------- |
| Frontend    | Vue 3 (Composition API, `<script setup lang="ts">`), Vite, Vue Router, Pinia                  |
| Animaciones | `motion-v` (Motion for Vue): parallax con `useScroll`/`useTransform`, revelados `whileInView` |
| Lenguaje    | TypeScript estricto (sin `any`, `noUncheckedIndexedAccess`)                                   |
| Estilos     | Tailwind CSS v4 (tokens en `src/assets/main.css` vía `@theme`)                                |
| SEO         | `@unhead/vue`                                                                                 |
| Iconos      | Font Awesome free-solid (`@fortawesome/vue-fontawesome`)                                      |
| Backend     | Supabase: Auth, PostgreSQL con RLS, Edge Functions                                            |
| Tests       | Vitest + Vue Test Utils, Playwright                                                           |
| Calidad     | ESLint, oxlint, Prettier                                                                      |

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
  assets/                  # main.css (tokens @theme)
  composables/              # useInView…
  design-system/           # cn(), createVariant (equivalente mínimo de CVA) y tipos
  app/router/              # rutas y guards
  components/
    ui/                    # primitivos: Button, Input, Textarea, Card, Badge, Alert,
                           # Typography, EmptyState, ConfirmDialog (modal de
                           # confirmación), FormLabel, FormError, FormHelp,
                           # FormSelect, FormSelectField, PasswordInput, BikeLoader
    layout/                # AppHeader, AppFooter, AppPage (shell de página),
                           # AppBreadcrumb, AppBackBar, CookieBanner
    icons/                 # BrandLogo, RidgeStrip, CyclistScene, RidgeDivider,
                           # HeroBackdrop, Icon*
  features/
    auth/                  # components (AuthCard), composables (useAuthForm),
                           # services (Supabase Auth), stores (authStore),
                           # utils (emailLinkParams), validators
    profile/               # components (ProfileDetailsTab, ProfileMyRidesTab,
                           # ProfileAvatarField, ProfileNameForm, ProfilePasswordForm,
                           # ProfileDeleteAccount), composables, services
                           # (profileService), validators y types
    rides/                 # types, components (RideCard, RideFilters,
                           # RideTimeframeTabs, RideForm…), composables
                           # (useRideFilters, useRideList, useRideDetail…),
                           # constants (rideFilters), data, services, utils
                           # (rideOrdering), validators
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
- Estilo showroom editorial claro (referencia Cowboy): paleta acromática de
  porcelana (`canvas` `#FFFFFF`, `snow`/`surface` `#f3f4f6`), tinta carbón
  (`ink` `#1d1d1d`, `graphite` `#5e5e5e`) y filetes hairline (`line` `#e5e7eb`);
  los tokens de marca (`trail`, `route`, `turf`) conservan sus nombres y
  apuntan al carbón, de modo que no existe CTA cromático. `moss` y
  `signal-blue` quedan reservados a estados semánticos (el foco de los campos
  usa `signal-blue`). Estructura con filetes de 1px, sin sombras en tarjetas;
  solo `ConfirmDialog` conserva elevación. Radios: 8px en tarjetas, fotos y
  campos (`--radius-card`, `--radius-photo`, `--radius-field`); píldora en
  botones y badges (`--radius-btn`).
- Tipografía: Inter (sustituto de SuisseIntl) para todo el UI; titulares en
  peso 500 con tracking negativo (`-0.025em` a display), cuerpo en 400 y
  JetBrains Mono para etiquetas y datos tabulares.
- Contenedor único: `AppPage` envuelve todas las páginas con `max-w-7xl` (el mismo que header
  y footer); la prop `bleed` queda reservada a las bandas a sangre de la landing y la anchura
  de lectura se controla dentro de cada vista (`max-w-lg`, `max-w-3xl`…).
- La receta de campos de formulario (`FIELD_CLASSES` en `src/design-system/field.ts`) se comparte entre `Input`, `Textarea` y `FormSelect` para mantener borde, radio, foco y estados idénticos.
- Los primitivos exponen variantes homogéneas (`variant`, `size`, `tone`, `loading`, `block`, `dot`…) construidas con `createVariant`, sin dependencias externas.
- `Button` incluye los tamaños `xs`–`lg` y, además de `primary`/`outline`/`destructive`, las variantes `sun`/`sun-outline` (sobre fotos y fondos oscuros: píldora blanca con texto carbón, o contorno blanco) y `quiet-destructive` (acción peligrosa discreta, el color solo aparece al interactuar).
- `ConfirmDialog` es el modal estándar de confirmaciones y acciones irreversibles (`role="dialog"`, `aria-modal`, trampa de foco, Escape y clic en el fondo para cancelar). Los mensajes de formulario se mantienen como `Alert` inline con `role="alert"`.
- Los iconos de navegación y acciones usan Font Awesome (free-solid) con `FontAwesomeIcon`; los SVG ilustrativos y de datos siguen en `src/components/icons/`.
- Motion con `motion-v` (Motion for Vue): la home usa `useScroll`/`useTransform` para el parallax del hero (offset por sección, rango 12 %) y componentes `motion.div` con `whileInView` (`opacity` + `y`) para revelar bloques; el zoom de entrada del hero es un `scale` animado al montar. `MotionConfig reduced-motion="user"` en `App.vue` respeta `prefers-reduced-motion` en toda la app. El header de la home es transparente (`meta.overlayHeader` en el router) y se superpone al hero a pantalla completa.
- Los componentes de UI reciben datos por props y emiten eventos; el estado compartido vive en Pinia (`authStore`).

## Seguridad

- Cliente Supabase único en `src/services/supabase.ts` con la clave pública; RLS como frontera de autorización.
- Entradas no confiables validadas en los límites (registro, query params de rutas, respuestas externas).
- Sin `v-html`, sin dependencias nuevas de validación, sin tokens persistidos a mano.
- Campos privilegiados y operaciones sensibles (borrado de cuenta) resueltos en el servidor.

## Calidad y tests

- **Unit**: `npm run test:unit` — 525 tests en 78 archivos (design system, validadores, servicios y composables de rutas, servicio de autenticación, store de sesión, primitivos de UI, filtros del listado, iconos SVG, pestañas del perfil, vistas privadas y componentes de navegación).
- **E2E**: `npm run test:e2e` — Playwright en Chromium y móvil (138 tests en verde: autenticación, perfil, creación de ruta, listado, detalle y navegación).
- Gates antes de dar por completa una tarea: `npm run test:unit -- --run`, `npm run type-check`, `npx eslint .`, `npx oxlint .`, Prettier y, cuando toca, `npm run build`.
