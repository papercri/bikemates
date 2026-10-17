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

## 2026-10-16 — Refactor de arquitectura y extracción de composables

Refactor incremental sobre `refactor/architecture-cleanup` (12 commits), sin cambios de comportamiento salvo las alineaciones deliberadas del design system listadas más abajo.

### Estructura

- `src/router/` → `src/app/router/`; `src/components/svg/` → `src/components/icons/`.
- `src/components/rides/` → `src/features/rides/components/`; `AuthCard` → `src/features/auth/components/`.
- Primitivas de formulario (`FormLabel`, `FormError`, `FormHelp`, `PasswordInput`) de `components/forms/` a `src/components/ui/`.
- `src/utils/validators/registerValidator.*` → `src/features/auth/validators/`.
- 17 archivos con imports actualizados.

### Design System

- `Input` acepta `type="datetime-local"`; nuevo `Textarea` con las mismas clases que `Input`.
- `Alert` con prop `boxed` (fondo rojo suave `rounded-xl`).
- Token nuevo `--color-line-strong: #dee2e6`.
- `RideForm` usa `Textarea`/`Input`/`Alert boxed` en lugar de estilos ad-hoc (radio 16→14px, borde `line`, foco del DS). `EditRideView` pasa a usar `AppPage` y `Typography` (gana header y footer).
- Enlace de Wikiloc en `RideDetailView` unificado con `text-trail-ink` (antes `text-[#16A34A]`).

### Lógica extraída a módulos puros y composables

- `features/rides/validators/`: `rideFormValidator` (reglas por función), `rideImageValidator`, `rideValueGuards` (sin aserciones de tipo).
- `features/rides/composables/`: `useRideImagePicker` (imagen + preview con revocación al desmontar), `usePlaceSearch` (búsqueda con `AbortController`), `useRideDetail`, `useRideList`.
- `features/auth/composables/useAuthForm` (estado de envío compartido por Login/Register/Forgot/Reset).
- `features/rides/utils/rideFormMapping` (form ↔ dominio, `buildRideInput` devuelve `null` sin coordenadas), `features/rides/constants/rideOptions`, `utils/dates` (`toLocalDateTime`, `formatRideDate`), `features/auth/utils/emailLinkParams`.
- `EmailConfirmedView` usa `emailLinkParams`/`authService` en vez de importar el cliente Supabase directamente.

### Decisiones

- Hex → token solo cuando el valor coincide exacto (`#6C757D`→`graphite`, `#1A1D20`→`ink`, etc.); `#DEE2E6` se promovió a token `line-strong`.
- Sin dependencias nuevas; verificación en verde: `vue-tsc --build`, `vitest` (179/179), `eslint`, `oxlint` y `vite build`.

### Pendiente conocido

- `RideForm.vue`: `<FormLabel id="durationMinutes">` tiene un `"` sobrante en el texto ("Duración estimada (min)") — cambio de contenido pendiente de decisión.

## 2026-10-16 — Lógica de vistas extraída a composables

- Nuevos composables con comentarios en castellano sencillo:
  - `useRideCreator`: sube la imagen, crea la ruta publicada, redirige al detalle y
    borra la imagen huérfana si la creación falla.
  - `useRideEditor`: carga la ruta al montar y la guarda al enviar; el orden de la
    imagen es importante (subir la nueva, guardar, y solo entonces borrar la anterior).
  - `useEmailLinkConfirmation`: clasifica el enlace de Supabase, verifica el token de
    recuperación y marca la sesión antes de saltar a la nueva contraseña.
- `CreateRideView`, `EditRideView` y `EmailConfirmedView` quedan como orquestación pura:
  montan el composable y pintan; sin acceso directo a servicios ni a `router` de guardado.
- Arreglada la comilla sobrante en la etiqueta de duración del formulario de ruta.
- Formato Prettier unificado en `src/`.
- Verificación: `vue-tsc --build`, `vitest` (194/194), `eslint`, `oxlint`, `vite build` y
  `prettier --check src` en verde.

