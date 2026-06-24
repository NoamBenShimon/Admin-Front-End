/**
 * @fileoverview Client-side API service
 *
 * The single entry point every client component uses to talk to the system.
 * Each function is wired through {@link withFallback}, which picks between the
 * real backend (proxied by the Next.js `/api/*` routes) and the in-memory
 * {@link mockStore}:
 *
 * - `NEXT_PUBLIC_USE_MOCKS` unset or `"true"` (default): everything is served by
 *   the mock store, so the admin panel is fully functional with no backend.
 * - `NEXT_PUBLIC_USE_MOCKS="false"`: real calls are made; if the backend is
 *   unreachable or hasn't implemented an endpoint yet (network error / 5xx /
 *   501), that one call transparently falls back to the mock. Real 4xx errors
 *   (validation, auth, not-found) surface to the caller.
 *
 * Flip the whole app from mock to live by changing that one variable.
 *
 * @module services/api
 */

import type {
  AnalyticsSummary,
  AuthStatusResponse,
  BalanceResponse,
  Equipment,
  EquipmentPayload,
  Grade,
  GradePayload,
  GradeRequirements,
  ImportResult,
  LoginCredentials,
  LoginResponse,
  Order,
  OrderFilters,
  ParentUser,
  ParentUserPayload,
  ParentUserUpdatePayload,
  PaymentsResponse,
  RefundResult,
  RequirementsUpdatePayload,
  School,
  SchoolPayload,
} from '@/types/api';
import { mockStore } from './mock/store';

/** Base URL for the Next.js API routes (same-origin by default). */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

/** When true (the default), all data comes from the in-memory mock store. */
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== 'false';

/** Custom error carrying the HTTP status of a failed API call. */
export class ApiRequestError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
  }
}

/** Generic fetch wrapper against the Next.js API routes. */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (error) {
    // Network-level failure (backend/Next route unreachable).
    throw new ApiRequestError(
      error instanceof Error ? error.message : 'Network error occurred',
    );
  }

  let data: unknown;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const record = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : null;
    const message =
      (record && typeof record.error === 'string' && record.error) ||
      (record && typeof record.message === 'string' && record.message) ||
      (typeof data === 'string' && data) ||
      `Request failed with status ${response.status}`;
    throw new ApiRequestError(message, response.status);
  }

  // Unwrap the `{ success, data }` envelope used by the API routes.
  if (typeof data === 'object' && data !== null && 'data' in data) {
    return (data as { data: T }).data;
  }
  return data as T;
}

/** Should a failed real call fall back to the mock store? */
function shouldFallback(error: unknown): boolean {
  if (!(error instanceof ApiRequestError)) return true; // network / parse error
  const s = error.statusCode;
  return s === undefined || s === 501 || s === 502 || s === 503 || s === 504;
}

/**
 * Run `real` against the backend, or `mock` when mocks are forced or the
 * backend can't serve the call. See the module docstring for the policy.
 */
async function withFallback<T>(real: () => Promise<T>, mock: () => Promise<T> | T): Promise<T> {
  if (USE_MOCKS) return mock();
  try {
    return await real();
  } catch (error) {
    if (shouldFallback(error)) {
      console.warn('[api] backend unavailable — using mock data:', error);
      return mock();
    }
    throw error;
  }
}

function toQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

// =============================================================================
// Authentication
// =============================================================================

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  return withFallback(
    () => apiFetch<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    () => mockStore.login(credentials.username, credentials.password),
  );
}

export async function logout(): Promise<void> {
  return withFallback(
    () => apiFetch<void>('/auth/logout', { method: 'POST' }),
    () => mockStore.logout(),
  );
}

export async function checkAuth(): Promise<AuthStatusResponse> {
  return withFallback(
    () => apiFetch<AuthStatusResponse>('/auth/status', { method: 'GET' }),
    async () => {
      const session = await mockStore.authStatus();
      return session
        ? { authenticated: true, userid: session.userid, username: session.username, role: session.role }
        : { authenticated: false };
    },
  );
}

