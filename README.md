# BikeMates

A web application for cyclists in Spain: discover routes, find riding partners, and organize group rides.

BikeMates is a **mobile-first** SPA built with Vue 3 and strict TypeScript, backed by **Supabase** (authentication, database, and Edge Functions), technical SEO on public pages, and a minimal editorial interface.

## Features

### Route discovery

- Route listing with one card per ride: location, distance, total elevation gain, and level.
- Compact filters with screen-reader-only labels: title search (case- and accent-insensitive),
  level, audience, sort (`Date of departure`, `Creation date`, `Distance`, `Elevation`), and,
  for signed-in cyclists, a `Participaré` filter that narrows the list to the rides they have
  joined.
- Cards show a green `Participaré` badge on the rides the current user participates in.
- Two tabs on the listing: `Upcoming` and `Past`, each with its count; past rides are
  sorted from most to least recent and dimmed on the card.
- Two-column route detail layout (2/3 + 1/3): cover image with the
  description below it, and the meeting-point map plus participants in the narrow
  column. The date, with a clock icon, sits under the title next to the icon-only
  **Add to calendar** menu (Google Calendar, Outlook, and a generated `.ics`
  download in `src/features/rides/utils/rideCalendar.ts`) and, on the right, the
  **Share** menu (WhatsApp, Telegram, X, Facebook, Gmail, system mail, and copy
  link; `src/features/rides/utils/rideShare.ts`). The page exposes Open Graph and
  Twitter metadata (`og:title`, `og:image`, `og:url`…) so links show a social
  preview.
- Empty state and back link when the route does not exist.
- **Joining a ride** requires explicitly accepting the community rules: the `Participar en esta
  ruta` CTA stays disabled until the checkbox is ticked, and `Ver normas de la comunidad` opens
  the same rules dialog used when publishing.
- **Content screening**: the title and description are rejected when they contain offensive or
  sexual words (`BLOCKED_WORDS` in `src/features/rides/validators/rideFormValidator.ts`), matched
  on normalized, accent-free whole words to avoid false positives.
- Route data is sample data (`src/features/rides/data/mockRides.ts`) until connected to the database.

### User account