## 2026-10-16 — Pase Impeccable: UI modernizada (normalize · adapt · polish)

Pase de refinamiento visual sin tocar lógica, props públicas, eventos, rutas ni llamadas a
datos. Detector mecánico limpio (`impeccable detect --json src` → `[]`).

### Design system (`src/assets/main.css`, `src/design-system/`)

- Neutros cálidos tipo alpine: `snow #F7F8F6`, `surface #F0F2EE`, `line #E4E8E1`,
  `line-strong #D5DBD2`; `graphite` oscurecido a `#5C6560` (AA ≥ 4.5:1 también sobre
  `surface`; el anterior `#6C757D` quedaba en 4.16:1 sobre `surface`).
- Nuevo token `route-dark #9A3412` para texto de badges naranjas sobre tinte.
- Nueva sombra `--shadow-lift` para elevación hover de tarjetas interactivas.
- Base layer: `text-wrap: balance` en encabezados, `::selection` con tinte trail,
  scrollbars temáticas, foco/caret ya unificados desde los componentes.
- `FIELD_CLASSES` (`src/design-system/field.ts`): receta única de campos compartida por
  `Input`, `Textarea` y `FormSelect` (borde, radio `rounded-btn`, hover, foco ring/25,
  caret trail, `aria-invalid`, disabled).

### Primitivas

- `Button`: spinner de carga (`motion-safe`), foco `outline-offset-2` unificado, estado
  `active`, tamaños sm/md/lg con objetivos táctiles ≥ 40px.
- `Card`: elevación hover con `shadow-lift` + `border-line-strong` (sustituye el
  `hover:shadow-lg` genérico de Tailwind).
- `Badge`: texto de variantes soft en `trail-dark`/`route-dark` para contraste AA sobre
  tintes.
- `Alert` boxed: `rounded-btn` (token) en vez de `rounded-xl`.
- `Typography`: escala reordenada (heading-lg/md/xs diferenciadas, `tracking-tight` en
  encabezados); variantes eyebrow conservadas pero ya no se usan como kicker sobre un h1.
- `PasswordInput`: área táctil del toggle a 48px.

### Layout

- `AppPage`: skip link "Saltar al contenido" + `id="main-content"` en `<main>`.
- `AppHeader`: acciones con `flex-wrap` (el CTA de registro y "Mi perfil" ya no desaparecen
  en móvil), foco visible en los enlaces de nav.
- `AppFooter`: nav con "Explorar rutas", "Iniciar sesión" y "Política de privacidad"
  (móvil siempre tiene ruta a las superficies core).

### Vistas y features

- `RidesView` (P0): estados reales de carga (skeletons `motion-safe:animate-pulse`),
  error con reintento (`loadRides` del composable existente) y vacío; chips con objetivo
  táctil de 40px; eliminado el eyebrow kicker.
- `RideCard`: añadida la fecha de salida (`formatRideDate`) — dato decisivo para elegir
  grupeta; `tabular-nums` para escaneo.
- `RideDetailView`: `id="meeting-point-title"` (aria-labelledby roto), espaciado del bloque
  de participantes y del enlace Wikiloc, duración con `numeric-inline`, foco unificado.
- `RideParticipants`: error con `Alert` (antes en verde con `role="alert"`), loading/vacío
  en tono muted, iniciales sobre `surface`.
- `RideForm`: resumen de errores al inicio del formulario (antes al final de 11 campos),
  `FormHelp` en lugar de párrafos sueltos, eliminada la etiqueta duplicada del punto de
  encuentro, radios a token.
- `MeetingPointPicker`: error con `role="alert"`, radios a token, `FormHelp`.
- `Create/EditRideView`: `IconArrow` en vez de "←" literal, cabeceras hermanas
  (`heading-xl`), estados de carga/error con `Card`, formulario envuelto en `Card`.
- `HomeView`: features sin tarjetas idénticas (columnas con filete superior), sin eyebrow;
  hero con más aire (`mt-10` en CTAs).