// =============================================================================
// Schools
// =============================================================================

export async function getSchools(): Promise<School[]> {
  return withFallback(() => apiFetch<School[]>('/schools'), () => mockStore.listSchools());
}

export async function getSchoolById(id: string): Promise<School | null> {
  return withFallback(() => apiFetch<School>(`/schools/${id}`), () => mockStore.getSchool(id));
}

export async function createSchool(payload: SchoolPayload): Promise<School> {
  return withFallback(
    () => apiFetch<School>('/schools', { method: 'POST', body: JSON.stringify(payload) }),
    () => mockStore.createSchool(payload.name, payload.nameHe),
  );
}

export async function updateSchool(id: string, payload: SchoolPayload): Promise<School> {
  return withFallback(
    () => apiFetch<School>(`/schools/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    () => mockStore.updateSchool(id, payload.name, payload.nameHe),
  );
}

export async function deleteSchool(id: string): Promise<void> {
  return withFallback(
    () => apiFetch<void>(`/schools/${id}`, { method: 'DELETE' }),
    () => mockStore.deleteSchool(id),
  );
}

// =============================================================================
// Grades
// =============================================================================

export async function getGradesBySchool(schoolId: string): Promise<Grade[]> {
  return withFallback(
    () => apiFetch<Grade[]>(`/grades${toQuery({ school_id: schoolId })}`),
    () => mockStore.listGradesBySchool(schoolId),
  );
}

export async function getGradeById(id: string): Promise<Grade | null> {
  return withFallback(() => apiFetch<Grade>(`/grades/${id}`), () => mockStore.getGrade(id));
}

export async function createGrade(payload: GradePayload): Promise<Grade> {
  return withFallback(
    () => apiFetch<Grade>('/grades', { method: 'POST', body: JSON.stringify(payload) }),
    () => mockStore.createGrade(payload.schoolId, payload.name, payload.nameHe),
  );
}

export async function updateGrade(id: string, name: string, nameHe?: string): Promise<Grade> {
  const body = nameHe === undefined ? { name } : { name, nameHe };
  return withFallback(
    () => apiFetch<Grade>(`/grades/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    () => mockStore.updateGrade(id, name, nameHe),
  );
}

export async function deleteGrade(id: string): Promise<void> {
  return withFallback(
    () => apiFetch<void>(`/grades/${id}`, { method: 'DELETE' }),
    () => mockStore.deleteGrade(id),
  );
}

// =============================================================================
// Equipment catalog
// =============================================================================

export async function getEquipment(): Promise<Equipment[]> {
  return withFallback(() => apiFetch<Equipment[]>('/equipment'), () => mockStore.listEquipment());
}

export async function getEquipmentById(id: string): Promise<Equipment | null> {
  return withFallback(() => apiFetch<Equipment>(`/equipment/${id}`), () => mockStore.getEquipmentItem(id));
}

export async function createEquipment(payload: EquipmentPayload): Promise<Equipment> {
  return withFallback(
    () => apiFetch<Equipment>('/equipment', { method: 'POST', body: JSON.stringify(payload) }),
    () => mockStore.createEquipment(payload.name, payload.price, payload.nameHe),
  );
}

export async function updateEquipment(id: string, payload: Partial<EquipmentPayload>): Promise<Equipment> {
  return withFallback(
    () => apiFetch<Equipment>(`/equipment/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    () => mockStore.updateEquipment(id, payload),
  );
}

export async function deleteEquipment(id: string): Promise<void> {
  return withFallback(
    () => apiFetch<void>(`/equipment/${id}`, { method: 'DELETE' }),
    () => mockStore.deleteEquipment(id),
  );
}

// =============================================================================
// Grade requirements (a grade's equipment list)
// =============================================================================

export async function getGradeRequirements(gradeId: string): Promise<GradeRequirements> {
  return withFallback(
    () => apiFetch<GradeRequirements>(`/grades/${gradeId}/requirements`),
    () => mockStore.getGradeRequirements(gradeId),
  );
}

export async function updateGradeRequirements(
  gradeId: string,
  payload: RequirementsUpdatePayload,
): Promise<GradeRequirements> {
  return withFallback(
    () => apiFetch<GradeRequirements>(`/grades/${gradeId}/requirements`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
    () => mockStore.setGradeRequirements(gradeId, payload.items),
  );
}

// =============================================================================
// Parent users
// =============================================================================

export async function getParents(): Promise<ParentUser[]> {
  return withFallback(() => apiFetch<ParentUser[]>('/users'), () => mockStore.listParents());
}

export async function createParent(payload: ParentUserPayload): Promise<ParentUser> {
  return withFallback(
    () => apiFetch<ParentUser>('/users', { method: 'POST', body: JSON.stringify(payload) }),
    () => mockStore.createParent(payload.username, payload.password),
  );
}

export async function updateParent(id: string, payload: ParentUserUpdatePayload): Promise<ParentUser> {
  return withFallback(
    () => apiFetch<ParentUser>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    () => mockStore.updateParent(id, payload),
  );
}

export async function deleteParent(id: string): Promise<void> {
  return withFallback(
    () => apiFetch<void>(`/users/${id}`, { method: 'DELETE' }),
    () => mockStore.deleteParent(id),
  );
}

// =============================================================================
// Orders
// =============================================================================

export async function getOrders(filters: OrderFilters = {}): Promise<Order[]> {
  const query = toQuery({
    school_id: filters.schoolId,
    grade_id: filters.gradeId,
    user_id: filters.userId,
    from: filters.from,
    to: filters.to,
  });
  return withFallback(() => apiFetch<Order[]>(`/orders${query}`), () => mockStore.listOrders(filters));
}

export async function getOrderById(id: string): Promise<Order | null> {
  return withFallback(() => apiFetch<Order>(`/orders/${id}`), () => mockStore.getOrder(id));
}

// =============================================================================
// Analytics
// =============================================================================

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  return withFallback(() => apiFetch<AnalyticsSummary>('/analytics/summary'), () => mockStore.analyticsSummary());
}

// =============================================================================
// Payments (Stripe)
// =============================================================================
//
// Money data never silently falls back to mock in live mode — a backend/Stripe
// error surfaces to the caller rather than showing fake figures. Mock data is
// used only when the whole app is in mock mode.

export async function getPayments(): Promise<PaymentsResponse> {
  if (USE_MOCKS) return mockStore.listPayments();
  return apiFetch<PaymentsResponse>('/payments');
}

export async function getStripeBalance(): Promise<BalanceResponse> {
  if (USE_MOCKS) return mockStore.stripeBalance();
  return apiFetch<BalanceResponse>('/payments/balance');
}

export async function refundPayment(id: string): Promise<RefundResult> {
  if (USE_MOCKS) return mockStore.refundPayment(id);
  return apiFetch<RefundResult>(`/payments/${id}/refund`, { method: 'POST' });
}

// =============================================================================
// CSV import
// =============================================================================

export async function importCsv(file: File): Promise<ImportResult> {
  if (USE_MOCKS) {
    return mockStore.importCsv(await file.text());
  }
  const form = new FormData();
  form.append('file', file);
  try {
    const response = await fetch(`${API_BASE}/import`, {
      method: 'POST',
      body: form,
      credentials: 'include',
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status >= 500 || response.status === 501) {
        return mockStore.importCsv(await file.text());
      }
      const message =
        (data && typeof data.error === 'string' && data.error) || `Import failed with status ${response.status}`;
      throw new ApiRequestError(message, response.status);
    }
    return (data && 'data' in data ? data.data : data) as ImportResult;
  } catch (error) {
    if (error instanceof ApiRequestError) throw error;
    return mockStore.importCsv(await file.text());
  }
}

// =============================================================================
// Utilities
// =============================================================================

/** True if the error is an authentication/authorization failure. */
export function isAuthError(error: unknown): boolean {
  return error instanceof ApiRequestError && (error.statusCode === 401 || error.statusCode === 403);
}
