import type { Page, Route } from '@playwright/test'
import { authStorageKey, loadAppEnv } from './env'

export interface E2eUser {
  id: string
  email: string
  displayName: string
}

export interface E2eSeedUser extends E2eUser {
  password: string
}

export interface DbRide {
  id: string
  organizer_id: string
  title: string
  description: string
  starts_at: string
  meeting_point: string
  latitude: number
  longitude: number
  bike_type: string
  level: string
  distance_km: number
  elevation_m: number
  duration_minutes: number
  image_path: string | null
  wikiloc_url: string | null
  audience: string
  max_participants: number | null
  route_type: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface DbProfile {
  id: string
  display_name: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface DbParticipant {
  ride_id: string
  user_id: string
  joined_at: string
  profile: {
    id: string
    display_name: string
    avatar_url: string | null
  }
}

export interface PlaceResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

export interface MockState {
  /** Usuarios registrados (incluye su contraseña para los flujos de login). */
  users: E2eSeedUser[]
  /** Usuario con sesión activa; `null` para visitantes anónimos. */
  currentUser: E2eUser | null
  rides: DbRide[]
  profiles: DbProfile[]
  participants: DbParticipant[]
  places: PlaceResult[]
  /** Indica si el registro devuelve sesión activa o exige confirmación por email. */
  signUpCreatesSession: boolean
  /** Errores de inyección: se devuelven cuando no son `null`. */
  authError: string | null
  ridesError: string | null
  participantCountError: string | null
  joinError: string | null
  deleteAccountError: string | null
  /**
   * Retraso en ms aplicado a las respuestas de auth (signup, login, verify…).
   * Permite observar los estados de carga sin depender del encadenamiento de rutas.
   */
  authDelayMs: number
  /** Última petición de inserción de ruta recibida (para asserts). */
  lastInsertedRide: Record<string, unknown> | null
}

export interface SupabaseMock {
  state: MockState
  /** Cambia el usuario con sesión activa y actualiza el token de localStorage. */
  signInAs(user: E2eSeedUser): Promise<void>
  /** Elimina la sesión de localStorage y el usuario activo. */
  signOut(): Promise<void>
}

const AUTH_PATH = '/auth/v1/'
const REST_PATH = '/rest/v1/'
const FUNCTIONS_PATH = '/functions/v1/'
const STORAGE_PATH = '/storage/v1/'

/** Firma JWT falsa: el cliente no verifica la firma, solo el payload y `exp`. */
function createJwt(payload: Record<string, unknown>): string {
  const encode = (value: object): string => Buffer.from(JSON.stringify(value)).toString('base64url')

  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.e2e`
}

function buildUser(user: E2eSeedUser, confirmed = true): Record<string, unknown> {
  const timestamp = new Date().toISOString()

  return {
    id: user.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: user.email,
    email_confirmed_at: confirmed ? timestamp : null,
    phone: '',
    confirmed_at: confirmed ? timestamp : null,
    last_sign_in_at: timestamp,
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { display_name: user.displayName },
    identities: [
      {
        identity_id: user.id,
        id: user.id,
        user_id: user.id,
        provider: 'email',
        email: user.email,
      },
    ],
    created_at: timestamp,
    updated_at: timestamp,
  }
}

function buildSession(user: E2eSeedUser, confirmed = true): Record<string, unknown> {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60
  const accessToken = createJwt({
    sub: user.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: user.email,
    exp: expiresAt,
    session_id: 'e2e-session',
    aal: 'aal1',
    amr: [{ method: 'password', timestamp: expiresAt }],
  })

  return {
    access_token: accessToken,
    refresh_token: `refresh-${user.id}`,
    expires_at: expiresAt,
    expires_in: 3600,
    token_type: 'bearer',
    user: buildUser(user, confirmed),
  }
}

interface FulfillBody {
  status: number
  contentType: string
  body: string
}

function json(body: unknown, status = 200): FulfillBody {
  return {
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  }
}

function authError(message: string, status = 400): FulfillBody {
  return json({ code: status, error_code: 'invalid_credentials', msg: message }, status)
}

/** Cumple la ruta y devuelve `true` para que el caller sepa que ya está atendida. */
async function fulfill(route: Route, body: FulfillBody): Promise<true> {
  await route.fulfill(body)
  return true
}

/**
 * Instala un mock completo de Supabase (auth + REST + RPC + storage + functions)
 * y de las llamadas externas (Nominatim y tiles de OpenStreetMap).
 *
 * El estado devuelto es mutable: los tests lo mutan antes o durante la navegación.
 */
export async function mockSupabase(page: Page): Promise<SupabaseMock> {
  const { supabaseUrl } = loadAppEnv()
  const origin = new URL(supabaseUrl).origin
  const storageKey = authStorageKey()

  const state: MockState = {
    users: [],
    currentUser: null,
    rides: [],
    profiles: [],
    participants: [],
    places: [],
    signUpCreatesSession: false,
    authError: null,
    ridesError: null,
    participantCountError: null,
    joinError: null,
    deleteAccountError: null,
    authDelayMs: 0,
    lastInsertedRide: null,
  }

  function findUser(email: string): E2eSeedUser | undefined {
    return state.users.find((u) => u.email === email)
  }

  function participantsOf(rideId: string): DbParticipant[] {
    return state.participants.filter((p) => p.ride_id === rideId)
  }

  async function seedSession(user: E2eSeedUser, confirmed = true): Promise<void> {
    state.currentUser = user
    await page.addInitScript(
      ([key, session]) => {
        window.localStorage.setItem(key, session)
      },
      [storageKey, JSON.stringify(buildSession(user, confirmed))],
    )
  }

  async function handleAuth(route: Route, requestUrl: URL, method: string): Promise<boolean> {
    if (state.authDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, state.authDelayMs))
    }

    const path = requestUrl.pathname.replace(origin, '')
    const body = ((): unknown => {
      try {
        return route.request().postDataJSON()
      } catch {
        return null
      }
    })()

    if (state.authError) {
      return fulfill(route, authError(state.authError))
    }

    if (method === 'POST' && path === `${AUTH_PATH}signup`) {
      const payload = body as {
        email?: string
        password?: string
        data?: { display_name?: string }
      } | null
      const email = payload?.email?.trim().toLowerCase() ?? ''

      if (!email || !payload?.password) {
        return fulfill(route, authError('Debes indicar un correo y una contraseña.'))
      }

      const existing = findUser(email)

      if (existing) {
        // Supabase devuelve un usuario sin identidades cuando el email ya existe.
        return fulfill(
          route,
          json({ id: existing.id, aud: 'authenticated', email, identities: [] }),
        )
      }

      const created: E2eSeedUser = {
        id: `user-${state.users.length + 1}`,
        email,
        displayName: payload.data?.display_name?.trim() || 'Ciclista',
        password: payload.password,
      }
      state.users.push(created)

      if (state.signUpCreatesSession) {
        state.currentUser = created
        return fulfill(route, json({ user: buildUser(created), session: buildSession(created) }))
      }

      return fulfill(route, json({ user: buildUser(created, false), session: null }))
    }

    if (method === 'POST' && path === `${AUTH_PATH}token`) {
      const grantType = requestUrl.searchParams.get('grant_type')

      if (grantType === 'password') {
        const payload = body as { email?: string; password?: string } | null
        const email = payload?.email?.trim().toLowerCase() ?? ''
        const user = findUser(email)

        if (!user || user.password !== payload?.password) {
          return fulfill(route, authError('Correo o contraseña incorrectos.'))
        }

        state.currentUser = user
        return fulfill(route, json(buildSession(user)))
      }

      if (grantType === 'refresh_token') {
        const payload = body as { refresh_token?: string } | null
        const userId = payload?.refresh_token?.replace('refresh-', '') ?? ''
        const user = state.users.find((u) => u.id === userId)

        if (!user) {
          return fulfill(route, authError('Sesión caducada.', 401))
        }

        return fulfill(route, json(buildSession(user)))
      }

      return fulfill(route, authError('Tipo de concesión no soportado.', 400))
    }

    if (method === 'GET' && path === `${AUTH_PATH}user`) {
      if (!state.currentUser) {
        return fulfill(route, authError('No hay sesión activa.', 401))
      }

      const stored = state.users.find((u) => u.id === state.currentUser?.id) ?? state.currentUser

      return fulfill(route, json(buildUser({ ...stored, password: '' })))
    }

    if (method === 'PUT' && path === `${AUTH_PATH}user`) {
      if (!state.currentUser) {
        return fulfill(route, authError('No hay sesión activa.', 401))
      }

      const stored = state.users.find((u) => u.id === state.currentUser?.id)

      if (stored) {
        return fulfill(route, json(buildUser(stored)))
      }

      return fulfill(route, json(buildUser({ ...state.currentUser, password: '' })))
    }

    if (method === 'POST' && path === `${AUTH_PATH}logout`) {
      state.currentUser = null
      return fulfill(route, json({}))
    }

    if (method === 'POST' && path === `${AUTH_PATH}recover`) {
      return fulfill(route, json({}))
    }

    if (method === 'POST' && path === `${AUTH_PATH}verify`) {
      const payload = body as { token_hash?: string } | null

      if (!payload?.token_hash) {
        return fulfill(route, authError('El enlace no contiene un token válido.', 400))
      }

      const user = state.users[0]

      if (!user) {
        return fulfill(route, authError('Token no válido.', 401))
      }

      state.currentUser = user
      return fulfill(route, json(buildSession(user)))
    }

    return false
  }

  function filterRides(searchParams: URLSearchParams): DbRide[] {
    let rides = [...state.rides]

    const id = searchParams.get('id')
    if (id?.startsWith('eq.')) rides = rides.filter((r) => r.id === id.slice(3))

    const organizerId = searchParams.get('organizer_id')
    if (organizerId?.startsWith('eq.'))
      rides = rides.filter((r) => r.organizer_id === organizerId.slice(3))

    // `.eq('status', …)` genera `status=eq.…`; `.in('status', …)` genera `status=in.(…)`.
    const status = searchParams.get('status')
    if (status?.startsWith('eq.')) {
      rides = rides.filter((r) => r.status === status.slice(3))
    } else if (status?.startsWith('in.')) {
      const allowed = status
        .slice(3)
        .replace(/[()]/g, '')
        .split(',')
        .map((value) => value.trim())
      rides = rides.filter((r) => allowed.includes(r.status))
    }

    const order = searchParams.get('order')
    if (order) {
      const [column, direction] = order.split('.')
      rides.sort((a, b) => {
        const av = a[column as keyof DbRide]
        const bv = b[column as keyof DbRide]
        const cmp = av < bv ? -1 : av > bv ? 1 : 0
        return direction === 'desc' ? -cmp : cmp
      })
    }

    return rides
  }

  async function handleRest(route: Route, requestUrl: URL, method: string): Promise<boolean> {
    const path = requestUrl.pathname.replace(origin, '')
    const accept = route.request().headers()['accept'] ?? ''

    if (state.ridesError) {
      return fulfill(route, json({ code: '42P01', message: state.ridesError }, 500))
    }

    if (path === `${REST_PATH}rides`) {
      const body = route.request().postDataJSON() as Record<string, unknown> | null

      if (method === 'GET') {
        const rows = filterRides(requestUrl.searchParams)

        if (accept.includes('nulls=stripped')) {
          // maybeSingle: el cliente espera un array.
          return fulfill(route, json(rows.slice(0, 1)))
        }

        if (accept.includes('vnd.pgrst.object')) {
          if (rows.length === 0) {
            return fulfill(
              route,
              json(
                {
                  code: 'PGRST116',
                  details: 'Results contain 0 rows',
                  hint: null,
                  message: 'JSON object requested, multiple (or no) rows returned',
                },
                406,
              ),
            )
          }
          return fulfill(route, json(rows[0]))
        }

        return fulfill(route, json(rows))
      }

      if (method === 'POST') {
        const now = new Date().toISOString()
        const inserted: DbRide = {
          id: `ride-${state.rides.length + 1}`,
          created_at: now,
          updated_at: now,
          status: 'published',
          image_path: null,
          wikiloc_url: null,
          max_participants: null,
          ...(body as Partial<DbRide>),
        } as DbRide
        state.lastInsertedRide = body ?? null
        state.rides.push(inserted)

        if (accept.includes('vnd.pgrst.object')) {
          return fulfill(route, json(inserted))
        }
        return fulfill(route, json([inserted]))
      }

      if (method === 'PATCH') {
        const id = requestUrl.searchParams.get('id')?.replace('eq.', '') ?? ''
        const target = state.rides.find((r) => r.id === id)

        if (!target) {
          if (accept.includes('nulls=stripped')) {
            // maybeSingle espera un array; el cliente convierte [] en null.
            return fulfill(route, json([]))
          }
          return fulfill(route, json({ code: 'PGRST116', message: 'No rows' }, 406))
        }

        Object.assign(target, body ?? {}, { updated_at: new Date().toISOString() })

        // maybeSingle espera un array; single espera el objeto directamente.
        if (accept.includes('nulls=stripped')) {
          return fulfill(route, json([target]))
        }
        if (accept.includes('vnd.pgrst.object')) {
          return fulfill(route, json(target))
        }
        return fulfill(route, json([target]))
      }

      if (method === 'DELETE') {
        const id = requestUrl.searchParams.get('id')?.replace('eq.', '') ?? ''
        const index = state.rides.findIndex((r) => r.id === id)

        if (index === -1) {
          // maybeSingle con 0 filas: el cliente convierte [] en null.
          return fulfill(route, json([]))
        }

        const [removed] = state.rides.splice(index, 1)
        return fulfill(route, json([{ id: removed.id }]))
      }
    }

    if (path === `${REST_PATH}ride_participants`) {
      const rideId = requestUrl.searchParams.get('ride_id')?.replace('eq.', '') ?? ''
      const rows = participantsOf(rideId).map((p) => ({
        user_id: p.user_id,
        profiles: p.profile,
      }))

      if (accept.includes('vnd.pgrst.object')) {
        return rows.length === 1 ? route.fulfill(json(rows[0])) : route.fulfill(json(rows))
      }

      return fulfill(route, json(rows))
    }

    if (path.startsWith(`${REST_PATH}rpc/`)) {
      const rpcName = path.slice(`${REST_PATH}rpc/`.length)
      const payload = (route.request().postDataJSON() ?? {}) as Record<string, unknown>
      const rideId = typeof payload.p_ride_id === 'string' ? payload.p_ride_id : ''

      if (rpcName === 'get_ride_participant_count') {
        if (state.participantCountError) {
          return fulfill(route, json({ message: state.participantCountError }, 500))
        }
        return fulfill(route, json(participantsOf(rideId).length))
      }

      if (rpcName === 'join_ride') {
        if (state.joinError) {
          return fulfill(route, json({ message: state.joinError }, 400))
        }

        const user = state.currentUser

        if (!user) {
          return fulfill(route, json({ message: 'Debes iniciar sesión.' }, 401))
        }

        if (!participantsOf(rideId).some((p) => p.user_id === user.id)) {
          state.participants.push({
            ride_id: rideId,
            user_id: user.id,
            joined_at: new Date().toISOString(),
            profile: { id: user.id, display_name: user.displayName, avatar_url: null },
          })
        }

        return fulfill(route, json(null))
      }

      if (rpcName === 'leave_ride') {
        if (!state.currentUser) {
          return fulfill(route, json({ message: 'Debes iniciar sesión.' }, 401))
        }

        state.participants = state.participants.filter(
          (p) => !(p.ride_id === rideId && p.user_id === state.currentUser?.id),
        )

        return fulfill(route, json(null))
      }

      return fulfill(route, json({ message: `RPC no soportado: ${rpcName}` }, 404))
    }

    if (path === `${REST_PATH}profiles`) {
      const body = ((): Record<string, unknown> | null => {
        try {
          return route.request().postDataJSON()
        } catch {
          return null
        }
      })()
      const now = new Date().toISOString()

      if (method === 'GET') {
        const id = requestUrl.searchParams.get('id')?.replace('eq.', '') ?? ''
        const rows = state.profiles.filter((profile) => profile.id === id)

        // maybeSingle espera un array; single espera el objeto directamente.
        if (accept.includes('vnd.pgrst.object')) {
          const row = rows[0]

          if (!row) {
            return fulfill(
              route,
              json({ code: 'PGRST116', message: 'Results contain 0 rows' }, 406),
            )
          }

          return fulfill(route, json(row))
        }

        return fulfill(route, json(rows))
      }

      if (method === 'POST') {
        const created: DbProfile = {
          avatar_url: null,
          created_at: now,
          updated_at: now,
          ...(body as Partial<DbProfile> | null),
        } as DbProfile

        const existing = state.profiles.findIndex((profile) => profile.id === created.id)

        if (existing >= 0) {
          state.profiles[existing] = created
        } else {
          state.profiles.push(created)
        }

        if (accept.includes('vnd.pgrst.object')) {
          return fulfill(route, json(created))
        }

        return fulfill(route, json([created]))
      }

      if (method === 'PATCH') {
        const id = requestUrl.searchParams.get('id')?.replace('eq.', '') ?? ''
        const target = state.profiles.find((profile) => profile.id === id)

        if (!target) {
          if (accept.includes('nulls=stripped')) {
            return fulfill(route, json([]))
          }
          return fulfill(route, json({ code: 'PGRST116', message: 'No rows' }, 406))
        }

        Object.assign(target, body ?? {}, { updated_at: now })

        if (accept.includes('vnd.pgrst.object')) {
          return fulfill(route, json(target))
        }

        return fulfill(route, json([target]))
      }
    }

    return false
  }

  await page.route(`${origin}/**`, async (route) => {
    const requestUrl = new URL(route.request().url())
    const path = requestUrl.pathname
    const method = route.request().method()

    if (path.startsWith(AUTH_PATH)) {
      if (await handleAuth(route, requestUrl, method)) return
    }

    if (path.startsWith(REST_PATH)) {
      if (await handleRest(route, requestUrl, method)) return
    }

    if (path.startsWith(FUNCTIONS_PATH)) {
      const fnName = path.slice(FUNCTIONS_PATH.length)

      if (state.deleteAccountError) {
        return fulfill(route, json({ message: state.deleteAccountError }, 500))
      }

      if (fnName === 'delete-account') {
        return fulfill(route, json({ ok: true }))
      }

      return fulfill(route, json({ message: `Función no soportada: ${fnName}` }, 404))
    }

    if (path.startsWith(STORAGE_PATH)) {
      // Upload y remove devuelven siempre éxito en los E2E.
      return fulfill(route, json({ Key: path.split('/').pop(), Id: 'e2e' }))
    }

    return fulfill(route, json({ message: `Ruta no mockeada: ${method} ${path}` }, 404))
  })

  await page.route('https://nominatim.openstreetmap.org/**', async (route) => {
    const requestUrl = new URL(route.request().url())

    if (requestUrl.pathname === '/search') {
      const query = (requestUrl.searchParams.get('q') ?? '').toLowerCase()
      const matches = state.places.filter(
        (place) =>
          query.length >= 3 && place.display_name.toLowerCase().includes(query.slice(0, 3)),
      )

      return fulfill(route, json(matches))
    }

    return fulfill(route, json([]))
  })

  await page.route('https://*.tile.openstreetmap.org/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'base64',
      ),
    }),
  )

  return {
    state,
    async signInAs(user) {
      await seedSession(user)
    },
    async signOut() {
      state.currentUser = null
      await page.evaluate((key) => window.localStorage.removeItem(key), storageKey)
    },
  }
}