- `ProfileView`: avatar sin círculo verde (surface + anillo), tabs con navegación por
  teclado (flechas/Home/End), copy honesto y distinto por pestaña.
- Vistas auth: foco visible en todos los enlaces, `EmailConfirmedView` sin eyebrow ni
  overrides puntuales de botón.

### Specs

- Ajustadas las aserciones de clases en `Badge.spec`, `Card.spec`, `Alert.spec` (detalle
  de presentación); `Textarea.spec` verifica la igualdad de receta con `Input` vía
  `FIELD_CLASSES`.

### Verificación

- `vitest`: 194/194 en verde.
- `vue-tsc --build`: los mismos 8 errores preexistentes de la rama (`imageUrl` en
  `mockRides.ts` y specs); ninguno nuevo.
- `oxlint src` y `eslint src`: en verde. `npm run lint` falla en los scripts vendorizados
  de `.agents/skills/impeccable/` (preexistente, verificado con la rama limpia).
- `impeccable detect --json src`: sin hallazgos.
- No se verificó en navegador (sin browser tooling en esta sesión): revisión responsive
  por inspección de clases en 320/375/768/1024/1440.

## 2026-10-16 — Identidad "Vibrant Nature", cabecera con menú y sistema de iconos

Rediseño visual de la landing y del sistema base, sin tocar lógica de negocio ni datos.

### Color y tipografía (`src/assets/main.css`, `src/design-system/`)

- Nueva paleta sobre fondo `canvas #FAF7D4` (amarillo lima suave): `snow`, `surface`,
  `line`, `line-strong`, tinta `ink #43291F` / `graphite`, acentos `trail #DA2C38`,
  `route #87C38F` y `turf #226F54`. Ninguna página usa fondo blanco.
- Fuentes: `font-sans` Inter, `font-display` Archivo (numéricos con `tabular-nums`),
  mono reservado; las variantes numéricas de `Typography` (`numeric-xl/lg/md/inline`)
  pasan a Archivo y dejan `font-mono`.
- `Button`: variantes `sun` y `sun-outline` para superficies oscuras (antes `ember`/`bark`),
  nuevo tamaño `xs` (`ButtonSize`) para acciones discretas de cabecera.
- `Card` plana: `border border-line bg-canvas`, interactivas con `hover:bg-snow`; se retiran
  las sombras `--shadow-card`/`--shadow-lift` del uso de tarjetas.

### Componentes y vistas

- `AppHeader`: cabecera fija con botón hamburguesa (`aria-expanded`/`aria-controls`,
  cierre con Escape y al cambiar de ruta) y panel móvil con acciones de invitado/sesión.
- Iconografía: dependencias `@fortawesome/fontawesome-svg-core`, `@fortawesome/vue-fontawesome`
  y `@fortawesome/free-solid-svg-icons` para iconos de navegación y acciones
  (`faBicycle`, `faCirclePlus`, `faRightToBracket`, `faUserPlus`, `faUserGear`,
  `faRightFromBracket`, `faBars`/`faXmark`).
- `HomeView`: banda de conversión final sobre `turf` (antes banda marrón `ink`) con botón
  `sun`; `CyclistScene`, `HeroBackdrop` y `RidgeDivider` adaptados a la nueva paleta.
- `PhotoFrame`: tinte fotográfico `photo-natural` en lugar del sepia cálido.
- `RidesView` + `RideCard`: lista tipo "libro de registro" (raíl de fecha, entrada y cifras
  alineadas a la derecha con traza de desnivel) en lugar de rejilla de tarjetas; filtro
  segmentado con `aria-pressed` y recuento de resultados con `aria-live`.

### Verificación

- `vitest`: 209/209 en verde (nuevos `AppHeader.spec` con estados de sesión y menú).
- `vue-tsc --build`: mismos 11 errores preexistentes (`imageUrl` en `mockRides.ts` y specs).
- `oxlint src` y `eslint src` en verde; `npm run lint` sigue fallando en scripts
  vendorizados de `.agents/skills/impeccable/` (preexistente).

