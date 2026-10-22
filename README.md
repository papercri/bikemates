# BikeMates

**Find group rides, meet cyclists, and publish your own routes.**

BikeMates is a mobile-first web application for cyclists in Spain. Organizers publish rides
(title, meeting point, distance, elevation, pace…); riders discover them, filter by level and
bike type, join with one click, save favourites, and talk in the ride's comment thread. Every
public page is SEO-friendly; every private action is enforced by database row-level security.

Live at **[bikemates.vercel.app](https://bikemates.vercel.app/)**.

---

## What the app does

### Discover rides

- Public catalogue (`/rides`) with **Upcoming** and **Past** tabs, live counts, and infinite
  scroll.
- Filters: free-text title search (accent- and case-insensitive), difficulty level, bike type
  (road / MTB / gravel / urban), audience, and sort order (date, creation, distance, elevation).
- Signed-in cyclists get a **«Voy»** toggle to narrow the list to rides they have joined, and a
  **star** to save rides to their favourites.
- Each card shows date, title, level, bike type, audience, and marks rides the user participates
  in.

### Ride detail

- Cover image, full description, meeting point, distance, elevation, duration, and route type
  (circular / out-and-back).
- **Interactive map** of the meeting point (see [Maps & external services](#maps--external-services)).
- **Participants list** (organizer highlighted, capacity enforced server-side).
- **Comments**: a plain-text thread visible to the organizer and participants; authors can edit
  or delete their own messages and the admin can moderate any of them.
- **Share menu**: WhatsApp, Telegram, X, Facebook, Gmail, system mail, and copy-link.
- **Add to calendar**: Google Calendar, Outlook, or a generated `.ics` file.
- Links to the full route on **Wikiloc** (or any HTTPS route URL) and to the meeting point in
  **Google Maps**.
- Open Graph and Twitter metadata for rich social previews.

### Participate

- Join or leave a ride («Participar en esta ruta» / «Dejar de participar»), with capacity limits
  and duplicate-join protection enforced by database functions.
- Joining requires explicitly accepting the **community rules** and **privacy policy**.
- Anonymous visitors see the participant count and clear sign-in/sign-up prompts.

### Publish and manage rides

- Full ride form: title, future date/time, description, meeting point (**searched on a map**),
  distance, elevation, duration, bike type, level, audience, optional participant cap, route
  type, optional route URL, and a cover image (JPEG/PNG/WebP/AVIF, ≤ 5 MB).
- Content screening rejects offensive words in title and description before publishing.
- **Publish as new**: from the editor of any ride — including past ones — organizers can publish
  a fresh copy with a new date. The copy starts without comments or sign-ups (the organizer is
  enrolled automatically) and the original stays untouched.
- Edit or delete your own rides from the profile or the editor, with confirmation.

### Account

- Registration (name, email, password with letter + number), sign-in/out, email confirmation,
  and password recovery — all error messages in plain Spanish.
- Profile with three tabs: **My details** (avatar upload, display name, password change, account
  deletion via Edge Function), **My rides** (search, sort, upcoming/past, edit/delete), and
  **Saved rides** (favourites).
- Moderation: a reserved admin account can delete any ride and moderate comments.

---

## Maps & external services

| Service | Used for | Notes |
| ------- | -------- | ----- |
| **Leaflet** + **OpenStreetMap tiles** | Meeting-point map on the ride detail page | Custom bike-pin marker, popup with the address, `scrollWheelZoom` disabled |
| **Nominatim** (OpenStreetMap geocoding) | Meeting-point search in the ride form | `nominatim.openstreetmap.org/search`, Spain-only (`countrycodes=es`), min. 3 characters, abortable requests |
| **Google Maps** | «Abrir en Google Maps» button | Keyless deep link built from the ride coordinates |
| **Wikiloc / route URLs** | «Ver ruta» button on the detail page | Any HTTPS route URL (Wikiloc, Strava, Meetup…) |
| **Google Calendar / Outlook / RFC 5545 `.ics`** | Add-to-calendar menu | Client-side URL and file generation |
| **WhatsApp / Telegram / X / Facebook / Gmail** | Share menu | Standard share intents |
| **Vercel Analytics** | Anonymous usage analytics | Loaded via `@vercel/analytics`; a cookie notice is displayed |

No advertising or third-party trackers are loaded.

---

## Tech stack

| Layer    | Technology |
| -------- | ---------- |
| Frontend | Vue 3 (Composition API, `<script setup lang="ts">`), Vite, Vue Router, Pinia |
| Language | Strict TypeScript (no `any`, `noUncheckedIndexedAccess`) |
| Styling  | Tailwind CSS v4 (design tokens in `src/assets/main.css`) |
| Maps     | Leaflet + OpenStreetMap; Nominatim geocoding |
| Motion   | `motion-v` (hero parallax, in-view reveals; respects `prefers-reduced-motion`) |
| SEO      | `@unhead/vue` (titles, Open Graph, canonical, JSON-LD, robots/sitemap) |
| Backend  | Supabase — Auth, PostgreSQL with RLS, Storage, RPCs, Edge Functions |
| Tests    | Vitest + Vue Test Utils (629 unit tests); Playwright (164 e2e tests, Chromium + mobile) |
| Quality  | ESLint, oxlint, Prettier, `vue-tsc` |

### Supabase APIs

- **Auth** — registration, sign-in/out, email confirmation, password recovery/reset.
- **PostgREST + Row Level Security** — the authorization boundary for `profiles`, `rides`,
  `ride_participants`, `ride_messages`, and `saved_rides`.
- **RPCs** — `join_ride`, `leave_ride`, and `get_ride_participant_count` (capacity and
  duplicate-join rules live in the database).
- **Storage** — public buckets for ride covers and avatars.
- **Edge Functions** — `delete-account` (server-side account removal).

---

### Scripts

```bash
npm run dev        # development server
npm run build      # type-check + production build
npm run preview    # preview the production build
npm run type-check # vue-tsc
npm run lint       # oxlint + eslint (with --fix)
npm run format     # prettier --write src/
npm run test:unit  # vitest
npm run test:e2e   # playwright (Chromium + mobile profiles)
```

---

## Routes

| Route              | Access        | Purpose |
| ------------------ | ------------- | ------- |
| `/`                | public        | Landing page (hero, ride preview, CTAs) |
| `/rides`           | public        | Ride catalogue with filters |
| `/rides/:id`       | public        | Ride detail (map, participants, comments) |
| `/rides/create`    | authenticated | Publish a new ride |
| `/rides/:id/edit`  | authenticated | Edit / publish-as-new / delete a ride |
| `/register`        | public        | Sign up |
| `/login`           | public        | Sign in (supports `?redirect=`) |
| `/forgot-password` | public        | Password recovery request |
| `/reset-password`  | public        | Password reset |
| `/auth/confirm`    | public        | Email confirmation |
| `/profile`         | authenticated | Profile: details, my rides, saved rides |
| `/community-rules` | public        | Community rules |
| `/privacy`         | public        | Privacy policy |
| any other          | public        | 404 (`noindex`) |

The router guard resolves the session and redirects unauthenticated users to `/login`. **The
guard is not a security boundary** — authorization is enforced by PostgreSQL RLS policies.
Private routes (`/profile`, create/edit) are `noindex`.

---

## Architecture

```text
src/
  app/router/           # routes, guards, per-route metadata
  assets/               # design tokens (@theme)
  components/
    ui/                 # primitives: Button, Input, Badge, ConfirmDialog, DropdownMenu…
    layout/             # AppHeader, AppFooter, AppBreadcrumb, AppBackBar…
    icons/              # brand and decorative SVGs
  features/
    auth/               # authService, authStore, validators, error messages
    profile/            # profile tabs, profileService, userRoleService
    rides/              # catalogue, detail, form, comments, favourites,
                        # geocoding (Nominatim), calendar/share utils, validators
  services/             # single Supabase client
  utils/                # pure helpers (dates, search normalization…)
  views/                # public/ and private/ pages
e2e/                    # Playwright suite with a Supabase mock
backup/db.md            # documented schema and RLS policies
docs/log.md             # dated change log
```

Separation of concerns: views orchestrate, components present, services access data, and UI
primitives know nothing about Supabase.

---

## Security

- Single Supabase client with the public key; **RLS is the authorization boundary** for every
  table (owner checks, capacity limits, admin moderation).
- Secrets are never shipped to the browser: the client rejects service-role/secret keys.
- All user input is validated at the boundaries (forms, query params, external API responses).
- Passwords require 8–128 characters with a letter and a number; auth errors are mapped to
  friendly Spanish messages.
- Account deletion and privileged moderation run server-side (Edge Function / RLS).
- No `v-html`; comments are stripped of HTML before saving and rendered as plain text.

---

## Testing & quality gates

- **Unit** — `npm run test:unit` (629 tests): validators, services, composables, UI primitives.
- **E2E** — `npm run test:e2e` (164 tests, desktop + mobile): auth flows, ride catalogue,
  detail, participation, comments, favourites, profile, and navigation.
- Before considering a change complete: unit tests, `npm run type-check`, `npm run lint`, and
  `npm run build`.

---

Made by [Cristiana Sollini](https://bikemates.vercel.app/).