- **Registration** with form validation: name (2–60 characters, no HTML or control characters), a valid email, and an 8–128 character password containing a letter and a number.
- **Sign in and sign out** with Supabase Auth; the header reflects the session state in real time.
- **Email confirmation** at `/auth/confirm`.
- **Password recovery and reset** (`/forgot-password` and `/reset-password` flows, with recovery-session detection).
- **Authenticated profile** with two tabs synced to the URL (`/profile` and
  `/profile?tab=my-rides`): **My details** (avatar, name, read-only email,
  password change, and **account deletion** via the `delete-account` Edge Function)
  and **My rides** (accent- and case-insensitive search, sort by date/distance/elevation,
  a grid of cards with **Edit**/**Delete** actions built into each card,
  with a modal confirmation before deleting).

### Pages and infrastructure

- Public landing page with a full-screen hero (entrance zoom and scroll parallax), an overlaid transparent header, CTAs, a **privacy policy**, and a **404** with `noindex`.
- Header with primary navigation and a global footer on all shell views.
- Auxiliary navigation: a **breadcrumb** (`AppBreadcrumb`, fed by the router's
  `meta.breadcrumb` and overridden by the view with the **route title** on detail and
  edit, truncated with an ellipsis; the profile's active tab is reflected in the URL) and a
  **back bar** (`AppBackBar`, browser history with a fallback exit) on internal
  views; a shared graphical preloader (`BikeLoader`, animated bike with a trail)
  for route and profile loading states.
- Per-route title and meta via `@unhead/vue`: the detail route generates a dynamic title and the profile is `noindex`.
- Custom SVG favicon (mark without text) in `public/favicon.svg`.

## Stack

| Layer       | Technology                                                                             |
| ----------- | -------------------------------------------------------------------------------------- |
| Frontend    | Vue 3 (Composition API, `<script setup lang="ts">`), Vite, Vue Router, Pinia            |
| Animations  | `motion-v` (Motion for Vue): parallax with `useScroll`/`useTransform`, `whileInView` reveals |
| Language    | Strict TypeScript (no `any`, `noUncheckedIndexedAccess`)                                |
| Styles      | Tailwind CSS v4 (tokens in `src/assets/main.css` via `@theme`)                          |
| SEO         | `@unhead/vue`                                                                            |
| Icons       | Font Awesome free-solid (`@fortawesome/vue-fontawesome`)                                 |
| Backend     | Supabase: Auth, PostgreSQL with RLS, Edge Functions                                      |
| Tests       | Vitest + Vue Test Utils, Playwright                                                      |
| Quality     | ESLint, oxlint, Prettier                                                                 |

## Plugins and libraries

Runtime packages:

| Package | Purpose |
| ------- | ------- |
| `vue`, `vue-router`, `pinia` | App framework, routing, and shared client state |
| `@supabase/supabase-js` | Supabase client (Auth, PostgREST, Storage, RPC, Edge Functions) |
| `@unhead/vue` | Per-route `<head>` management (titles, meta, Open Graph, canonical) |
| `motion-v` | Scroll parallax (`useScroll`/`useTransform`), `whileInView` reveals, hero zoom |
| `@vueuse/core` | Composable utilities |
| `leaflet` | Meeting-point map in the ride detail (`RideMap.vue`) |
| `@fortawesome/vue-fontawesome` + `free-solid`/`free-brands` | Navigation and action icons |
| `@fontsource-variable/{inter,archivo,jetbrains-mono}` | Self-hosted variable fonts (no external font requests) |
| `tailwindcss` + `@tailwindcss/vite` | Utility-first styling and design tokens |

Tooling / dev plugins:

| Package | Purpose |
| ------- | ------- |
| `vite`, `@vitejs/plugin-vue`, `vite-plugin-vue-devtools` | Build and dev server |
| `vue-tsc`, `typescript` | Strict type checking (`noUncheckedIndexedAccess`) |
| `vitest`, `@vue/test-utils`, `jsdom` | Unit tests |
| `@playwright/test` | End-to-end tests (Chromium + mobile) |
| `eslint` (with `eslint-plugin-vue`, `@vue/eslint-config-typescript`, `eslint-plugin-playwright`, `eslint-config-prettier`), `oxlint`, `prettier` | Linting and formatting |

## APIs used

- **Supabase Auth** — registration, sign-in/out, session resolution, email confirmation, and password recovery/reset (`authService.ts`).
- **Supabase PostgREST (PostgreSQL + RLS)** — rides, profiles, and participation, always through the RLS boundary.
- **Supabase RPC (database functions)** — `join_ride`, `leave_ride`, and `get_ride_participant_count` (`rideService.ts`).
- **Supabase Storage** — public buckets for avatars (`avatars`) and ride covers (`ride-images`).
- **Supabase Edge Functions** — `delete-account`, invoked server-side from `authService.ts`.
- **External share/calendar links** — Google Calendar, Outlook, and generated `.ics` (`rideCalendar.ts`); WhatsApp, Telegram, X, Facebook, Gmail, and mailto (`rideShare.ts`). No third-party trackers or analytics are loaded.

## Requirements

- Node.js `^22.18.0 || >=24.12.0` and npm.
- A Supabase project with Auth enabled and, for account deletion, the `delete-account` Edge Function.

## Setup

```bash
npm install
npm run dev
```

Copy the environment variables into `.env.local` (use `.env.example` as a template):

| Variable                 | Description                                   |
| ------------------------ | --------------------------------------------- |
| `VITE_SUPABASE_URL`      | Supabase project URL                          |
| `VITE_SUPABASE_ANON_KEY` | Project public (anon/publishable) key         |

The app fails explicitly at startup if these variables are missing. Never use the `service_role` key in the browser: it is reserved for the server and Edge Functions.

## Scripts

```bash
npm run dev        # development server
npm run build      # type-check + production build
npm run preview    # preview the build
npm run type-check # vue-tsc --build
npm run lint       # oxlint + eslint (with --fix)
npm run format     # prettier --write src/
npm run test:unit  # vitest
npm run test:e2e   # playwright
```

## Routes

| Route              | View                        | Access       |
| ------------------ | --------------------------- | ------------ |
| `/`                | HomeView                    | public       |
| `/rides`           | RidesView                   | public       |
| `/rides/:id`       | RideDetailView              | public       |
| `/register`        | RegisterView                | public       |
| `/login`           | LoginView                   | public       |
| `/forgot-password` | ForgotPasswordView          | public       |
| `/reset-password`  | ResetPasswordView           | public       |
| `/auth/confirm`    | EmailConfirmedView          | public       |
| `/privacy`         | PrivacyView                 | public       |
| `/profile`         | ProfileView                 | authenticated|
| any other          | NotFoundView (404, noindex) | public       |

The router guard resolves the session before navigating and redirects to `/login?redirect=…` when the route requires authentication. **The guard is not a security boundary**: real authorization is enforced by the PostgreSQL RLS policies.

## Architecture

```text
src/
  assets/                  # main.css (@theme tokens)
  composables/              # useInView…
  design-system/           # cn(), createVariant (minimal CVA equivalent) and types
  app/router/              # routes and guards
  components/
    ui/                    # primitives: Button, Input, Textarea, Card, Badge, Alert,
                           # Typography, EmptyState, ConfirmDialog (confirmation
                           # modal), FormLabel, FormError, FormHelp,
                           # FormSelect, FormSelectField, PasswordInput, BikeLoader
    layout/                # AppHeader, AppFooter, AppPage (page shell),
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
                           # (profileService), validators and types
    rides/                 # types, components (RideCard, RideFilters,
                           # RideTimeframeTabs, RideForm…), composables
                           # (useRideFilters, useRideList, useRideDetail…),
                           # constants (rideFilters), data, services, utils
                           # (rideOrdering), validators
  services/                # Supabase client (single access point)
  utils/                   # pure utilities (dates, validators…)
  views/                   # public/ and private/
e2e/                       # Playwright tests
docs/log.md                # change log
```

Separation of concerns: views orchestrate, components present, services access data, and UI primitives know nothing about Supabase.

## Design System

- Visual components live in `src/components/` and contain no business logic.
- Decorative and iconographic SVGs live in `src/components/icons/` as their own components (`CyclistScene`, `RidgeDivider`, `HeroBackdrop`, `Icon*`); views and components only compose them.
- Tokens (colors, radii, shadows, typography) are defined once in `src/assets/main.css`.
- Clean Alpine & Light style: porcelain background (`canvas` `#FFFFFF`, `snow`
  `#F7F8F6`, `surface` `#F0F2EE`), meadow-green hairlines (`line` `#E4E8E1`,
  `line-strong` `#D5DBD2`) and text (`ink` `#1A1D20`, `graphite` `#5C6560`).
  Brand green for primary actions and active states (`trail` `#22C55E`,
  `trail-deep` `#10B981` on hover, `trail-ink` `#15803D` for text and CTAs with
  white text, `trail-dark` `#166534`) and route orange for route highlights
  (`route` `#F97316`, `route-ink` `#C2410C`): map pin, Wikiloc link, and Google
  Maps button. Green and orange do not compete as primaries on the same screen.
  `moss` and `signal-blue` are reserved for semantic states (field focus uses
  `signal-blue`). Structure uses 1px hairlines with no card shadows; only
  `ConfirmDialog` keeps elevation. Radii: 8px on cards, photos, fields, and
  buttons (`--radius-card`, `--radius-photo`, `--radius-field`, `--radius-btn`);
  pill shape only on badges.
- Typography: Inter (SuisseIntl substitute) for all UI; headings at weight 500
  with negative tracking (`-0.025em` on display), body at 400, and JetBrains Mono
  for labels and tabular data.
- Single container: `AppPage` wraps every page with `max-w-7xl` (same as the header
  and footer); the `bleed` prop is reserved for full-bleed landing bands, and reading
  width is controlled inside each view (`max-w-lg`, `max-w-3xl`…).
- The form-field recipe (`FIELD_CLASSES` in `src/design-system/field.ts`) is shared by `Input`, `Textarea`, and `FormSelect` to keep border, radius, focus, and states identical.
- Primitives expose homogeneous variants (`variant`, `size`, `tone`, `loading`, `block`, `dot`…) built with `createVariant`, with no external dependencies.
- `Button` includes sizes `xs`–`lg` (all `text-sm` except `xs`; reduced paddings) and, besides `primary`/`outline`/`destructive`, the `sun`/`sun-outline` variants (over photos and dark backgrounds: a white button with ink text, or a white outline) and `quiet-destructive` (discreet dangerous action, color only appears on interaction). `primary` is a deep brand-green button (`bg-trail-ink`) with white text (AA); `outline` uses the neutral `line-strong` hairline with no black border.
- `ConfirmDialog` is the standard modal for confirmations and irreversible actions (`role="dialog"`, `aria-modal`, focus trap, Escape, and backdrop click to cancel). Form messages remain inline `Alert` with `role="alert"`.
- Navigation and action icons use Font Awesome (free-solid) with `FontAwesomeIcon`; illustrative and data SVGs stay in `src/components/icons/`.
- Motion with `motion-v` (Motion for Vue): the home uses `useScroll`/`useTransform` for the hero parallax (per-section offset, 12% range) and `motion.div` components with `whileInView` (`opacity` + `y`) to reveal blocks; the hero's entrance zoom is an animated `scale` on mount. `MotionConfig reduced-motion="user"` in `App.vue` respects `prefers-reduced-motion` across the app. The home header is transparent (`meta.overlayHeader` in the router) and overlays the full-screen hero.
- UI components receive data via props and emit events; shared state lives in Pinia (`authStore`).

## Security

- Single Supabase client in `src/services/supabase.ts` with the public key; RLS as the authorization boundary.
- Untrusted inputs validated at the boundaries (registration, route query params, external responses).
- No `v-html`, no new validation dependencies, no hand-persisted tokens.
- Privileged fields and sensitive operations (account deletion) resolved on the server.

## Quality and tests

- **Unit**: `npm run test:unit` — 594 tests in 84 files (design system, validators, services and route composables, auth service, session store, UI primitives, listing filters, SVG icons, profile tabs, private views, and navigation components).
- **E2E**: `npm run test:e2e` — Playwright on Chromium and mobile (148 passing; authentication, profile, ride creation, listing, detail, and navigation).
- Gates before considering a task complete: `npm run test:unit -- --run`, `npm run type-check`, `npx eslint .`, `npx oxlint .`, Prettier, and, when relevant, `npm run build`.