## 2026-10-16 — Detalle de ruta y formularios compactos, aviso de cuenta en modal

### Detalle de ruta (`RideDetailView`, `RideMap`)

- Composición compacta y moderna: cabecera con insignias, título `heading-lg`, fila con
  fecha y enlace a Wikiloc; imagen reducida (`h-44` / `sm:h-56`) y tira de estadísticas de
  tres celdas con filete (distancia, desnivel y duración en `numeric-md`).
- Mapa más pequeño (`h-48` / `sm:h-60` por defecto en `RideMap`) dentro de una tarjeta plana
  con el punto de encuentro y el enlace a OpenStreetMap en una sola fila.
- Espaciado general rebajado (`mt-8`/`mt-6`) y `heading-sm` en los subtítulos de sección.

### Formularios (`RideForm`, `CreateRideView`, `EditRideView`, vistas auth)

- `RideForm`: `space-y-8`, rejillas de 2 y 3 columnas en escritorio (nombre + fecha y hora,
  descripción a ancho completo), `Textarea` de 3 filas y filetes de sección más compactos.
- `Create/EditRideView`: cabeceras con `heading-lg` y menos aire; tarjeta de edición con
  padding reducido. `AuthCard` y los formularios de login/registro/recuperación pasan a
  `space-y-4` con tarjeta más ajustada.

### Pie y cuenta (`AppFooter`, `ProfileView`, `ConfirmDialog`)

- `AppFooter`: "Iniciar sesión" solo se muestra cuando no hay sesión (nueva aserción en
  `AppFooter.spec`).
- `ProfileView`: eliminada la "Zona de peligro"; la baja de cuenta queda como bloque
  discreto con filete superior y acción `quiet-destructive` (nueva variante de `Button`,
  color de peligro solo en hover/foco).
- Nuevo primitivo `ConfirmDialog` (`src/components/ui/`): modal estándar de confirmación
  con `role="dialog"`, `aria-modal`, etiqueta por `useId`, foco inicial en "Cancelar",
  trampa de foco, Escape y clic en el fondo para cancelar, bloqueo de scroll y respeto de
  `prefers-reduced-motion`; `isBusy` deshabilita la salida durante la operación. Se usa
  para eliminar la cuenta (antes `window.confirm`). Los errores de formulario siguen
  siendo `Alert` inline, acorde con lo acordado: los modales se reservan para
  confirmaciones y acciones irreversibles.

### Verificación

- `vitest`: 217/217 en verde (5 de `ConfirmDialog.spec`, 3 de `AppFooter.spec`, +1 en
  `Button.spec`).
- `vue-tsc --build`: mismos 11 errores preexistentes; `oxlint src` y `eslint src` en verde;
  `vite build` correcto.
- Revisión visual en navegador (Playwright, 1440×900 y 375×812): detalle, crear ruta,
  perfil con modal, pie con/sin sesión y lista de rutas.

## 2026-10-16 — Diseño lineal, contenedor único, fondo blanco y filtros del listado

### Diseño lineal y controles compactos

- `src/assets/main.css`: `--radius-card` y `--radius-btn` a `0px` (esquinas rectas en toda la
  interfaz) y scrollbar thumb sin radio. Se eliminan los `rounded-*` sueltos de `Badge`,
  `PasswordInput`, enlace OSM del detalle, avatares de `RideParticipants`/`ProfileView` y mapa
  (`RideMap` pasa a `rounded-card`). Se conservan `rounded-full` solo en el spinner de
  `Button`, el punto de `Badge` y afines (elementos circulares por naturaleza).
- `Button`: tamaños más ajustados (`xs px-2.5 py-1`, `sm px-3.5 py-1.5`, `md px-4 py-2`,
  `lg px-5 py-2.5`); `Input`/`Textarea`/`FormSelect` con `py-2 px-3`; insignias con `px-2`.
