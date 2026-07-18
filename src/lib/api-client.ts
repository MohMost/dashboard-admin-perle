// Thin fetch wrapper for the PERLEDESLYS backend (NestJS). Attaches the admin
// JWT (set by the auth store on login / rehydrate) and normalises errors.
// Routes live under /api. See BACKEND_PLAN.md Phase 4.

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// The token lives here (set by auth.store) rather than being imported from the
// store, to avoid a circular dependency (store → auth.service → api-client).
let authToken: string | null = null
export function setAuthToken(token: string | null) {
  authToken = token
}

// When an AUTHENTICATED request comes back 401, the token is invalid/expired
// (e.g. a stale token left in localStorage from an older session). Clear the
// persisted session and bounce to /login so the app can't get stuck sending a
// dead token on every call. `auth-storage` is the zustand-persist key (see
// auth.store.ts). Not triggered by the login request itself (no token attached).
function clearSessionAndRedirect() {
  authToken = null
  try {
    localStorage.removeItem('auth-storage')
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

export class ApiError extends Error {
  status: number
  code?: string
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    throw new ApiError('Impossible de joindre le serveur.', 0, 'NETWORK')
  }

  const json: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && authToken) {
      clearSessionAndRedirect()
    }
    const err = (json ?? {}) as { message?: string | string[]; code?: string }
    const message = Array.isArray(err.message)
      ? err.message.join(' ')
      : (err.message ?? 'Une erreur est survenue.')
    throw new ApiError(message, res.status, err.code)
  }
  return json as T
}