- `Card`: el hover pasa de `hover:bg-snow` a `hover:bg-surface` (con el lienzo blanco el
  antiguo hover ya no se veía); aserción actualizada en `Card.spec`.

### Fondo blanco y contraste de filetes

- `--color-canvas` y `--color-snow` pasan a `#ffffff`: página, header y footer comparten
  blanco puro (decisión del usuario). `--color-surface`, `--color-line` y los acentos siguen
  crema-oliva, tal como se acordó.
- `--color-line-strong` se oscurece de `#b6aa5c` a `#a1954c` para que el borde de los campos
  alcance ~3:1 sobre blanco (WCAG 1.4.11); sigue siendo oliva.

### Contenedor único (`AppPage`)

- `AppPage` deja de aceptar `size` (`narrow`/`detail`/`profile`/`wide`/`full`): todas las
  páginas usan el mismo contenedor `max-w-7xl` que header y footer. Nueva prop `bleed`
  (solo la landing la usa) para mantener las bandas a sangre.
- Vistas actualizadas (detalle, auth, privacidad, perfil, crear/editar, landing) y `AuthCard`
  con `mx-auto max-w-lg` para que los formularios sigan estrechos y centrados dentro del
  contenedor común. Las lecturas largas conservan sus límites interiores (`max-w-3xl`…).

### Filtros del listado: placeholder, orden y dos páginas

- `src/features/rides/constants/rideFilters.ts`: etiquetas visibles que sustituyen al label
  (`Cualquier nivel`, `Cualquier público`), `RIDE_SORT_OPTIONS` (`Por fecha`, `Por distancia`,
  `Por desnivel`) y tipos `RideSortOption` y `RideTimeframe`.
- `FormSelectField`: nueva prop `labelHidden` (la etiqueta se conserva en `sr-only`, cumpliendo
  el requisito de label programático aunque no se vea).
- `RideFilters`: buscador con `sr-only` + placeholder "Buscar por título", tres selects
  (nivel, público, orden) y `text-sm` en los controles para que el placeholder no se corte;
  anchos ampliados (`sm:w-44`) para evitar truncar "Cualquier nivel". Nuevo modelo `sort`.
- `useRideFilters`: además de `query`/`selectedLevel`/`selectedAudience`, expone `sortBy`,
  `timeframe`, `upcomingRides` (fecha ascendente; métricas descendentes), `pastRides` (siempre
  de la más reciente a la más antigua) y `visibleRides` según la pestaña activa.
- `src/features/rides/utils/rideOrdering.ts`: nueva función `sortRides(rides, key, order)`
  con fechas inválidas siempre al final (`+4` tests).
- Nuevo `RideTimeframeTabs` (Próximas/Pasadas con recuentos, `aria-pressed`, filete de
  activo) y `RidesView` reescrita con pestañas, orden, recuento por pestaña (`aria-live`) y
  estado vacío propio de cada pestaña. `RideCard` sigue recibiendo `past` para atenuar las
  salidas celebradas.
- Tests: `useRideFilters.spec` reescrito (8), `RideFilters.spec` (4), `RideTimeframeTabs.spec`
  (3), `FormSelectField.spec` (+1), `rideOrdering.spec` (+4), `Input.spec` y `Card.spec`
  ajustados a las recetas nuevas.

### Verificación

- `vitest`: 248/248 en verde (42 archivos).
- `vue-tsc --build`: mismos 11 errores preexistentes (`imageUrl` en `mockRides.ts` y specs);
  `oxlint src` y `eslint src` en verde; `vite build` correcto.
- Revisión visual con Playwright (1440×900 y 375×812): lista (pestañas, filtros, tarjetas),
  detalle, crear ruta, login y footer con fondo blanco y contenedor común.
- Pendiente conocido: `npm run lint` sigue fallando por el fichero ignorado
  `.agents/skills/impeccable/scripts/live-browser.js`.

## 2026-10-17 — Restyling "Clean Alpine" → industrial brutalism (papel, negro y naranja)

Solo estilo y el marcado imprescindible: sin cambios de lógica, estado, rutas ni
comportamiento. Paleta extraída de `public/layout-black-orange.webp`.

### Tokens y tipografía (`src/assets/main.css`, `src/design-system/`)

- Nueva paleta: papel (`canvas #F7F6F3`, `snow #F0EFEB`, `surface #E5E2D9`), tinta
  (`ink`/`line`/`line-strong`/`turf #0A0A0A`), `graphite #525252` y naranja
  (`trail #EA580C`, `trail-deep/trail-ink/trail-dark`); `route` pasa a la misma familia
  naranja.
- Radios: `--radius-btn` (píldora) y `--radius-card` (0px); sombras: `--shadow-card`
  anulada y `--shadow-lift` sólida de 4px en `ink`.
- Fuentes: Archivo Variable (display/macro), Inter Variable (cuerpo) y JetBrains Mono
  Variable (etiquetas mono), ya instaladas.

### Primitivas

- `Button`: píldora con borde de 2px en `ink`; primaria naranja con texto negro (5,9:1)
  e hover que invierte a tinta/papel; `sun` papel para fondos oscuros; foco `ink` en
  claros y `canvas` en oscuros.
- `Badge`: escalera de intensidad corregida para que el nivel lea de menor a mayor
  (`soft+trail` naranja pálido, `soft+route` gris `bg-ink/10`, `soft+ink` losa negra); el
  punto de `ink` es papel para no fundirse con la losa.
- `Card`, `Alert`, `FormError`, `MeetingPointPicker` y `RideForm`: filetes de 2px,
  esquinas cuadradas y errores en `red-700` (5,9:1 en papel) en lugar de `red-600`.
- `Typography`: display/heading en Archivo extrabold con tracking negativo; `eyebrow`,
  `eyebrow-wide` y `label-xs` en JetBrains Mono uppercase.
- `AppHeader` y `AppFooter`: filete de 4px, navegación y links en mono uppercase, foco
  visible en `ink` y menú móvil enmarcado.

### Landing (`HomeView.vue`)

- Hero a sangre negra (`bg-turf`) con titular macro en cuatro líneas (segunda frase en
  naranja), ilustración enmarcada en `trail`, entrada escalonada con `@keyframes rise` y
  `prefers-reduced-motion`.
- Features en rejilla suiza (`gap-1` sobre negro dentro de un marco de 4px) con la
  primera celda invertida para dar profundidad.
- Galería con foto grande y dos cuadradas enmarcadas en negro; revelado por scroll con
  `useInView` (`clip-path`) y CTA primaria.
- Banda final naranja con trazo discontinuo en `ink` y contraste del párrafo corregido a
  `text-ink/90` (5,9:1).
- Nuevas fotos `public/photos/salida-amanecer.webp` y `salida-pista.webp` (Picsum:
  Alejandro Escamilla y Paul Jarvis vía Unsplash).

### Tests

- `Badge.spec`, `Button.spec`, `Card.spec`, `Alert.spec`, `Typography.spec` y
  `RideCard.spec` ajustados a las recetas nuevas.

### Verificación

- `vitest`: 248/248 en verde; `oxlint src` y `eslint src` en verde; `vite build` correcto.
- `vue-tsc --build`: mismos 11 errores preexistentes (`imageUrl` en `mockRides.ts` y sus
  specs, commit `4cbe9`); ninguno en ficheros tocados.
- `impeccable detect` contra el dev server: 0 anti-patrones y sin avisos (se corrigió el
  único aviso de contraste detectado en la banda naranja).
- Revisión visual con Playwright (1440×900 y 375×812): home como invitado y autenticado,
  y listado de rutas con el nuevo badge de nivel.
- Nota: los cambios se recogieron en commits automáticos del hook de la sesión (`67912`
  y `286eb`); el segundo incluye además `public/photos/img*` (~20 MB, sin referencias en
  el código) aparecidos en el árbol de trabajo por un proceso concurrente.
